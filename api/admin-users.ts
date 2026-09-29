import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Configuração do Supabase incompleta no servidor (URL ou SERVICE_ROLE_KEY ausente).' }));
  }

  // 1. Verify caller authorization token
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
  }

  const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user: callerUser }, error: tokenErr } = await supabaseAuth.auth.getUser(token);
  if (tokenErr || !callerUser) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Sessão inválida ou expirada. Faça login novamente.' }));
  }

  // 2. Verify caller has admin role
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role, active')
    .eq('id', callerUser.id)
    .maybeSingle();

  if (!callerProfile || callerProfile.role !== 'admin' || !callerProfile.active) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ error: 'Acesso negado: apenas administradores ativos podem gerenciar operadores.' }));
  }

  // Helper for JSON response
  const sendJson = (code: number, data: any) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // 3. Dispatch action based on HTTP method
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    if (req.method === 'POST') {
      // CREATE USER
      const { name, login, email, password, role, unitIds, permissions, active, mustChangePassword } = body || {};

      if (!name || !login) {
        return sendJson(400, { error: 'Nome e login são obrigatórios.' });
      }

      const cleanLogin = String(login).trim().toLowerCase();
      const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanLogin}@gestao.saude.rj.gov.br`;
      const cleanPass = (password && String(password).trim().length >= 6) ? String(password).trim() : 'Saude2026@';

      // Check if user already exists
      const { data: existingProfiles } = await adminClient
        .from('profiles')
        .select('id, login, email')
        .or(`login.eq.${cleanLogin},email.eq.${cleanEmail}`);

      if (existingProfiles && existingProfiles.length > 0) {
        return sendJson(400, { error: `Já existe um operador com o login "${cleanLogin}" ou e-mail "${cleanEmail}".` });
      }

      // Create in Supabase Auth
      const { data: newAuth, error: createAuthErr } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPass,
        email_confirm: true,
        user_metadata: {
          name: String(name).trim(),
          login: cleanLogin,
          role: role || 'attendant',
          unit_ids: Array.isArray(unitIds) ? unitIds : [],
          permissions: permissions || {},
          must_change_password: Boolean(mustChangePassword),
        },
      });

      if (createAuthErr || !newAuth?.user) {
        return sendJson(400, { error: createAuthErr?.message || 'Falha ao criar credenciais no Supabase Auth.' });
      }

      const authId = newAuth.user.id;

      // Upsert profile
      const profileRow: any = {
        id: authId,
        name: String(name).trim(),
        login: cleanLogin,
        email: cleanEmail,
        role: role || 'attendant',
        unit_ids: Array.isArray(unitIds) ? unitIds : [],
        permissions: permissions || {},
        active: active !== false,
        must_change_password: Boolean(mustChangePassword),
        updated_at: new Date().toISOString(),
      };

      const { data: savedProfile, error: profErr } = await adminClient
        .from('profiles')
        .upsert(profileRow, { onConflict: 'id' })
        .select()
        .single();

      if (profErr) {
        // Rollback auth user
        await adminClient.auth.admin.deleteUser(authId);
        return sendJson(500, { error: `Falha ao criar perfil: ${profErr.message}` });
      }

      // Also upsert into system_users for compatibility
      try {
        await adminClient.from('system_users').upsert({
          id: authId,
          name: profileRow.name,
          login: profileRow.login,
          role: profileRow.role,
          active: profileRow.active,
          unit_ids: profileRow.unit_ids,
          permissions: profileRow.permissions,
          email: profileRow.email,
          must_change_password: Boolean(mustChangePassword),
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch {}

      return sendJson(201, {
        id: authId,
        name: savedProfile.name,
        login: savedProfile.login,
        email: savedProfile.email,
        role: savedProfile.role,
        unitIds: savedProfile.unit_ids || [],
        permissions: savedProfile.permissions || {},
        active: savedProfile.active,
        mustChangePassword: Boolean(mustChangePassword),
        createdAt: savedProfile.created_at,
      });
    }

    if (req.method === 'PUT') {
      // UPDATE USER
      const { id, name, role, unitIds, permissions, active, password, mustChangePassword } = body || {};
      if (!id) {
        return sendJson(400, { error: 'ID do usuário é obrigatório para atualização.' });
      }

      // Update auth user if password or metadata changed
      const updateData: any = {
        user_metadata: {
          name: name ? String(name).trim() : undefined,
          role: role || undefined,
          unit_ids: Array.isArray(unitIds) ? unitIds : undefined,
          permissions: permissions || undefined,
        },
      };
      if (password && String(password).trim().length >= 6) {
        updateData.password = String(password).trim();
      }

      try {
        await adminClient.auth.admin.updateUserById(id, updateData);
      } catch {}

      // Update profile
      const updateFields: any = {
        updated_at: new Date().toISOString(),
      };
      if (name) updateFields.name = String(name).trim();
      if (role) updateFields.role = role;
      if (unitIds) updateFields.unit_ids = unitIds;
      if (permissions) updateFields.permissions = permissions;
      if (typeof active === 'boolean') updateFields.active = active;
      if (typeof mustChangePassword === 'boolean') {
        updateFields.must_change_password = mustChangePassword;
        updateData.user_metadata.must_change_password = mustChangePassword;
      }

      const { data: updatedProf, error: updErr } = await adminClient
        .from('profiles')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (updErr) {
        return sendJson(500, { error: updErr.message });
      }

      // Update system_users
      try {
        await adminClient.from('system_users').update(updateFields).eq('id', id);
      } catch {}

      return sendJson(200, {
        id: updatedProf.id,
        name: updatedProf.name,
        login: updatedProf.login,
        email: updatedProf.email,
        role: updatedProf.role,
        unitIds: updatedProf.unit_ids || [],
        permissions: updatedProf.permissions || {},
        active: updatedProf.active,
        mustChangePassword: typeof mustChangePassword === 'boolean' ? mustChangePassword : Boolean(updatedProf.must_change_password),
        createdAt: updatedProf.created_at,
      });
    }

    if (req.method === 'DELETE') {
      // DELETE USER
      const urlObj = new URL(req.url, 'http://localhost');
      const userId = (urlObj.searchParams.get('id') || body?.id || '').trim();
      if (!userId) {
        return sendJson(400, { error: 'ID do usuário é obrigatório para exclusão.' });
      }

      if (userId === callerUser.id) {
        return sendJson(400, { error: 'Você não pode excluir sua própria conta de administrador.' });
      }

      // Delete from auth.users (cascades to profiles)
      const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(userId);
      if (delAuthErr) {
        return sendJson(500, { error: delAuthErr.message });
      }

      // Delete from system_users
      try {
        await adminClient.from('system_users').delete().eq('id', userId);
      } catch {}

      return sendJson(200, { success: true, message: 'Usuário excluído com sucesso.' });
    }

    if (req.method === 'PATCH') {
      // RESET PASSWORD
      const { id, newPassword, forceChange } = body || {};
      if (!id || !newPassword) {
        return sendJson(400, { error: 'ID do usuário e nova senha são obrigatórios.' });
      }

      if (String(newPassword).trim().length < 6) {
        return sendJson(400, { error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }

      const shouldForce = forceChange !== false;
      const { data: targetUser } = await adminClient.auth.admin.getUserById(id);
      const currentMeta = targetUser?.user?.user_metadata || {};

      const { error: resetErr } = await adminClient.auth.admin.updateUserById(id, {
        password: String(newPassword).trim(),
        user_metadata: {
          ...currentMeta,
          must_change_password: shouldForce,
        },
      });

      if (resetErr) {
        return sendJson(500, { error: resetErr.message });
      }

      try {
        await adminClient.from('profiles').update({ must_change_password: shouldForce }).eq('id', id);
      } catch {}
      try {
        await adminClient.from('system_users').update({ must_change_password: shouldForce }).eq('id', id);
      } catch {}

      return sendJson(200, { success: true, message: 'Senha redefinida com sucesso no Supabase Auth.' });
    }

    return sendJson(405, { error: 'Método não permitido.' });
  } catch (err: any) {
    console.error('Erro na API admin-users:', err);
    return sendJson(500, { error: err.message || 'Erro interno no servidor.' });
  }
}
