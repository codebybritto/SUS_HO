import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://jqgpxlydbijpujjnntci.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY é obrigatório!');
  process.exit(1);
}

const client = createClient(url, serviceKey);

// ==========================================
// 1. UNIDADES
// ==========================================
const units = [
  {
    id: 'unit-lagos',
    name: 'Unidade Lagos',
    code: 'POLO-LAGOS',
    cnes: '0000001',
    city: 'São Pedro da Aldeia',
    state: 'RJ',
    active: true,
    phone: '(22) 2621-1000',
    address: 'Região dos Lagos - RJ',
    manager_name: 'Gerência Regional Lagos',
    municipalities: ['Armação dos Búzios', 'São Pedro da Aldeia', 'Arraial do Cabo']
  },
  {
    id: 'unit-sjm',
    name: 'Unidade São João de Meriti',
    code: 'POLO-SJM',
    cnes: '0000002',
    city: 'São João de Meriti',
    state: 'RJ',
    active: true,
    phone: '(21) 2756-1000',
    address: 'São João de Meriti - RJ',
    manager_name: 'Gerência Regional SJM',
    municipalities: ['São João de Meriti']
  },
  {
    id: 'unit-mage',
    name: 'Unidade Magé',
    code: 'POLO-MAGE',
    cnes: '0000003',
    city: 'Magé',
    state: 'RJ',
    active: true,
    phone: '(21) 2633-1000',
    address: 'Magé - RJ',
    manager_name: 'Gerência Regional Magé',
    municipalities: ['Magé']
  }
];

// ==========================================
// 2. MUNICÍPIOS
// ==========================================
const municipalities = [
  { id: 'mun-buzios', name: 'Armação dos Búzios', state: 'RJ', active: true },
  { id: 'mun-spa', name: 'São Pedro da Aldeia', state: 'RJ', active: true },
  { id: 'mun-arraial', name: 'Arraial do Cabo', state: 'RJ', active: true },
  { id: 'mun-sjm', name: 'São João de Meriti', state: 'RJ', active: true },
  { id: 'mun-mage', name: 'Magé', state: 'RJ', active: true }
];

// ==========================================
// 3. MÉDICOS (UNIFICADOS)
// ==========================================
const doctors = [
  // Lagos
  { name: 'Fabio de Paula Lopes', unit_ids: ['unit-lagos'], crm: 'CRM-10000' },
  { name: 'Stefano Pinto de Lima Zvaig', unit_ids: ['unit-lagos'], crm: 'CRM-10001' },
  { name: 'Vitor Sartório Costa', unit_ids: ['unit-lagos'], crm: 'CRM-10002' },
  { name: 'Erica Magalhaes dos Santos', unit_ids: ['unit-lagos'], crm: 'CRM-10003' },
  { name: 'Renato Pinheiro Hilario de Souza', unit_ids: ['unit-lagos'], crm: 'CRM-10004' },
  { name: 'Gustavo Andrade Lopes', unit_ids: ['unit-lagos'], crm: 'CRM-10005' },
  { name: 'José Carlos Vieira Romeiro', unit_ids: ['unit-lagos'], crm: 'CRM-10006' },
  { name: 'Guilherme Vieira Romeiro', unit_ids: ['unit-lagos'], crm: 'CRM-10007' },
  { name: 'Victória Vieira Romeiro', unit_ids: ['unit-lagos'], crm: 'CRM-10008' },
  // Compartilhados Lagos + SJM
  { name: 'Joao Lucas Mota Avelino', unit_ids: ['unit-lagos', 'unit-sjm'], crm: '520123020-4' },
  { name: 'Laura Brito Fiszer Poly Ferreira', unit_ids: ['unit-lagos', 'unit-sjm'], crm: 'CRM-10010' },
  // Compartilhados Lagos + SJM + Magé
  { name: 'Kenedy de Almeida Alves', unit_ids: ['unit-lagos', 'unit-sjm', 'unit-mage'], crm: '521213962' },
  { name: 'Miriã Bertoloto de Andrade', unit_ids: ['unit-lagos', 'unit-sjm', 'unit-mage'], crm: '52016845' },
  { name: 'Marco Aurelio Alves Ferreira Filho', unit_ids: ['unit-lagos', 'unit-sjm', 'unit-mage'], crm: '52.0110593-0' },
  { name: 'Karen de Souza Horta', unit_ids: ['unit-lagos', 'unit-sjm', 'unit-mage'], crm: '52104339-0' },
  // SJM Exclusivos
  { name: 'Danielle de Souza Cortez Godfroy', unit_ids: ['unit-sjm'], crm: '52649830' },
  { name: 'Fernanda Roessler Sebastiao', unit_ids: ['unit-sjm'], crm: '52.660.493' },
  { name: 'Fernando Gomez Rodriguez', unit_ids: ['unit-sjm'], crm: '52926400' },
  { name: 'Gabriela Fassini Vilas Boas Chagas', unit_ids: ['unit-sjm'], crm: '52.779.270' },
  { name: 'Renata Monteiro Vieira', unit_ids: ['unit-sjm'], crm: '52.650.919' },
  { name: 'Risla de Oliveira Gomes', unit_ids: ['unit-sjm'], crm: '52.650.943' },
  // Magé Exclusivos
  { name: 'Laila Denise Oliveira de Andrade Kelm', unit_ids: ['unit-mage'], crm: '52-01170783' },
  { name: 'Wilson Vial Filho', unit_ids: ['unit-mage'], crm: '52.957.330' },
  { name: 'Ana Cristina Pinheiro Leão', unit_ids: ['unit-mage'], crm: '521005340' },
  { name: 'Lais Bogado Hage Chahine Olsen', unit_ids: ['unit-mage'], crm: '521142135' },
  { name: 'Paloma Pereira Dutra de Almeida', unit_ids: ['unit-mage'], crm: '521164864' }
];

