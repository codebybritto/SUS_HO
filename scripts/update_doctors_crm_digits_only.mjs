import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Lista completa dos novos CRMs de Lagos fornecidos na última imagem
const lagosUpdates = [
  { name: 'Fabio de Paula Lopes', crm: '521057812' },
  { name: 'Stefano Pinto de Lima Zvaig', crm: '52748480' },
  { name: 'Vitor Sartório Costa', crm: '521225634' },
  { name: 'Erica Magalhaes dos Santos', crm: '52963623' },
  { name: 'Renato Pinheiro Hilario de Souza', crm: '52916897' },
  { name: 'Gustavo Andrade Lopes', crm: '5201070010' },
  { name: 'José Carlos Vieira Romeiro', crm: '52236746' },
  { name: 'Guilherme Vieira Romeiro', crm: '521057553' },
  { name: 'Victória Vieira Romeiro', crm: '521138197' }
];

// Novos médicos de Lagos identificados na planilha
const newLagosDoctors = [
  {
    id: 'doc-27-thayane-azeredo-sil',
    name: 'Thayane Azeredo Silva',
    crm: '521041096',
    state_crm: 'RJ',
    unit_ids: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: ''
  },
  {
    id: 'doc-28-leticia-paola-kolln',
    name: 'Leticia Paola Kolln',
    crm: '5201174509',
    state_crm: 'RJ',
    unit_ids: ['unit-lagos'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: ''
  }
];

async function run() {
  console.log('🔄 Atualizando médicos de Lagos com os CRMs oficiais...');

  // 1. Atualizar médicos de Lagos
  for (const item of lagosUpdates) {
    const cleanCrm = item.crm.replace(/\D/g, '');
    const { data, error } = await supabase
      .from('doctors')
      .update({ crm: cleanCrm, state_crm: 'RJ' })
      .ilike('name', `%${item.name}%`)
      .select();

    if (error) {
      console.error(`❌ Erro ao atualizar ${item.name}:`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`⚠️ Nenhum médico encontrado para: ${item.name}`);
    } else {
      console.log(`✅ ${data[0].name} atualizado com CRM: ${cleanCrm}`);
    }
  }

  // 2. Inserir ou atualizar novas médicas de Lagos
  for (const doc of newLagosDoctors) {
    const { data: existing } = await supabase
      .from('doctors')
      .select('id, name')
      .ilike('name', `%${doc.name}%`);

    if (existing && existing.length > 0) {
      await supabase
        .from('doctors')
        .update({ crm: doc.crm, unit_ids: doc.unit_ids, state_crm: 'RJ' })
        .eq('id', existing[0].id);
      console.log(`✅ ${doc.name} já existia e foi atualizado com CRM: ${doc.crm}`);
    } else {
      const { error } = await supabase.from('doctors').insert(doc);
      if (error) {
        console.error(`❌ Erro ao inserir ${doc.name}:`, error.message);
      } else {
        console.log(`✅ Novo cadastro realizado: ${doc.name} (CRM: ${doc.crm})`);
      }
    }
  }

  // 3. Normalizar TODOS os médicos do banco para padrão SOMENTE NÚMEROS (sem pontos nem traços)
  console.log('\n🧹 Padronizando todos os CRMs para apenas números...');
  const { data: allCurrentDoctors, error: fetchErr } = await supabase
    .from('doctors')
    .select('id, name, crm');

  if (fetchErr) {
    console.error('Erro ao buscar médicos:', fetchErr.message);
    return;
  }

  for (const doc of allCurrentDoctors) {
    const digitsOnly = (doc.crm || '').replace(/\D/g, '');
    if (digitsOnly !== doc.crm) {
      await supabase
        .from('doctors')
        .update({ crm: digitsOnly })
        .eq('id', doc.id);
      console.log(`🔧 ${doc.name}: "${doc.crm}" -> "${digitsOnly}"`);
    }
  }

  // 4. Conferência final completa
  const { data: finalDocs } = await supabase
    .from('doctors')
    .select('id, name, crm, state_crm, unit_ids, active')
    .order('name');

  console.log(`\n📋 BASE FINAL ATUALIZADA (${finalDocs.length} MÉDICOS):`);
  console.table(finalDocs);
}

run().catch(console.error);
