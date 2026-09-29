# Manual de Gestão e Operação — Perfil Supervisora / Coordenação
**Sistema de Controle e Regulação de Pacientes Oftalmológicos (SUS - RJ)**

---

## 1. Apresentação e Escopo do Perfil
O perfil de **Supervisora** atua na gestão intermediária e na coordenação clínica da fila oftalmológica. Suas atribuições envolvem:
- Gestão e ordenamento da fila cirúrgica/ambulatorial.
- Concessão de prioridades clínicas justificadas (*Priority Override*).
- Gestão de casos retidos em *Aguardando Micrologos* (após 2 faltas ou 3 contatos sem êxito).
- Edição avançada de dados de pacientes após a criação.
- Manutenção de procedimentos, médicos oftalmologistas e municípios vinculados à unidade.
- Emissão, consolidação e exportação de relatórios regulatórios oficiais (.xlsx e PDF).
- Monitoramento da rastreabilidade e auditoria clínica.

---

## 2. Acesso, Autenticação e Segurança
1. Acesse o sistema com seu login institucional de supervisão.
2. No primeiro acesso (ou após reset administrativo), atualize sua senha para uma credencial segura de uso exclusivo.
3. Se você coordena múltiplos polos (ex: *Lagos*, *São João de Meriti*, *Magé*), utilize o seletor de **Unidade** no topo da página para alternar a visão ou selecionar **Todas as Unidades Autorizadas**.

---

## 3. Gestão Executiva pelo Dashboard

O Dashboard foi projetado para oferecer leitura clínica rápida, sem sobrecarga visual:

### 3.1. Filtros Dinâmicos de Cabeçalho
- **Seletor de Unidade**: Filtra todos os indicadores para a unidade escolhida (ou visão consolidada).
- **Seletor de Município**: Restringe o painel aos municípios atendidos pela unidade ativa.

### 3.2. Os 6 Indicadores Estratégicos (KPIs)
1. **Total Pacientes**: Volume total sob acompanhamento da regulação.
2. **Agendados**: Pacientes com agendamento confirmado, prontos para a intervenção.
3. **Regulados**: Pacientes com documentação e solicitação médica deferidas no sistema.
4. **Aguardando Micrologos**: Alerta crítico de pacientes que faltaram 2 vezes ou acumularam 3 contatos frustrados.
5. **Sem Interação**: Fila de pacientes recém-ingressos que ainda não receberam a primeira abordagem telefônica.
6. **Casos Urgentes**: Pacientes com indicação de urgência clínica que necessitam de intervenção célere.

### 3.3. Gráficos Analíticos
- **Panorama do Fluxo de Regulação (Pipeline)**: Barra segmentada proporcional indicando o balanceamento percentual da carteira regulatória.
- **Demanda por Procedimento Oftalmológico**: Gráfico de barras horizontais ranqueando as cirurgias e exames com maior procura (ex: Facectomia/Catarata, YAG Laser, Vitrectomia, Injeções Intravítreas).
- **Distribuição por Município de Atendimento**: Demonstrativo proporcional de pacientes atendidos por município habilitado. Clicar em qualquer município filtra o painel imediatamente para aquela cidade.

---

## 4. Gestão e Ordenamento da Fila de Pacientes

Na aba **Pacientes**, a supervisora dispõe de ferramentas avançadas de regulação:

### 4.1. Definição de Prioridade de Regulação (*Priority Override*)
Por padrão, a fila do SUS segue a ordem cronológica de cadastro e a classificação de urgência. Quando houver determinação judicial, laudo oftalmológico de gravidade superveniente ou recomendação da equipe médica:
1. Localize o paciente na listagem.
2. Clique no botão de **Prioridade** (ícone de estrela / escudo).
3. Ative a opção **Prioridade Manual**.
4. Defina a posição preferencial na fila ou ordem de agendamento prioritário.
5. **Obrigatório**: Preencha a **Justificativa Clínica/Administrativa** (ex: *"Paciente monocular com perda acentuada de acuidade visual no olho remanescente segundo laudo do Dr. Marcelo Albuquerque em 25/09/2026"*).
6. Confirme a alteração. O paciente receberá um distintivo visual de prioridade e a ação será gravada no livro de auditoria.