// ==========================================
// 4. USUÁRIAS (RECEPCIONISTAS E SUPERVISORAS)
// ==========================================
const users = [
  // Lagos
  { name: 'Bruna Brum Goes Revelles', role: 'attendant', unitId: 'unit-lagos', login: 'bruna.revelles' },
  { name: 'Emanoelly Ferreira Vicente', role: 'attendant', unitId: 'unit-lagos', login: 'emanoelly.vicente' },
  { name: 'Ingrid Isabella Reis Costa', role: 'attendant', unitId: 'unit-lagos', login: 'ingrid.costa' },
  { name: 'Nathalia dos Santos Teixeira', role: 'attendant', unitId: 'unit-lagos', login: 'nathalia.teixeira' },
  { name: 'Raquel dos Santos Araujo', role: 'attendant', unitId: 'unit-lagos', login: 'raquel.araujo' },
  { name: 'Tailane Mello dos Santos Baptista', role: 'attendant', unitId: 'unit-lagos', login: 'tailane.baptista' },
  { name: 'Joana Raquel da Silva Magalhães', role: 'supervisor', unitId: 'unit-lagos', login: 'joana.magalhaes' },
  { name: 'Beatriz Soares do Rosário', role: 'supervisor', unitId: 'unit-lagos', login: 'beatriz.rosario' },
  // São João de Meriti
  { name: 'Gisele da Silva Copio', role: 'attendant', unitId: 'unit-sjm', login: 'gisele.copio' },
  { name: 'Carla Rejane Soares Gonçalves', role: 'attendant', unitId: 'unit-sjm', login: 'carla.goncalves' },
  { name: 'Anna Jessica de Mendonça Patricio', role: 'supervisor', unitId: 'unit-sjm', login: 'anna.patricio' },
  // Magé
  { name: 'Ana Lidia das Neves Silva Cardoso', role: 'attendant', unitId: 'unit-mage', login: 'ana.cardoso' },
  { name: 'Andressa Diniz Santos', role: 'attendant', unitId: 'unit-mage', login: 'andressa.santos' },
  { name: 'Ingrid Sousa dos Santos', role: 'attendant', unitId: 'unit-mage', login: 'ingrid.santos' },
  { name: 'Nathalia Correa Gomes', role: 'attendant', unitId: 'unit-mage', login: 'nathalia.gomes' },
  { name: 'Stephanni Raimundo Ferreira', role: 'attendant', unitId: 'unit-mage', login: 'stephanni.ferreira' },
  { name: 'Veronica Fernandes Rodrigues', role: 'attendant', unitId: 'unit-mage', login: 'veronica.rodrigues' },
  { name: 'Ana Paula Julia de Sales', role: 'supervisor', unitId: 'unit-mage', login: 'ana.sales' }
];

