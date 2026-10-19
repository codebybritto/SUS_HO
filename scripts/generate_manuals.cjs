const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const IMAGES_DIR = path.resolve(DOCS_DIR, 'imagens');
const LOGO_SVG_PATH = path.resolve(__dirname, '..', 'public', 'logo.svg');

// Base64 helper
function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

// Read Logo
let logoBase64 = '';
if (fs.existsSync(LOGO_SVG_PATH)) {
  logoBase64 = getBase64Image(LOGO_SVG_PATH);
}

// Base CSS
const PDF_STYLES = `
  @page {
    size: A4;
    margin: 16mm 14mm 18mm 14mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    font-size: 10pt;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
  }

  /* Header Cover Banner */
  .manual-header-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #091322 0%, #0f2444 60%, #1e3a8a 100%);
    border-radius: 12px;
    color: #ffffff;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #1e40af;
  }

  .manual-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .manual-header-logo {
    height: 48px;
    width: auto;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }

  .manual-header-text h1 {
    font-size: 16pt;
    font-weight: 800;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.3px;
    border: none;
    padding: 0;
  }

  .manual-header-text h1 span {
    color: #38bdf8;
  }

  .manual-header-text p {
    font-size: 8.5pt;
    color: #94a3b8;
    margin: 2px 0 0 0;
    font-weight: 500;
  }

  .manual-header-badge {
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid #38bdf8;
    color: #7dd3fc;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: right;
  }

  /* Profile Meta Box */
  .profile-meta-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0284c7;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .meta-item {
    font-size: 8.5pt;
  }

  .meta-item strong {
    color: #0f172a;
    display: block;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .meta-item span {
    color: #334155;
    font-weight: 600;
  }

  /* Headings */
  h1 {
    font-size: 17pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    letter-spacing: -0.4px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 22px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 1.5px solid #cbd5e1;
    letter-spacing: -0.2px;
    page-break-after: avoid;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  h4 {
    font-size: 10pt;
    font-weight: 700;
    color: #0369a1;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }

  /* Lists */
  ul, ol {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 22px;
  }

  li {
    margin-bottom: 4px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 16px 0;
    font-size: 8.5pt;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    overflow: hidden;
    page-break-inside: avoid;
  }

  th {
    background: #0f1d33;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid #cbd5e1;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  tr:last-child td {
    border-bottom: none;
  }

  /* Callout Boxes */
  blockquote {
    margin: 14px 0;
    padding: 10px 14px;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
    background-color: #eff6ff;
    color: #1e3a8a;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  blockquote p {
    margin: 0;
  }

  blockquote.warning {
    border-left-color: #f59e0b;
    background-color: #fefce8;
    color: #78350f;
  }

  blockquote.danger {
    border-left-color: #ef4444;
    background-color: #fef2f2;
    color: #991b1b;
  }

  blockquote.info {
    border-left-color: #0284c7;
    background-color: #f0f9ff;
    color: #075985;
  }

  blockquote.success {
    border-left-color: #10b981;
    background-color: #f0fdf4;
    color: #065f46;
  }

  /* Code / Pre */
  code {
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8.5pt;
    border: 1px solid #e2e8f0;
  }

  /* Mockup Frame for Screenshots */
  .screenshot-card {
    margin: 16px 0 20px 0;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    page-break-inside: avoid;
  }

  .screenshot-bar {
    background: #f1f5f9;
    border-bottom: 1px solid #cbd5e1;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .window-dots {
    display: flex;
    gap: 5px;
  }

  .window-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }

  .window-title {
    font-size: 7.5pt;
    color: #64748b;
    font-family: monospace;
    font-weight: 600;
  }

  .screenshot-body {
    padding: 0;
    background-color: #0b1329;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .screenshot-body img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .screenshot-caption {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 6px 12px;
    font-size: 8pt;
    color: #475569;
    font-weight: 600;
    text-align: center;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 12px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
  .badge-cyan { background: #cffafe; color: #0e7490; border: 1px solid #a5f3fc; }
  .badge-green { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
  .badge-yellow { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
  .badge-pink { background: #fce7f3; color: #9d174d; border: 1px solid #fbcfe8; }
  .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

  /* Utility */
  .page-break {
    page-break-after: always;
  }
`;

