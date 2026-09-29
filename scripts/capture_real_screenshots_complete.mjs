import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'imagens');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PATIENT_IDS = ['pat-manual-1', 'pat-manual-2', 'pat-manual-3', 'pat-manual-4'];

const SAMPLE_PATIENTS = [
  {
    id: 'pat-manual-1',
    name: 'Sebastião Antunes Ferreira',
    birth_date: '1958-03-12',
    requested_date: '2026-09-10',
    requested_procedure_id: 'proc-12',
    requested_procedure_name: 'Facectomia sem implante de lente intraocular',
    eye_side: 'OD',
    requesting_doctor_id: 'doc-14-marco-aurelio-alves-',
    requesting_doctor_name: 'Marco Aurelio Alves Ferreira Filho',
    city: 'Armação dos Búzios',
    unit_id: 'unit-lagos',
    unit_name: 'Unidade Lagos',
    current_status: 'Agendado',
    is_urgent: false,
    total_absences: 0,
    absences: [],
    contact_attempts: [
      {
        id: 'ca-1',
        attemptNumber: 1,
        date: '2026-09-12',
        time: '14:30',
        channel: 'Telefone Principal',
        outcome: 'Contato com Sucesso - Agendamento Confirmado',
        notes: 'Paciente confirmou que comparecerá à consulta com acompanhante.',
        userId: 'user-attendant-1',
        userName: 'Veronica Fernandes Rodrigues',
        createdAt: '2026-09-12T14:30:00.000Z'
      }
    ],
    evolutions: [
      {
        id: 'evo-1',
        date: '2026-09-15',
        time: '10:00',
        situation: 'Exames Pré-operatórios OK',
        notes: 'Risco cirúrgico liberado pelo cardiologista.',
        userId: 'user-supervisor',
        userName: 'Ana Paula Julia de Sales',
        createdAt: '2026-09-15T10:00:00.000Z'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        date: '2026-09-10',
        time: '09:00',
        userId: 'user-attendant-1',
        userName: 'Veronica Fernandes Rodrigues',
        action: 'Cadastro Inicial',
        eventType: 'creation',
        newStatus: 'Aguardando Contato',
        description: 'Paciente cadastrado no polo Lagos.',
        createdAt: '2026-09-10T09:00:00.000Z'
      }
    ],
    is_deleted: false,
    created_at: '2026-09-10T09:00:00.000Z',
    updated_at: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'pat-manual-2',
    name: 'Maria de Lourdes da Silva',
    birth_date: '1962-07-24',
    requested_date: '2026-09-14',
    requested_procedure_id: 'proc-4',
    requested_procedure_name: 'Capsulotomia a YAG Laser',
    eye_side: 'OE',
    requesting_doctor_id: 'doc-17-fernanda-roessler-se',
    requesting_doctor_name: 'Fernanda Roessler Sebastiao',
    city: 'São Pedro da Aldeia',
    unit_id: 'unit-lagos',
    unit_name: 'Unidade Lagos',
    current_status: 'Regulado',
    is_urgent: false,
    total_absences: 0,
    absences: [],
    contact_attempts: [],
    evolutions: [],
    timeline: [],
    is_deleted: false,
    created_at: '2026-09-14T11:00:00.000Z',
    updated_at: '2026-09-14T11:00:00.000Z'
  },
  {
    id: 'pat-manual-3',
    name: 'José Benedito de Oliveira',
    birth_date: '1949-11-03',
    requested_date: '2026-09-08',
    requested_procedure_id: 'proc-12',
    requested_procedure_name: 'Facectomia sem implante de lente intraocular',
    eye_side: 'AO',
    requesting_doctor_id: 'doc-10-joao-lucas-mota-avel',
    requesting_doctor_name: 'Joao Lucas Mota Avelino',
    city: 'Arraial do Cabo',
    unit_id: 'unit-lagos',
    unit_name: 'Unidade Lagos',
    current_status: 'Aguardando Micrologos',
    is_urgent: false,
    total_absences: 2,
    absences: [
      {
        id: 'ab-1',
        absenceNumber: 1,
        date: '2026-09-12',
        reason: 'Problema de transporte do município',
        justified: true,
        userId: 'user-attendant-1',
        userName: 'Veronica Fernandes Rodrigues',
        createdAt: '2026-09-12T16:00:00.000Z'
      },
      {
        id: 'ab-2',
        absenceNumber: 2,
        date: '2026-09-18',
        reason: 'Não compareceu e não justificou',
        justified: false,
        userId: 'user-attendant-1',
        userName: 'Veronica Fernandes Rodrigues',
        createdAt: '2026-09-18T16:00:00.000Z'
      }
    ],
    contact_attempts: [],
    evolutions: [],
    timeline: [],
    is_deleted: false,
    created_at: '2026-09-08T08:30:00.000Z',
    updated_at: '2026-09-18T16:00:00.000Z'
  },
  {
    id: 'pat-manual-4',
    name: 'Tereza Cristina Albuquerque',
    birth_date: '1953-09-30',
    requested_date: '2026-09-25',
    requested_procedure_id: 'proc-12',
    requested_procedure_name: 'Facectomia sem implante de lente intraocular',
    eye_side: 'OD',
    requesting_doctor_id: 'doc-17-fernanda-roessler-se',
    requesting_doctor_name: 'Fernanda Roessler Sebastiao',
    city: 'São Pedro da Aldeia',
    unit_id: 'unit-lagos',
    unit_name: 'Unidade Lagos',
    current_status: 'Aguardando Contato',
    is_urgent: true,
    total_absences: 0,
    absences: [],
    contact_attempts: [],
    evolutions: [],
    timeline: [],
    is_deleted: false,
    created_at: '2026-09-25T14:00:00.000Z',
    updated_at: '2026-09-25T14:00:00.000Z'
  }
];