// ==========================================
// 5. PROCEDIMENTOS BRUTOS
// ==========================================
const rawLagosSPA = `
02.11.06.001-1 – Biometria ultrassônica (monocular)
02.11.06.002-0 – Biomicroscopia de fundo de olho
02.11.06.003-8 – Campimetria computadorizada ou manual com gráfico
04.05.05.002-0 – Capsulotomia a YAG Laser
02.11.06.005-4 – Ceratometria
04.05.05.004-6 – Ciclocriocoagulação/diatermia
Sem código SIGTAP – Cirurgia refrativa
03.01.01.007-2 – Consulta médica em atenção especializada
04.05.05.007-0 – Correção cirúrgica de hérnia de íris
04.05.01.007-9 – Exérese de calázio e outras pequenas lesões de pálpebra e supercílios
04.05.04.010-5 – Explante de lente intraocular
04.05.05.010-0 – Facectomia sem implante de lente intraocular
04.05.05.037-2 – Facoemulsificação com implante de LIO dobrável
04.05.05.011-9 – Facoemulsificação com implante de LIO rígida
04.05.03.004-5 – Fotocoagulação a laser
02.11.06.010-0 – Fundoscopia
02.11.06.011-9 – Gonioscopia
04.05.05.015-1 – Implante secundário de lente intraocular
03.03.05.023-3 – Injeção intravítrea
04.05.05.019-4 – Iridotomia a laser
02.11.06.012-7 – Mapeamento de retina
02.11.06.014-3 – Microscopia especular de córnea
04.05.03.019-3 – Pan-fotocoagulação de retina a laser
02.05.02.002-0 – Paquimetria ultrassônica
02.11.06.015-1 – Potencial de acuidade visual
04.05.03.022-3 – Remoção de óleo de silicone
04.05.04.021-0 – Reposicionamento de lente intraocular
02.11.06.017-8 – Retinografia colorida binocular
02.11.06.018-6 – Retinografia fluorescente binocular
04.05.03.007-0 – Retinopexia com introflexão escleral
04.05.03.021-5 – Retinopexia pneumática
04.17.01.006-0 – Sedação
04.05.05.028-3 – Substituição de lente intraocular
04.05.05.030-5 – Sutura de córnea
02.11.06.020-8 – Teste de provocação de glaucoma
02.11.06.022-4 – Teste de visão de cores
02.11.06.028-3 – Tomografia de coerência óptica – OCT
02.11.06.025-9 – Tonometria
02.11.06.026-7 – Topografia computadorizada de córnea
04.05.05.032-1 – Trabeculectomia
04.05.05.036-4 – Tratamento cirúrgico de pterígio
02.05.02.008-9 – Ultrassonografia de globo ocular
04.05.03.013-4 – Vitrectomia anterior
04.05.03.017-7 – Vitrectomia posterior com infusão de perfluorcarbono/óleo de silicone/endolaser
`;

