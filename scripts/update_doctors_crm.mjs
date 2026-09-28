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

const updates = [
  // Image 1
  { name: 'Laila Denise Oliveira de Andrade Kelm', crm: '52-01170783' },
  { name: 'Wilson Vial Filho', crm: '52.957.330' },
  { name: 'Karen de Souza Horta', crm: '52104339-0' },
  { name: 'Marco Aurelio Alves Ferreira Filho', crm: '52.0110593-0' },

  // Image 2
  { name: 'Danielle de Souza Cortez Godfroy', crm: '52649830' },
  { name: 'Fernanda Roessler Sebastiao', crm: '52.660.493' },
  { name: 'Joao Lucas Mota Avelino', crm: '520123020-4' },
  { name: 'Fernando Gomez Rodriguez', crm: '52926400' },
  { name: 'Gabriela Fassini Vilas Boas Chagas', crm: '52.779.270' },
  { name: 'Renata Monteiro Vieira', crm: '52.650.919' },
  { name: 'Risla de Oliveira Gomes', crm: '52.650.943' },
  { name: 'Kenedy de Almeida Alves', crm: '521213962' },

  // Image 3
  { name: 'Ana Cristina Pinheiro Leão', crm: '521005340' },
  { name: 'Miriã Bertoloto de Andrade', crm: '52016845' }
];

const newDoctors = [
  {
    id: 'doc-25-lais-bogado-hage-cha',
    name: 'Lais Bogado Hage Chahine Olsen',
    crm: '521142135',
    state_crm: 'RJ',
    unit_ids: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: ''
  },
  {
    id: 'doc-26-paloma-pereira-dutra',
    name: 'Paloma Pereira Dutra de Almeida',
    crm: '521164864',
    state_crm: 'RJ',
    unit_ids: ['unit-mage'],
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: ''
  }
];

async function run() {
  console.log('🔄 Atualizando CRMs dos médicos no Supabase...');

  // 1. Atualizar médicos existentes
  for (const item of updates) {
    const { data, error } = await supabase
      .from('doctors')
      .update({ crm: item.crm, state_crm: 'RJ' })
      .ilike('name', `%${item.name}%`)
      .select();

    if (error) {
      console.error(`❌ Erro ao atualizar ${item.name}:`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`⚠️ Nenhum médico encontrado com o nome: ${item.name}`);
    } else {
      console.log(`✅ ${data[0].name} atualizado com CRM: ${item.crm}`);
    }
  }

  // 2. Inserir novos médicos identificados na Unidade Magé
  for (const newDoc of newDoctors) {
    const { data: existing } = await supabase
      .from('doctors')
      .select('id, name')
      .ilike('name', `%${newDoc.name}%`);

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from('doctors')
        .update({ crm: newDoc.crm, unit_ids: newDoc.unit_ids, state_crm: 'RJ' })
        .eq('id', existing[0].id);
      if (error) {
        console.error(`❌ Erro ao atualizar ${newDoc.name}:`, error.message);
      } else {
        console.log(`✅ ${newDoc.name} já existia e foi atualizado com CRM: ${newDoc.crm}`);
      }
    } else {
      const { error } = await supabase.from('doctors').insert(newDoc);
      if (error) {
        console.error(`❌ Erro ao inserir ${newDoc.name}:`, error.message);
      } else {
        console.log(`✅ Novo médico cadastrado: ${newDoc.name} (CRM: ${newDoc.crm})`);
      }
    }
  }

  // 3. Exibir conferência final
  const { data: allDocs } = await supabase
    .from('doctors')
    .select('id, name, crm, state_crm, unit_ids, active')
    .order('name');

  console.log('\n📋 CONFERÊNCIA FINAL DOS MÉDICOS NO BANCO DE DADOS:');
  console.table(allDocs);
}

run().catch(console.error);
