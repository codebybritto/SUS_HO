import fs from 'fs';

// Procedimentos texto bruto
const spaProcsRaw = `
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

function parseProcs(text) {
  return text.trim().split('\n').filter(Boolean).map(line => {
    const parts = line.split('–').map(s => s.trim());
    const code = parts[0];
    const name = parts.slice(1).join(' – ');
    return { code, name };
  });
}

const spa = parseProcs(spaProcsRaw);
console.log('SPA procedures count:', spa.length);