const rawLagosArraial = `
03.01.01.007-2 – Consulta médica em atenção especializada
Sem código SIGTAP – Laser/agulhamento pós-cirúrgico de glaucoma
02.11.06.001-1 – Biometria ultrassônica (monocular)
04.05.05.001-1 – Capsulectomia posterior cirúrgica
04.05.05.003-8 – Cauterização de córnea
Sem código SIGTAP – Ciclofotocoagulação a laser
04.05.05.004-6 – Ciclocriocoagulação/diatermia
Sem código SIGTAP – Correção cirúrgica de enucleação de globo ocular
04.05.01.001-0 – Correção cirúrgica de entrópio e ectrópio
04.05.05.007-0 – Correção cirúrgica de hérnia de íris
04.05.05.006-2 – Correção de astigmatismo secundário
04.05.03.003-7 – Crioterapia ocular
04.05.01.003-6 – Dacriocistorrinostomia
04.05.01.018-4 – Dermatocalaze/tratamento cirúrgico de blefarocalase
04.05.01.004-4 – Drenagem de abscesso de pálpebra
04.05.04.006-7 – Enucleação de globo ocular
04.05.01.005-2 – Epilação a laser
04.05.01.006-0 – Epilação de cílios
04.05.04.007-5 – Evisceração de globo ocular
04.05.01.007-9 – Exérese de calázio e outras pequenas lesões da pálpebra e supercílios
04.05.05.008-9 – Exérese de tumor de conjuntiva
04.05.03.004-5 – Fotocoagulação a laser
04.05.03.019-3 – Pan-fotocoagulação de retina a laser
04.05.05.012-7 – Fototrabeculoplastia a laser
03.03.05.023-3 – Injeção intravítrea – Aflibercepte/Eylia
03.03.05.023-3 – Injeção intravítrea – Bevacizumabe/Avastin
03.03.05.023-3 – Injeção intravítrea – Ranibizumabe/Lucentis
04.05.04.013-0 – Injeção retrobulbar/peribulbar
04.05.05.016-0 – Injeção subconjuntival/subtenoniana
04.05.05.017-8 – Iridectomia cirúrgica
04.05.05.019-4 – Iridotomia a laser
02.11.06.012-7 – Mapeamento de retina
04.05.05.020-8 – Paracentese com lavagem/paracentese de câmara anterior
02.11.06.016-0 – Potencial visual evocado
02.11.06.015-1 – Potencial de acuidade visual/maculado
04.05.05.021-6 – Recobrimento conjuntival
04.05.01.011-7 – Reconstituição de canal lacrimal
04.05.04.016-4 – Reconstituição de parede da órbita
04.05.01.013-3 – Reconstituição total de pálpebra
04.05.03.022-3 – Remoção de óleo de silicone
04.05.03.007-0 – Retinopexia com introflexão escleral
02.11.06.017-8 – Retinografia colorida binocular
02.11.06.018-6 – Retinografia fluorescente binocular
04.05.03.021-5 – Retinopexia pneumática
04.05.05.025-9 – Retirada de corpo estranho da córnea
04.17.01.006-0 – Sedação
04.05.01.014-1 – Simblefaroplastia
04.05.01.016-8 – Sondagem de vias lacrimais
04.05.05.029-1 – Sutura de conjuntiva
04.05.05.030-5 – Sutura de córnea
04.05.03.009-6 – Sutura de esclera
04.05.01.017-6 – Sutura de pálpebras
02.11.06.020-8 – Teste de sobrecarga hídrica/teste de provocação de glaucoma
02.11.06.021-6 – Teste de Schirmer
02.11.06.023-2 – Teste ortóptico
02.11.06.024-0 – Teste para adaptação de lente de contato
02.11.06.028-3 – Tomografia de coerência óptica – OCT
04.05.05.012-7 – Trabeculoplastia/fototrabeculoplastia a laser
04.05.05.032-1 – Trabeculectomia
04.05.01.018-4 – Tratamento cirúrgico de blefarocalase
04.05.05.039-9 – Tratamento cirúrgico de deiscência de sutura de córnea
04.05.03.010-0 – Tratamento cirúrgico de deiscência de sutura de esclera
04.05.05.036-4 – Tratamento cirúrgico de pterígio
04.05.01.019-2 – Tratamento cirúrgico de triquíase com ou sem enxerto
04.05.04.019-9 – Tratamento cirúrgico de xantelasma
04.05.04.020-2 – Tratamento de ptose palpebral
04.05.03.013-4 – Vitrectomia anterior
04.05.03.017-7 – Vitrectomia via pars plana/posterior com infusão de perfluorcarbono, óleo de silicone e endolaser
Sem código SIGTAP – Cirurgia refrativa por PRK
`;