function processMarkdownToHtml(mdContent, title, profileRole, profileDesc) {
  // Convert images to custom screenshot cards with base64
  let processedMd = mdContent;

  // Custom renderer for images
  const renderer = new marked.Renderer();

  renderer.image = function ({ href, title, text }) {
    let cleanHref = href;
    // Resolve relative path
    let localPath = '';
    if (cleanHref.startsWith('./imagens/')) {
      localPath = path.resolve(DOCS_DIR, cleanHref);
    } else if (cleanHref.includes('imagens/')) {
      localPath = path.resolve(DOCS_DIR, cleanHref.slice(cleanHref.indexOf('imagens/')));
    } else {
      localPath = path.resolve(DOCS_DIR, cleanHref);
    }

    const base64Src = getBase64Image(localPath);
    const finalSrc = base64Src || cleanHref;
    const caption = text || title || 'Visualização do Sistema';

    return `
      <div class="screenshot-card">
        <div class="screenshot-bar">
          <div class="window-dots">
            <span class="window-dot dot-red"></span>
            <span class="window-dot dot-yellow"></span>
            <span class="window-dot dot-green"></span>
          </div>
          <div class="window-title">http://regula-oftalmo.saude.rj.gov.br • Ambiente Oficial</div>
          <div style="width: 30px;"></div>
        </div>
        <div class="screenshot-body">
          <img src="${finalSrc}" alt="${caption}" />
        </div>
        <div class="screenshot-caption">📷 ${caption}</div>
      </div>
    `;
  };

  // Convert markdown to HTML
  let htmlBody = marked.parse(processedMd, { renderer });

  // Post process blockquotes into styled alert cards
  htmlBody = htmlBody.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, content) => {
    let cls = 'info';
    if (content.includes('⚠️') || content.includes('Atenção') || content.includes('Regra das 2 Faltas')) {
      cls = 'warning';
    } else if (content.includes('🚨') || content.includes('Urgente') || content.includes('Perigo')) {
      cls = 'danger';
    } else if (content.includes('💡') || content.includes('Dica') || content.includes('Importante')) {
      cls = 'info';
    } else if (content.includes('✅') || content.includes('Sucesso') || content.includes('Concluído')) {
      cls = 'success';
    }
    return `<blockquote class="${cls}">${content}</blockquote>`;
  });

  // Highlight status tags in text
  htmlBody = htmlBody
    .replace(/\bTOTAL\b/g, '<span class="badge badge-blue">TOTAL</span>')
    .replace(/\bAGENDADOS\b/g, '<span class="badge badge-cyan">AGENDADOS</span>')
    .replace(/\bREGULADOS\b/g, '<span class="badge badge-green">REGULADOS</span>')
    .replace(/\bMICROLOGOS\b/g, '<span class="badge badge-yellow">MICROLOGOS</span>')
    .replace(/\bSEM INTERAÇÃO\b/g, '<span class="badge badge-pink">SEM INTERAÇÃO</span>')
    .replace(/\bCASOS URGENTES\b/g, '<span class="badge badge-red">CASOS URGENTES</span>');

  // Strip initial redundant H1 from markdown if already in header banner
  htmlBody = htmlBody.replace(/<h1>.*?<\/h1>/i, '');

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${PDF_STYLES}</style>
    </head>
    <body>
      <div class="manual-header-banner">
        <div class="manual-header-left">
          ${logoBase64 ? `<img src="${logoBase64}" class="manual-header-logo" alt="Logo RegulaOftalmo" />` : ''}
          <div class="manual-header-text">
            <h1>Regula<span>Oftalmo</span> SUS - RJ</h1>
            <p>Secretaria de Estado de Saúde • Sistema de Regulação e Controle de Pacientes</p>
          </div>
        </div>
        <div class="manual-header-badge">
          Manual Oficial<br>
          <span style="font-size: 9pt; color: #ffffff;">${profileRole}</span>
        </div>
      </div>

      <div class="profile-meta-card">
        <div class="meta-item">
          <strong>Documento</strong>
          <span>${title}</span>
        </div>
        <div class="meta-item">
          <strong>Público-Alvo</strong>
          <span>${profileRole}</span>
        </div>
        <div class="meta-item">
          <strong>Versão do Sistema</strong>
          <span>v2.4 (Produção Homologada)</span>
        </div>
        <div class="meta-item">
          <strong>Data de Publicação</strong>
          <span>Outubro / 2026</span>
        </div>
        <div class="meta-item">
          <strong>Classificação</strong>
          <span>Uso Interno Operacional</span>
        </div>
      </div>

      ${htmlBody}
    </body>
    </html>
  `;

  return fullHtml;
}

async function generateAllPdfs() {
  console.log('Iniciando navegador Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const manuals = [
    {
      file: 'MANUAL_ATENDENTE.md',
      outputPdf: 'MANUAL_ATENDENTE.pdf',
      title: 'Manual Ilustrado de Utilização — Perfil Atendente',
      role: 'Atendente / Recepção',
      desc: 'Cadastro de pacientes, busca ativa de contatos, registro de faltas e conclusões de atendimento.'
    },
    {
      file: 'MANUAL_SUPERVISORA.md',
      outputPdf: 'MANUAL_SUPERVISORA.pdf',
      title: 'Manual Ilustrado de Gestão — Perfil Supervisora',
      role: 'Supervisora / Coordenação',
      desc: 'Gestão da fila cirúrgica, priorização manual, tratativa de casos Micrologos e exportação de relatórios.'
    },
    {
      file: 'MANUAL_ADMINISTRADOR.md',
      outputPdf: 'MANUAL_ADMINISTRADOR.pdf',
      title: 'Manual Ilustrado de Governança — Perfil Administrador',
      role: 'Administrador do Sistema',
      desc: 'Gestão de operadores, reset de senhas, parametrização de unidades de saúde e regras automáticas.'
    }
  ];

  for (const m of manuals) {
    const mdPath = path.resolve(DOCS_DIR, m.file);
    if (!fs.existsSync(mdPath)) {
      console.warn(`Arquivo ${m.file} não encontrado.`);
      continue;
    }

    console.log(`\nProcessando: ${m.file} -> ${m.outputPdf}...`);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const html = processMarkdownToHtml(mdContent, m.title, m.role, m.desc);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const outputPath = path.resolve(DOCS_DIR, m.outputPdf);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '14mm',
        bottom: '16mm',
        left: '14mm',
        right: '14mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 3px; font-family: -apple-system, sans-serif;">
          <span><strong>RegulaOftalmo SUS-RJ</strong> | ${m.title}</span>
          <span style="color: #64748b;">Ambiente de Produção Homologado</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center; border-top: 0.5px solid #e2e8f0; padding-top: 4px; font-family: -apple-system, sans-serif;">
          <span>Governo do Estado do Rio de Janeiro • Secretaria de Estado de Saúde</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `
    });

    await page.close();
    console.log(`✅ Sucesso! Gerado: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
  }

  // Also generate Consolidated Manual with all 3 manuals together!
  console.log('\nGerando Manual Completo Integrado (MANUAL_COMPLETO_GERAL.pdf)...');
  const allMd = [
    `# 📚 Manual Completo de Operação e Governança do Sistema`,
    `**Sistema Oficial de Regulação Oftalmológica (SUS - RJ)**\n\nEste documento consolida integralmente todos os manuais operacionais por perfil de acesso do sistema.\n\n---\n`,
    fs.readFileSync(path.resolve(DOCS_DIR, 'MANUAL_ATENDENTE.md'), 'utf8'),
    `\n\n<div class="page-break"></div>\n\n`,
    fs.readFileSync(path.resolve(DOCS_DIR, 'MANUAL_SUPERVISORA.md'), 'utf8'),
    `\n\n<div class="page-break"></div>\n\n`,
    fs.readFileSync(path.resolve(DOCS_DIR, 'MANUAL_ADMINISTRADOR.md'), 'utf8')
  ].join('\n\n');

  const consolidatedHtml = processMarkdownToHtml(
    allMd,
    'Manual Completo de Operação — Todos os Perfis',
    'Todos os Perfis (Atendente, Supervisora, Administrador)',
    'Documento técnico completo com todas as diretrizes operacionais e governança do SUS.'
  );

  const compPage = await browser.newPage();
  await compPage.setContent(consolidatedHtml, { waitUntil: 'networkidle0' });
  const compOutputPath = path.resolve(DOCS_DIR, 'MANUAL_COMPLETO_GERAL.pdf');
  await compPage.pdf({
    path: compOutputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 3px; font-family: -apple-system, sans-serif;">
        <span><strong>RegulaOftalmo SUS-RJ</strong> | Manual Completo Integrado</span>
        <span style="color: #64748b;">Ambiente de Produção Homologado</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center; border-top: 0.5px solid #e2e8f0; padding-top: 4px; font-family: -apple-system, sans-serif;">
        <span>Governo do Estado do Rio de Janeiro • Secretaria de Estado de Saúde</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `
  });
  await compPage.close();
  console.log(`✅ Sucesso! Gerado: ${compOutputPath} (${(fs.statSync(compOutputPath).size / 1024).toFixed(1)} KB)`);

  await browser.close();
  console.log('\n🎉 Todos os PDFs foram gerados com sucesso!');
}

generateAllPdfs().catch(err => {
  console.error('Erro na geração dos PDFs:', err);
  process.exit(1);
});