### 4.2. Edição de Pacientes Após o Cadastro
Diferente dos atendentes que possuem edição restrita, a supervisora tem permissão para:
- Alterar dados pessoais, contatos e endereço.
- Corrigir o procedimento solicitado ou a lateralidade ocular (`OD`, `OE`, `AO`).
- Alterar o médico solicitante ou a unidade de encaminhamento.
- Atualizar a data solicitada conforme documentação oficial.

### 4.3. Tratativa de Pacientes em "Aguardando Micrologos"
Quando o sistema move automaticamente um paciente para *Aguardando Micrologos*:
1. Filtre a listagem pelo status **Aguardando Micrologos**.
2. Abra o prontuário e avalie o histórico:
   - Se foi por **3 tentativas frustradas de contato**: Acione a busca ativa institucional com a Unidade Básica de Saúde (UBS) de origem do município atendido.
   - Se foi por **2 faltas**: Verifique se houve justificativa de força maior apresentada posteriormente.
3. Havendo resolução, registre uma **Evolução** e reclassifique o status do paciente (ex: de volta para *Aguardando Contato* ou *Agendado*).

---

## 5. Manutenção de Cadastros de Apoio

A supervisora tem acesso à gestão dos cadastros auxiliares na aba **Administração**:

### 5.1. Procedimentos Oftalmológicos
- Visualização do catálogo de procedimentos ativos.
- Cadastro de novos procedimentos: nome oficial, código SIGTAP (SUS), unidades autorizadas a realizar o procedimento e obrigatoriedade de identificação de lateralidade ocular (Olho Direito / Olho Esquerdo).

### 5.2. Corpo Clínico (Médicos Oftalmologistas)
- Gestão dos oftalmologistas cadastrados.
- Cada médico possui: Nome completo, CRM (apenas dígitos numéricos) e UF do CRM (ex: `CRM 52123456 - RJ`).
- Vínculo dos médicos às especialidades (ex: Catarata, Glaucoma, Retina, Plástica Ocular).

### 5.3. Municípios de Abrangência
- Manutenção dos municípios atendidos pelas unidades do SUS reguladas.
- Ativação ou inativação de municípios conveniados.

---

## 6. Módulo Avançado de Relatórios

Na aba **Relatórios**, a supervisora emite os demonstrativos regulatórios oficiais:

### 6.1. Filtros Combinados
- **Unidade de Atendimento**: Filtre por um polo específico ou todas as unidades autorizadas.
- **Condição / Status**: Total, Regulados, Agendados, Aguardando Micrologos, Sem Interação, Faltas, Óbitos, etc.
- **Procedimento**: Filtre por uma cirurgia específica (ex: apenas Catarata).
- **Prioridade**: Todos, apenas Casos Urgentes ou Normais/Eletivos.
- **Período de Solicitação**: Filtro por data inicial e final (`De` / `Até`).
- **Município**:
  - O dropdown adapta-se automaticamente à unidade selecionada!
  - Ao escolher *Unidade Lagos*, somente são exibidos os municípios da Região dos Lagos (`Armação dos Búzios`, `São Pedro da Aldeia`, `Arraial do Cabo`).
- **Médico Solicitante**: Filtre a demanda originada por um oftalmologista específico.

### 6.2. Exportação para Excel (.xlsx)
1. Ajuste os filtros conforme a prestação de contas solicitada.
2. Clique no botão verde **Exportar Excel (.xlsx)**.
3. O sistema gerará um arquivo de planilha estruturado com colunas completas: Prontuário, Nome, CPF, Cartão SUS, Município, Procedimento, Olho, Médico Solicitante, Status e Datas.

### 6.3. Pré-visualização e Impressão (PDF / Impressora)
- Clique em **Visualizar Modelo** para conferir a diagramação formal com cabeçalho oficial do SUS e brasão institucional.
- Clique em **Imprimir** para enviar diretamente para a impressora ou salvar em PDF.

---

## 7. Trilha de Auditoria Clínica (Audit Logs)
Na aba **Auditoria**:
- Acompanhe a linha do tempo imutável de todas as ações executadas no sistema.
- Permite verificar:
  - Quem cadastrou ou alterou dados de cada paciente.
  - Horário exato de cada ligação registrada pela equipe de atendimento.
  - Regras automáticas disparadas pelo sistema (identificadas como `AUTO_RULE`).
- Garante total segurança jurídica e transparência perante os órgãos de controle e fiscalização do SUS.