const rawLagosBuzios = `
03.01.01.007-2 – Consulta em setor especializado
03.01.01.007-2 – Avaliação oftalmológica
03.01.01.007-2 – Avaliação oftalmológica de emergência
Sem código SIGTAP – Acuidade visual laser
04.05.05.032-1 – Antiglaucomatose/Trabeculectomia
02.11.06.001-1 – Biometria ultrassônica
02.11.06.002-0 – Biomicroscopia de fundo de olho
Sem código SIGTAP – Blefarorrafia definitiva
04.05.01.007-9 – Calázio
02.11.06.004-6 – Campimetria manual com gráfico
02.11.06.003-8 – Campimetria computadorizada ou manual com gráfico
04.05.05.002-0 – Capsulotomia a YAG Laser
04.05.05.003-8 – Cauterização de úlcera/córnea
02.11.06.005-4 – Ceratometria
02.11.06.026-7 – Ceratoscopia computadorizada – binocular
04.05.05.004-6 – Ciclodiatermia/Ciclocriocoagulação
04.05.05.032-1 – Cirurgia anti-glaucomatosa/Trabeculectomia
Sem código SIGTAP – Cirurgia de emergência por trauma perfurante ou intervenção emergencial
Sem código SIGTAP – Cirurgia refrativa
04.05.05.025-9 – Retirada de corpo estranho da córnea
04.05.05.004-6 – Criocicloterapia
02.11.06.006-2 – Curva diária de pressão ocular – CDPO
04.05.04.005-9 – Descompressão de órbita
04.05.01.001-0 – Entrópio/Ectrópio
04.05.04.006-7 – Enucleação de globo ocular
04.05.04.007-5 – Evisceração de globo ocular
04.05.01.002-8 – Correção cirúrgica de epicanto/telecanto
04.05.01.006-0 – Epilação de cílios
04.05.02.001-5 – Tratamento cirúrgico de estrabismo
04.05.04.008-3 – Exenteração de órbita
04.05.05.011-9 – Facoemulsificação com implante de LIO rígida
04.05.05.037-2 – Facoemulsificação com implante de LIO dobrável
04.05.03.004-5 – Fotocoagulação a laser
02.11.06.010-0 – Fundoscopia
02.11.06.011-9 – Gonioscopia
03.03.05.023-3 – Injeção intravítrea de anti-VEGF/Avastin
04.05.04.013-0 – Injeção peribulbar
04.05.05.016-0 – Injeção subconjuntival
04.05.05.019-4 – Iridotomia a laser
02.11.06.012-7 – Mapeamento de retina
02.11.06.014-3 – Microscopia especular de córnea
02.11.06.028-3 – OCT/Tomografia de coerência óptica
02.11.06.028-3 – OCT – ambos os olhos
02.05.02.002-0 – Paquimetria ultrassônica
04.05.05.020-8 – Paracentese com lavagem
02.11.06.015-1 – Potencial de acuidade visual
02.11.05.012-1 – Potencial occipital evocado
02.11.06.016-0 – Potencial visual evocado
07.01.04.006-8 – Prótese ocular/adaptação
04.05.05.036-4 – Tratamento cirúrgico de pterígio
04.05.04.020-2 – Tratamento de ptose
04.05.05.021-6 – Recobrimento conjuntival
04.04.02.002-4 – Reconstituição de cavidade
04.05.01.011-7 – Reconstituição de canal lacrimal
04.05.04.016-4 – Reconstituição de paredes orbitárias
02.11.06.017-8 – Retinografia colorida binocular
02.11.06.018-6 – Angiofluoresceinografia/Retinografia fluorescente binocular
02.11.06.018-6 – Angio + retinografia
04.05.03.007-0 – Retinopexia com introflexão escleral
04.05.01.014-1 – Simblefaroplastia
04.05.01.016-8 – Sondagem de vias lacrimais
04.05.05.029-1 – Sutura de conjuntiva
04.05.05.030-5 – Sutura de córnea
04.05.01.017-6 – Sutura de pálpebra
04.05.01.012-5 – Tarsorrafia/Reconstituição parcial de pálpebra com tarsorrafia
02.11.06.019-4 – Teste de adaptação de visão subnormal
02.11.06.020-8 – Teste de provocação de glaucoma
02.11.06.021-6 – Teste de Schirmer
02.11.06.022-4 – Teste de visão de cores
02.11.06.023-2 – Teste ortóptico
02.11.06.024-0 – Teste para adaptação de lente de contato
02.11.06.025-9 – Tonometria
02.11.06.026-7 – Topografia computadorizada de córnea
04.05.05.012-7 – Trabeculoplastia/Fototrabeculoplastia a laser
Sem código SIGTAP – Transplante conjuntival
04.05.01.019-2 – Tratamento cirúrgico de triquíase
04.05.05.008-9 – Exérese de tumor de conjuntiva
Sem código SIGTAP – Exérese de tumor de esclera
04.03.03.013-7 – Microcirurgia para tumor de órbita
Sem código SIGTAP – Tumor de pálpebra com plástica
02.05.02.008-9 – Ultrassonografia ocular
04.05.03.017-7 – Vitrectomia via pars plana com infusão de perfluorcarbono/óleo de silicone/endolaser
04.05.04.019-9 – Tratamento cirúrgico de xantelasma
04.05.05.015-1 – Implante secundário de lente intraocular
04.05.04.010-5 – Explante de lente intraocular
Sem código SIGTAP – Fixação de lente intraocular
Sem código SIGTAP – Microcirurgia para ressecção de pólipo, nódulo ou granuloma
Sem código SIGTAP – Remoção de hifema
04.05.03.022-3 – Retirada/remoção de óleo de silicone
`;

