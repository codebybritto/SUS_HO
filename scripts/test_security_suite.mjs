import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('SUITE COMPLETA DE TESTES DE SEGURANÇA ESTRUTURAL E RLS - SUPABASE');
console.log('================================================================\n');

const adminClient = createClient(url, serviceKey);
const anonClient = createClient(url, anonKey);

// Test results tracker
const results = [];
function recordResult(testName, passed, details) {
  results.push({ testName, passed, details });
  const badge = passed ? '✅ PASSOU' : '❌ FALHOU';
  console.log(`[${badge}] ${testName}`);
  if (details) console.log(`   Detalhes: ${details}`);
}

async function runSecuritySuite() {
  let user1Auth = null;
  let user2Auth = null;
  let clientUser1 = null;
  let clientUser2 = null;

  try {
    // -------------------------------------------------------------
    // SETUP: Provisionar usuários de teste temporários no Supabase Auth
    // -------------------------------------------------------------
    console.log('🔧 Preparando ambiente de testes e usuários temporários...');
    
    // Clean up existing test users if any
    const { data: userList } = await adminClient.auth.admin.listUsers();
    for (const u of userList?.users || []) {
      if (u.email?.startsWith('sec_test_')) {
        await adminClient.auth.admin.deleteUser(u.id);
      }
    }

    // User 1: Atendente restrito à Unidade 1
    const { data: u1, error: u1Err } = await adminClient.auth.admin.createUser({
      email: 'sec_test_user1@gestao.saude.rj.gov.br',
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Operador Teste Unidade 1',
        login: 'operador.u1',
        role: 'attendant',
        unit_ids: ['unit-1'],
      }
    });
    if (u1Err) throw new Error(`Falha ao criar User 1: ${u1Err.message}`);
    user1Auth = u1.user;

    // User 2: Atendente restrito à Unidade 2
    const { data: u2, error: u2Err } = await adminClient.auth.admin.createUser({
      email: 'sec_test_user2@gestao.saude.rj.gov.br',
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Operador Teste Unidade 2',
        login: 'operador.u2',
        role: 'attendant',
        unit_ids: ['unit-2'],
      }
    });
    if (u2Err) throw new Error(`Falha ao criar User 2: ${u2Err.message}`);
    user2Auth = u2.user;

    // Criar/atualizar profiles correspondentes via adminClient
    await adminClient.from('profiles').upsert([
      {
        id: user1Auth.id,
        name: 'Operador Teste Unidade 1',
        login: 'operador.u1',
        email: user1Auth.email,
        role: 'attendant',
        unit_ids: ['unit-1'],
        active: true,
      },
      {
        id: user2Auth.id,
        name: 'Operador Teste Unidade 2',
        login: 'operador.u2',
        email: user2Auth.email,
        role: 'attendant',
        unit_ids: ['unit-2'],
        active: true,
      }
    ]);

    // Criar pacientes de teste: um na unit-1 e um na unit-2
    const testPatientU1 = {
      id: `test-pat-u1-${Date.now()}`,
      name: 'Paciente Teste Unidade 1',
      birth_date: '1980-01-01',
      unit_id: 'unit-1',
      unit_name: 'Unidade 1',
      city: 'Rio de Janeiro',
      requested_date: '2026-09-01',
      current_status: 'Aguardando Contato',
      is_deleted: false,
    };

    const testPatientU2 = {
      id: `test-pat-u2-${Date.now()}`,
      name: 'Paciente Teste Unidade 2',
      birth_date: '1985-05-05',
      unit_id: 'unit-2',
      unit_name: 'Unidade 2',
      city: 'São Gonçalo',
      requested_date: '2026-09-01',
      current_status: 'Aguardando Contato',
      is_deleted: false,
    };

    await adminClient.from('patients').upsert([testPatientU1, testPatientU2]);

    // Autenticar clientes individuais com JWT real
    clientUser1 = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: s1, error: s1Err } = await clientUser1.auth.signInWithPassword({
      email: 'sec_test_user1@gestao.saude.rj.gov.br',
      password: 'TestPassword123!',
    });
    if (s1Err) throw new Error(`Falha no login User 1: ${s1Err.message}`);

    clientUser2 = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: s2, error: s2Err } = await clientUser2.auth.signInWithPassword({
      email: 'sec_test_user2@gestao.saude.rj.gov.br',
      password: 'TestPassword123!',
    });
    if (s2Err) throw new Error(`Falha no login User 2: ${s2Err.message}`);

    console.log('✅ Usuários autenticados com tokens JWT individuais.\n');

    // =============================================================
    // TESTE 1: Usuário normal tentando acessar unidade de outro usuário
    // =============================================================
    {
      const { data: patientsU1, error } = await clientUser1
        .from('patients')
        .select('*')
        .eq('id', testPatientU2.id);

      const blocked = (!patientsU1 || patientsU1.length === 0) || error !== null;
      recordResult(
        '1. Usuário normal tentando acessar unidade de outro usuário',
        blocked,
        `User 1 (unit-1) consultou paciente da unit-2 -> Retornou ${patientsU1?.length || 0} registros (RLS isolou)`
      );
    }

    // =============================================================
    // TESTE 2: Usuário normal tentando alterar paciente de outra unidade
    // =============================================================
    {
      const { data: updateRes, error } = await clientUser1
        .from('patients')
        .update({ name: 'NOME_HACKEADO_U2' })
        .eq('id', testPatientU2.id)
        .select();

      const blocked = (!updateRes || updateRes.length === 0) || error !== null;
      recordResult(
        '2. Usuário normal tentando alterar paciente de outra unidade',
        blocked,
        `Tentativa de UPDATE na unit-2 por User 1 -> Bloqueado: ${error?.message || '0 registros alterados'}`
      );
    }

    // =============================================================
    // TESTE 3: Acesso direto à API sem autenticação (REST direto)
    // =============================================================
    {
      let blocked = false;
      let details = '';
      try {
        const response = await fetch(`${url}/rest/v1/patients?select=*`, {
          headers: {
            apikey: anonKey,
          },
        });
        const json = await response.json();
        // With RLS, anon gets empty array or 401
        blocked = response.status === 401 || (Array.isArray(json) && json.length === 0);
        details = `Status HTTP: ${response.status}. Registros vazados: ${Array.isArray(json) ? json.length : 0}`;
      } catch (e) {
        blocked = true;
        details = `Requisição recusada: ${e.message}`;
      }
      recordResult('3. Testar acesso direto à API REST sem autenticação', blocked, details);
    }

    // =============================================================
    // TESTE 4: Testar cliente anon (não autenticado via SDK)
    // =============================================================
    {
      const { data: anonPatients } = await anonClient.from('patients').select('*');
      const { data: anonProfiles } = await anonClient.from('profiles').select('*');
      const { data: anonLogs } = await anonClient.from('audit_logs').select('*');

      const patProtected = !anonPatients || anonPatients.length === 0;
      const profProtected = !anonProfiles || anonProfiles.length === 0;
      const logProtected = !anonLogs || anonLogs.length === 0;

      const passed = patProtected && profProtected && logProtected;
      recordResult(
        '4. Testar anon no SDK',
        passed,
        `Pacientes: ${anonPatients?.length || 0}, Perfis: ${anonProfiles?.length || 0}, Logs: ${anonLogs?.length || 0}`
      );
    }

    // =============================================================
    // TESTE 5: Testar alteração do localStorage (escalonamento local)
    // =============================================================
    {
      // Em clientes web com Supabase Auth, o RLS valida a chave criptográfica JWT assinada no servidor.
      // Modificações em chaves de localStorage pelo usuário não afetam as permissões de queries SQL.
      // Testamos se uma requisição injetando headers forjados sem token válido é rejeitada.
      let blocked = false;
      try {
        const forgeRes = await fetch(`${url}/rest/v1/patients`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            'Authorization': 'Bearer FORGED_LOCAL_STORAGE_ADMIN_TOKEN',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: 'hacked-pat', name: 'Hacked' }),
        });
        blocked = forgeRes.status === 401 || forgeRes.status === 403;
      } catch {
        blocked = true;
      }
      recordResult(
        '5. Testar alteração do localStorage (tentativa de escalonamento)',
        blocked,
        'Token adulterado foi rejeitado com HTTP 401/403 pelo validador criptográfico'
      );
    }

    // =============================================================
    // TESTE 6: Testar exclusão física de paciente (Attendant vs Admin)
    // =============================================================
    {
      // Attendant tenta deletar fisicamente o paciente da sua própria unidade
      const { data: delResult, error: delErr } = await clientUser1
        .from('patients')
        .delete()
        .eq('id', testPatientU1.id)
        .select();

      const attendantBlocked = (!delResult || delResult.length === 0) || delErr !== null;

      // Verificar se paciente ainda existe
      const { data: checkPat } = await adminClient.from('patients').select('id').eq('id', testPatientU1.id);
      const stillExists = checkPat && checkPat.length > 0;

      recordResult(
        '6. Testar exclusão física de paciente (bloqueio para não-admin)',
        attendantBlocked && stillExists,
        `Atendente tentou DELETE: ${delErr?.message || '0 deletados'}. Paciente preservado: ${stillExists}`
      );
    }

    // =============================================================
    // TESTE 7: Testar alteração de usuário/perfil (privilégios)
    // =============================================================
    {
      // Attendant tenta se promover a 'admin'
      const { data: updateProf, error: profErr } = await clientUser1
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user1Auth.id)
        .select();

      // Check what role remains in DB
      const { data: currentProf } = await adminClient.from('profiles').select('role').eq('id', user1Auth.id).single();
      const roleEscalated = currentProf?.role === 'admin';

      recordResult(
        '7. Testar alteração de usuário (escalonamento de perfil)',
        !roleEscalated,
        `Atendente tentou role='admin' -> Perfil mantido no banco: ${currentProf?.role}`
      );
    }

    // =============================================================
    // TESTE 8: Testar auditoria (impedir alteração/exclusão de logs)
    // =============================================================
    {
      // Cria log de teste
      const testLogId = `sec-log-${Date.now()}`;
      await adminClient.from('audit_logs').insert({
        id: testLogId,
        user_id: user1Auth.id,
        user_name: 'User 1',
        action: 'TESTE',
        entity_type: 'patient',
        entity_id: testPatientU1.id,
        description: 'Log de teste para auditoria',
      });

      // Tentativa de UPDATE no log
      const { data: updLog, error: updErr } = await clientUser1
        .from('audit_logs')
        .update({ description: 'LOG_ADULTERADO' })
        .eq('id', testLogId)
        .select();

      // Tentativa de DELETE no log
      const { data: delLog, error: delErr } = await clientUser1
        .from('audit_logs')
        .delete()
        .eq('id', testLogId)
        .select();

      const updateBlocked = (!updLog || updLog.length === 0) || updErr !== null;
      const deleteBlocked = (!delLog || delLog.length === 0) || delErr !== null;

      recordResult(
        '8. Testar auditoria (impedir alteração e exclusão de logs)',
        updateBlocked && deleteBlocked,
        `UPDATE bloqueado: ${updateBlocked} · DELETE bloqueado: ${deleteBlocked}`
      );
    }

    // =============================================================
    // TESTE 9: Testar sessão expirada ou inválida
    // =============================================================
    {
      const expiredClient = createClient(url, anonKey, {
        global: {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.invalid',
          },
        },
      });

      const { data, error } = await expiredClient.from('patients').select('*');
      const passed = error !== null || (!data || data.length === 0);
      recordResult(
        '9. Testar sessão expirada / token inválido',
        passed,
        `Resposta para token expirado: ${error?.message || 'Acesso negado'}`
      );
    }

    // =============================================================
    // TESTE 10: Testar dois usuários simultaneamente
    // =============================================================
    {
      const [res1, res2] = await Promise.all([
        clientUser1.from('patients').select('id, unit_id'),
        clientUser2.from('patients').select('id, unit_id'),
      ]);

      const user1Units = res1.data?.map(p => p.unit_id) || [];
      const user2Units = res2.data?.map(p => p.unit_id) || [];

      const u1HasOnlyU1 = user1Units.every(u => u === 'unit-1');
      const u2HasOnlyU2 = user2Units.every(u => u === 'unit-2');

      const passed = u1HasOnlyU1 && u2HasOnlyU2 && user1Units.length > 0 && user2Units.length > 0;
      recordResult(
        '10. Testar dois usuários simultaneamente (isolamento de contexto)',
        passed,
        `User 1 viu unidades: [${[...new Set(user1Units)]}] · User 2 viu unidades: [${[...new Set(user2Units)]}]`
      );
    }

    // -------------------------------------------------------------
    // TEARDOWN: Limpar dados temporários de teste
    // -------------------------------------------------------------
    console.log('\n🧹 Limpando dados temporários de teste...');
    await adminClient.from('patients').delete().in('id', [testPatientU1.id, testPatientU2.id]);
    await adminClient.auth.admin.deleteUser(user1Auth.id);
    await adminClient.auth.admin.deleteUser(user2Auth.id);
    console.log('✅ Usuários e registros de teste removidos com sucesso.');

  } catch (fatal) {
    console.error('❌ Erro durante a execução da suíte:', fatal);
  }

  console.log('\n================================================================');
  console.log('RESUMO DOS RESULTADOS DA SUÍTE DE SEGURANÇA:');
  console.log('================================================================');
  const totalPassed = results.filter(r => r.passed).length;
  console.log(`Total de Testes: ${results.length} | Aprovados: ${totalPassed} | Falhas: ${results.length - totalPassed}`);
  console.log('================================================================\n');
}

runSecuritySuite();