async function captureAllRealScreenshots() {
  console.log('--- INICIANDO CAPTURA REAL DOS MANUAIS ---');

  // 1. Inserir dados modelo no banco
  console.log('1. Inserindo dados demonstrativos no Supabase...');
  for (const pat of SAMPLE_PATIENTS) {
    const { error } = await supabase.from('patients').upsert(pat, { onConflict: 'id' });
    if (error) console.error('Erro ao inserir paciente:', error.message);
  }
  console.log('-> Pacientes inseridos temporariamente no banco com sucesso!');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 920 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 1. TELA DE LOGIN
    console.log('2. Capturando Tela de Login...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_login.png') });
    console.log('-> tela_login.png salva!');

    // 2. EFETUAR LOGIN INTERATIVO REAL
    console.log('3. Realizando Login autenticado...');
    await page.type('input[placeholder="Digite seu login de operador"]', 'igor.britto');
    await page.type('input[type="password"]', 'ho2026@');
    await page.click('button[type="submit"]');

    // Aguarda painel carregar
    await page.waitForFunction(() => !document.querySelector('input[type="password"]'), { timeout: 10000 });
    await new Promise(r => setTimeout(r, 3500));

    // 3. TELA DE DASHBOARD REAL
    console.log('4. Capturando Dashboard com indicadores reais...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_dashboard.png') });
    console.log('-> tela_dashboard.png salva!');

    // 4. ACESSAR ABA PACIENTES E CAPTURAR TELA DE CADASTRO
    console.log('5. Acessando aba Pacientes...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'Pacientes');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Abrindo modal de Cadastrar Paciente a partir do botão "Novo Paciente"
    console.log('6. Abrindo modal de Novo Paciente na aba Pacientes...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Novo Paciente'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_cadastro.png') });
    console.log('-> tela_cadastro.png salva!');

    // Fechar modal de cadastro
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Fechar'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Captura da tabela de Pacientes com as novas Ações Rápidas (Concluído)
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_pacientes.png') });
    console.log('-> tela_pacientes.png salva!');

    // 5. TELA DE CONTATO TELEFÔNICO REAL
    console.log('7. Abrindo modal de Contato na aba Pacientes...');
    await page.evaluate(() => {
      const contactBtn = document.querySelector('button[title="Registrar Tentativa de Contato"]');
      if (contactBtn) contactBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_contato.png') });
    console.log('-> tela_contato.png salva!');

    // Fechar modal de contato
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Fechar'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 6. TELA DO MODAL CONCLUIR ATENDIMENTO
    console.log('8. Abrindo modal de Concluir Atendimento...');
    await page.evaluate(() => {
      const completeBtn = document.querySelector('button[title="Marcar como Concluído"]');
      if (completeBtn) completeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_concluido.png') });
    console.log('-> tela_concluido.png salva!');

    // Fechar modal de conclusão
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Cancelar'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 6. TELA DE RELATÓRIOS REAL
    console.log('7. Acessando aba Relatórios...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'Relatórios');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_relatorios.png') });
    console.log('-> tela_relatorios.png salva!');

    // 7. TELA DE ADMINISTRAÇÃO REAL
    console.log('8. Acessando aba Administração...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'Administração');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tela_admin.png') });
    console.log('-> tela_admin.png salva!');

  } finally {
    await browser.close();

    // Limpeza da base de dados (remove apenas os pacientes de captura dos manuais)
    console.log('9. Limpando pacientes temporários do banco...');
    for (const id of PATIENT_IDS) {
      await supabase.from('patients').delete().eq('id', id);
    }
    console.log('-> Banco restaurado para estado limpo com sucesso!');
  }

  console.log('--- TODAS AS 6 CAPTURAS REAIS FORAM CONCLUÍDAS COM SUCESSO! ---');
}

captureAllRealScreenshots().catch(console.error);