const rawSJM = `
02.11.06.001-1 – Biometria ultrassônica (monocular)
02.11.06.002-0 – Biomicroscopia de fundo de olho
02.11.06.003-8 – Campimetria computadorizada ou manual com gráfico
04.05.05.002-0 – Capsulotomia a YAG Laser
02.11.06.005-4 – Ceratometria
03.01.01.007-2 – Consulta médica em atenção especializada
04.05.05.007-0 – Correção cirúrgica de hérnia de íris
04.05.04.010-5 – Explante de lente intraocular
04.05.05.010-0 – Facectomia sem implante de lente intraocular
04.05.05.037-2 – Facoemulsificação com implante de LIO dobrável
04.05.05.011-9 – Facoemulsificação com implante de LIO rígida
04.05.03.004-5 – Fotocoagulação a laser
02.11.06.010-0 – Fundoscopia
02.11.06.011-9 – Gonioscopia
04.05.05.015-1 – Implante secundário de lente intraocular
03.03.05.023-3 – Injeção intravítrea
04.05.05.019-4 – Iridotomia a laser
02.11.06.012-7 – Mapeamento de retina
02.11.06.014-3 – Microscopia especular de córnea
02.05.02.002-0 – Paquimetria ultrassônica
02.11.06.015-1 – Potencial de acuidade visual
04.05.03.022-3 – Remoção de óleo de silicone
04.05.04.021-0 – Reposicionamento de lente intraocular
02.11.06.017-8 – Retinografia colorida binocular
02.11.06.018-6 – Retinografia fluorescente binocular
04.05.03.007-0 – Retinopexia com introflexão escleral
04.05.03.021-5 – Retinopexia pneumática
04.05.05.028-3 – Substituição de lente intraocular
04.05.05.030-5 – Sutura de córnea
02.11.06.020-8 – Teste de provocação de glaucoma
02.11.06.028-3 – Tomografia de coerência óptica – OCT
02.11.06.025-9 – Tonometria
02.11.06.026-7 – Topografia computadorizada de córnea
04.05.05.032-1 – Trabeculectomia
02.05.02.008-9 – Ultrassonografia de globo ocular
04.05.03.013-4 – Vitrectomia anterior
04.05.03.017-7 – Vitrectomia posterior com infusão de perfluorcarbono/óleo de silicone/endolaser
`;

const rawMage = `
03.01.01.007-2 – Consulta médica em atenção especializada
02.11.06.028-3 – Tomografia de coerência óptica – OCT, ambos os olhos
Sem código SIGTAP – Cirurgia refrativa LASIK/PRK
03.03.05.023-3 – Injeção intravítrea – Bevacizumabe/Avastin
03.03.05.023-3 – Injeção intravítrea – Aflibercepte/Eylia
03.03.05.023-3 – Injeção intravítrea – Ranibizumabe/Lucentis
02.11.06.025-9 – Tonometria
02.11.06.010-0 – Fundoscopia
02.11.06.002-0 – Biomicroscopia de fundo de olho
02.11.06.022-4 – Teste de visão de cores
02.11.06.005-4 – Ceratometria
02.11.06.001-1 – Biometria ultrassônica
02.11.06.012-7 – Mapeamento de retina
02.05.02.008-9 – Ultrassonografia de globo ocular/órbita
02.11.06.014-3 – Microscopia especular de córnea
02.11.06.015-1 – Potencial de acuidade visual
02.11.06.020-8 – Teste de provocação de glaucoma
02.11.06.011-9 – Gonioscopia
02.11.06.003-8 – Campimetria computadorizada ou manual com gráfico
02.05.02.002-0 – Paquimetria ultrassônica
02.11.06.026-7 – Topografia computadorizada de córnea
02.11.06.021-6 – Teste de Schirmer
02.11.06.023-2 – Teste ortóptico
02.11.06.024-0 – Teste e adaptação de lentes de contato
02.11.06.018-6 – Retinografia fluorescente binocular
02.11.06.017-8 – Retinografia colorida binocular
04.05.05.002-0 – Capsulotomia a YAG Laser
04.05.05.019-4 – Iridotomia a laser
04.05.03.004-5 – Fotocoagulação a laser
04.05.03.019-3 – Pan-fotocoagulação de retina a laser
04.05.05.010-0 – Facectomia sem implante de lente intraocular
04.05.05.037-2 – Facoemulsificação com implante de LIO dobrável
04.05.05.011-9 – Facoemulsificação com implante de LIO rígida
04.05.05.028-3 – Substituição de lente intraocular
04.05.04.010-5 – Explante de lente intraocular
04.05.04.021-0 – Reposicionamento de lente intraocular
04.05.05.015-1 – Implante secundário de lente intraocular
04.05.05.007-0 – Correção cirúrgica de hérnia de íris
04.05.03.013-4 – Vitrectomia anterior
04.05.05.030-5 – Sutura de córnea
04.05.01.007-9 – Exérese de calázio e outras pequenas lesões de pálpebra e supercílios
04.05.05.036-4 – Tratamento cirúrgico de pterígio
04.05.03.014-2 – Vitrectomia posterior
04.05.03.021-5 – Retinopexia pneumática
04.05.03.022-3 – Remoção de óleo de silicone
04.05.03.017-7 – Vitrectomia posterior com infusão de perfluorcarbono/óleo de silicone/endolaser
04.05.05.004-6 – Ciclocriocoagulação/diatermia
04.05.05.032-1 – Trabeculectomia
04.05.05.021-6 – Recobrimento conjuntival
04.05.01.017-6 – Sutura de pálpebra
04.05.05.016-0 – Injeção subconjuntival/subtenoniana
04.05.05.024-0 – Retirada de corpo estranho da câmara anterior do olho
04.05.03.003-7 – Crioterapia ocular
04.05.05.013-5 – Cirurgia anti-glaucomatosa/implante de prótese anti-glaucomatosa
`;

