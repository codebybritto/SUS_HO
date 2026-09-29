-- =========================================================================
-- FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS POR ADMINISTRADOR NO SUPABASE
-- Execute este script no SQL Editor do painel Supabase para ativar
-- a criação, redefinição de senha e exclusão de operadores diretamente no banco.
-- =========================================================================

-- 0. Certifica extensão pgcrypto ativa
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Garante que a função is_admin() existe e valida corretamente o administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT (
    (auth.jwt() ->> 'role' = 'service_role') OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND (active IS TRUE OR active IS NULL)
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- 2. Permite ao Admin criar usuário no auth.users, auth.identities e profiles
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_name TEXT,
  new_login TEXT,
  new_email TEXT,
  new_password TEXT,
  new_role TEXT,
  new_unit_ids JSONB,
  new_permissions JSONB
)
RETURNS JSONB AS $$
DECLARE
  new_id UUID;
  enc_pw TEXT;
  result JSONB;
BEGIN
  -- Apenas administradores autenticados e ativos podem executar
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem criar usuários';
  END IF;

  -- Verifica se login já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE login = new_login) THEN
    RAISE EXCEPTION 'Já existe um operador cadastrado com o login: %', new_login;
  END IF;

  -- Verifica se e-mail já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'Já existe uma conta cadastrada com o e-mail: %', new_email;
  END IF;

  new_id := gen_random_uuid();
  enc_pw := extensions.crypt(new_password, extensions.gen_salt('bf'));

  -- 2.1. Insere credenciais oficiais no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    new_email,
    enc_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'name', new_name,
      'login', new_login,
      'role', new_role,
      'unit_ids', new_unit_ids,
      'permissions', new_permissions
    ),
    NOW(),
    NOW()
  );

  -- 2.2. Insere na auth.identities para permitir login imediato por e-mail e senha
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_id::text,
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', new_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;

  -- 2.3. Insere ou atualiza o perfil em profiles
  INSERT INTO public.profiles (
    id, name, login, email, role, unit_ids, permissions, active, created_at, updated_at
  ) VALUES (
    new_id, new_name, new_login, new_email, new_role, new_unit_ids, new_permissions, true, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    login = EXCLUDED.login,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    unit_ids = EXCLUDED.unit_ids,
    permissions = EXCLUDED.permissions,
    active = true,
    updated_at = NOW();

  -- 2.4. Insere em system_users para compatibilidade legada
  INSERT INTO public.system_users (
    id, name, login, role, active, unit_ids, permissions, email, created_at
  ) VALUES (
    new_id::text, new_name, new_login, new_role, true, new_unit_ids, new_permissions, new_email, NOW()::text
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    login = EXCLUDED.login,
    role = EXCLUDED.role,
    unit_ids = EXCLUDED.unit_ids,
    permissions = EXCLUDED.permissions,
    email = EXCLUDED.email;

  SELECT to_jsonb(p) INTO result FROM public.profiles p WHERE p.id = new_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Redefinição de senha de operador por administrador
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem redefinir senhas';
  END IF;

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Exclusão de operador por administrador
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é permitido excluir sua própria conta de administrador';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
  DELETE FROM public.system_users WHERE id = target_user_id::text;
  -- profiles é excluído automaticamente via ON DELETE CASCADE
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Permissões de execução para usuários autenticados e service_role
GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_password(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated, service_role;

-- 6. Notifica o PostgREST para recarregar o cache de esquemas imediatamente
NOTIFY pgrst, 'reload schema';