function parseRaw(text) {
  return text
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('–').map(s => s.trim());
      const rawCode = parts[0];
      const name = parts.slice(1).join(' – ');
      const isSigtap = rawCode !== 'Sem código SIGTAP';
      return {
        code: isSigtap ? rawCode : null,
        name: name || rawCode
      };
    });
}

const pLagosSPA = parseRaw(rawLagosSPA);
const pLagosArr = parseRaw(rawLagosArraial);
const pLagosBuz = parseRaw(rawLagosBuzios);
const pSJM = parseRaw(rawSJM);
const pMage = parseRaw(rawMage);

// Consolidar todos os procedimentos unificados por (código + nome normalizado)
const proceduresMap = new Map();

function addProc(proc, unitId) {
  // Chave única: code_sigtap se existir, ou nome normalizado
  const normName = proc.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const key = proc.code ? `${proc.code}::${normName}` : `SEM_SIGTAP::${normName}`;

  if (!proceduresMap.has(key)) {
    proceduresMap.set(key, {
      code_sigtap: proc.code || 'Sem SIGTAP',
      name: proc.name,
      unit_ids: new Set()
    });
  }
  proceduresMap.get(key).unit_ids.add(unitId);
}

pLagosSPA.forEach(p => addProc(p, 'unit-lagos'));
pLagosArr.forEach(p => addProc(p, 'unit-lagos'));
pLagosBuz.forEach(p => addProc(p, 'unit-lagos'));
pSJM.forEach(p => addProc(p, 'unit-sjm'));
pMage.forEach(p => addProc(p, 'unit-mage'));

console.log('=== RESUMO DOS PROCEDIMENTOS UNIFICADOS ===');
console.log('Total de procedimentos únicos mapeados:', proceduresMap.size);

// ==========================================
// EXECUÇÃO REAL NO SUPABASE
// ==========================================
async function runPopulation() {
  console.log('\n🚀 Iniciando gravação na base real...');

  // 1. INATIVAR UNIDADES ANTIGAS DE TESTE
  console.log('1. Inativando unidades antigas de teste...');
  await client.from('units').update({ active: false }).in('id', ['unit-1', 'unit-2', 'unit-3', 'unit-4']);

  // 2. CADASTRAR/ATUALIZAR AS 3 UNIDADES REAIS
  console.log('2. Cadastrando as 3 unidades reais...');
  const { error: errUnits } = await client.from('units').upsert(units, { onConflict: 'id' });
  if (errUnits) console.error('Erro em units:', errUnits.message);
  else console.log('✅ 3 Unidades salvas com sucesso.');

  // 3. CADASTRAR/ATUALIZAR MUNICÍPIOS
  console.log('3. Cadastrando municípios atendidos...');
  const { error: errMun } = await client.from('municipalities').upsert(municipalities, { onConflict: 'id' });
  if (errMun) console.error('Erro em municipalities:', errMun.message);
  else console.log('✅ Municípios salvos com sucesso.');

  // 4. ATUALIZAR ACESSO DO ADMIN PRINCIPAL
  console.log('4. Atualizando permissões do Administrador Geral para as 3 unidades...');
  const realUnitIds = ['unit-lagos', 'unit-sjm', 'unit-mage'];
  await client.from('profiles').update({ unit_ids: realUnitIds }).eq('role', 'admin');
  await client.from('system_users').update({ unit_ids: realUnitIds }).eq('role', 'admin');

  // 5. CADASTRAR MÉDICOS
  console.log('5. Cadastrando médicos unificados...');
  const doctorRows = doctors.map((d, index) => ({
    id: `doc-${index + 1}-${d.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
    name: d.name,
    crm: d.crm || `CRM-${10000 + index}`,
    state_crm: 'RJ',
    unit_ids: d.unit_ids,
    specialty: 'Oftalmologia Geral e Cirúrgica',
    active: true,
    phone: ''
  }));

  // Limpa médicos antigos fictícios da base real
  await client.from('doctors').delete().neq('id', 'keep_none');
  const { error: errDoc } = await client.from('doctors').upsert(doctorRows, { onConflict: 'id' });
  if (errDoc) console.error('Erro em doctors:', errDoc.message);
  else console.log(`✅ ${doctorRows.length} médicos cadastrados com sucesso.`);

  // 6. CADASTRAR USUÁRIAS (RECEPCIONISTAS E SUPERVISORAS) NO AUTH + PROFILES + SYSTEM_USERS
  console.log('6. Cadastrando usuárias no Supabase Auth e perfis...');
  const defaultPassword = 'Saude2026@';

  for (const u of users) {
    const email = `${u.login}@gestao.saude.rj.gov.br`;
    let authId = null;

    // Verifica se já existe no Auth
    const { data: listData } = await client.auth.admin.listUsers();
    const existing = listData?.users?.find(usr => usr.email === email);

    if (existing) {
      authId = existing.id;
      // Atualiza senha e metadata
      await client.auth.admin.updateUserById(authId, {
        password: defaultPassword,
        user_metadata: {
          name: u.name,
          login: u.login,
          role: u.role,
          unit_ids: [u.unitId]
        }
      });
    } else {
      // Cria no auth
      const { data: created, error: crtErr } = await client.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: u.name,
          login: u.login,
          role: u.role,
          unit_ids: [u.unitId]
        }
      });
      if (crtErr) {
        console.warn(`Aviso ao criar auth de ${u.login}:`, crtErr.message);
      } else {
        authId = created.user.id;
      }
    }

    if (authId) {
      // Upsert profile
      const perms = u.role === 'supervisor' 
        ? {
            view_patients: true,
            create_patients: true,
            edit_patients: true,
            delete_patients: false,
            edit_after_creation: true,
            record_evolution: true,
            record_contact_attempt: true,
            change_patient_status: true,
            manage_procedures: true,
            manage_doctors: true,
            manage_municipalities: true,
            view_timeline: true,
            view_logs: true,
            view_reports: true,
            export_reports: true,
            manage_users: false,
            manage_units: false,
            manage_settings: false
          }
        : {
            view_patients: true,
            create_patients: true,
            edit_patients: true,
            delete_patients: false,
            edit_after_creation: false,
            record_evolution: true,
            record_contact_attempt: true,
            change_patient_status: true,
            manage_procedures: false,
            manage_doctors: false,
            manage_municipalities: false,
            view_timeline: true,
            view_logs: false,
            view_reports: true,
            export_reports: false,
            manage_users: false,
            manage_units: false,
            manage_settings: false
          };

      await client.from('profiles').upsert({
        id: authId,
        name: u.name,
        login: u.login,
        email,
        role: u.role,
        unit_ids: [u.unitId],
        permissions: perms,
        active: true
      }, { onConflict: 'id' });

      await client.from('system_users').upsert({
        id: authId,
        name: u.name,
        login: u.login,
        email,
        role: u.role,
        unit_ids: [u.unitId],
        permissions: perms,
        active: true,
        must_change_password: true
      }, { onConflict: 'id' });
    }
  }
  console.log(`✅ ${users.length} usuárias configuradas no Auth e Banco.`);

  // 7. CADASTRAR PROCEDIMENTOS
  console.log('7. Cadastrando procedimentos unificados no banco...');
  // Limpa procedimentos antigos fictícios
  await client.from('procedures').delete().neq('id', 'keep_none');

  const procRows = [];
  let procIdx = 1;
  for (const [key, val] of proceduresMap.entries()) {
    procRows.push({
      id: `proc-${procIdx++}`,
      name: val.name,
      code_sigtap: val.code_sigtap,
      unit_ids: Array.from(val.unit_ids),
      active: true,
      description: `Procedimento cadastrado para: ${Array.from(val.unit_ids).join(', ')}`,
      requires_eye_side: true
    });
  }

  // Inserção em lotes de 50
  for (let i = 0; i < procRows.length; i += 50) {
    const chunk = procRows.slice(i, i + 50);
    const { error: errProc } = await client.from('procedures').upsert(chunk, { onConflict: 'id' });
    if (errProc) console.error('Erro em procedures chunk:', errProc.message);
  }
  console.log(`✅ ${procRows.length} procedimentos cadastrados com sucesso.`);

  console.log('\n=================================================');
  console.log('🎉 CARGA COMPLETA APLICADA COM SUCESSO NA BASE REAL!');
  console.log('=================================================');
}

runPopulation().catch(console.error);
