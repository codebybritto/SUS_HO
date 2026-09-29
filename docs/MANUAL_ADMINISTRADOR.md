# Manual de Administração e Governança — Perfil Administrador
**Sistema de Controle e Regulação de Pacientes Oftalmológicos (SUS - RJ)**

---

## 1. Apresentação e Escopo do Perfil
O perfil de **Administrador** detém os privilégios máximos de governança técnica, segurança da informação e parametrização do sistema. Suas responsabilidades exclusivas englobam:
- Gestão central de identidades, logins e acessos (Supabase Auth & Perfis).
- Criação de novos operadores, concessão de perfis e permissões granulares.
- Reset administrativo de senhas e imposição de troca no primeiro login.
- Criação e manutenção de Polos / Unidades de Saúde e seus municípios de abrangência.
- Parametrização das Regras Automáticas Clínicas (limiar de faltas e contatos).
- Fiscalização da Trilha de Auditoria Geral (Audit Logs).
- Monitoramento da integridade e sincronismo com o banco de dados Supabase na nuvem.

---

## 2. Acesso Master e Governança de Segurança
- O login de administrador possui acesso irrestrito a todas as unidades e a todos os módulos do sistema.
- **Autenticação Real**: Todas as contas são registradas e criptografadas diretamente no serviço de autenticação oficial do **Supabase Auth**.
- **Segurança da Sessão**: Sessão protegida com timeout automático por inatividade de 15 minutos.
- **Não Compartilhamento**: Cada administrador deve possuir sua conta individual (ex: `herika.quaresma`, `teste.admin`) para garantia de rastreabilidade forense nas ações do sistema.

---

## 3. Gestão Central de Usuários e Permissões

Na aba **Administração** -> sub-aba **Usuários**:

### 3.1. Cadastrando um Novo Usuário
1. Clique no botão **+ Novo Usuário**.
2. Preencha os campos obrigatórios:
   - **Nome Completo**: Nome do profissional (ex: *Patrícia Lemos*).
   - **Login de Acesso**: Identificador institucional único em minúsculas (ex: `patricia.lemos`).
   - **E-mail Institucional**: O sistema preenche automaticamente com o domínio `@gestao.saude.rj.gov.br`, podendo ser customizado se necessário.
   - **Senha Provisória**: Digite a senha inicial (ex: `#EWrkebu` ou similar).
   - **Perfil (Role)**:
     - `Atendente`: Operação de recepção, cadastro de pacientes, ligações e faltas.
     - `Supervisora`: Gestão da fila, relatórios, cadastros auxiliares e priorizações.
     - `Administrador`: Acesso total e governança do sistema.
   - **Unidades Autorizadas**: Selecione uma, várias ou todas as unidades que o usuário terá permissão para visualizar e operar (ex: marcar apenas *Unidade Lagos* para atendentes locais).
   - **Obrigar troca de senha no próximo login**:
     - *Recomendação*: **Marque sempre esta opção** ao cadastrar um novo usuário. Ao realizar o primeiro login com a senha provisória, o sistema forçará a definição da senha pessoal definitiva.
3. **Permissões Granulares**:
   - O sistema preenche automaticamente as permissões padrão para o perfil selecionado.
   - O administrador pode personalizar chaves individuais (ex: permitir que uma supervisora específica exclua pacientes ou restrinja exportações).
4. Clique em **Salvar Usuário**. A conta é provisionada no Supabase Auth e liberada para uso imediato.

### 3.2. Reset Administrativo de Senha
Quando um usuário esquecer a senha ou tiver seu acesso bloqueado:
1. Localize o usuário na listagem de usuários.
2. Clique no botão **Resetar Senha** (ícone de chave).
3. Uma modal abrirá permitindo:
   - Gerar uma senha forte automática clicando em **Gerar Senha Segura**.
   - Digitar manualmente uma senha provisória de sua escolha.
   - Marcar a opção **Obrigar o usuário a trocar esta senha no próximo login**.
4. Clique em **Confirmar Reset de Senha**.
5. Copie a senha gerada e entregue-a de forma segura ao colaborador. No próximo login, o sistema exigirá a substituição obrigatória.

### 3.3. Ativação e Desativação de Usuários
- Em caso de férias prolongadas, transferência de setor ou desligamento:
  - Edite o usuário e desmarque a opção **Usuário Ativo**.
  - O acesso é bloqueado instantaneamente no Supabase Auth, impedindo qualquer nova tentativa de login.
  - O histórico de ações passadas do usuário na linha do tempo permanece 100% preservado para fins de auditoria.

---

## 4. Gestão de Unidades de Atendimento (Polos)

Na sub-aba **Unidades**:
O sistema é estruturado em polos regionais do SUS/RJ (ex: *Unidade Lagos*, *Unidade São João de Meriti*, *Unidade Magé*).

### 4.1. Configuração de uma Unidade
Ao criar ou editar uma unidade:
- **Nome da Unidade**: Identificação oficial (ex: *Unidade Lagos*).
- **Código / Sigla**: Código de regulação (ex: `POLO-LAGOS`).
- **Número do CNES**: Cadastro Nacional de Estabelecimentos de Saúde (7 dígitos).
- **Município Sede e UF**: Cidade onde o polo físico está instalado.
- **Telefone e Endereço Oficial**: Informações de contato institucional.
- **Municípios Atendidos / De Abrangência**:
  - Selecione a lista de municípios que este polo está habilitado a acolher.
  - *Exemplo*: Para a *Unidade Lagos*, selecione `Armação dos Búzios`, `São Pedro da Aldeia` e `Arraial do Cabo`.
  - Essa configuração dita **exatamente quais municípios aparecem nos formulários de cadastro e nos filtros de relatórios e dashboards**.

---

## 5. Gestão Central de Procedimentos, Médicos e Municípios

### 5.1. Procedimentos Oftalmológicos
- Tabela oficial de cirurgias e procedimentos de alta e média complexidade.
- Campos gerenciados:
  - Nome formal do procedimento.
  - Código SIGTAP do SUS (ex: `04.05.05.011-9` para Facectomia).
  - Vínculo com as unidades que realizam o procedimento.
  - Flag **Exige Olho**: Quando ativado, obriga o atendente a selecionar se o procedimento é no Olho Direito (OD), Olho Esquerdo (OE) ou Ambos (AO).

### 5.2. Corpo Clínico de Oftalmologistas
- Manutenção dos médicos reguladores e cirurgiões cadastrados.
- **Validação de CRM**: O sistema exige CRM estritamente numérico (dígitos limpos) associado à UF (ex: CRM `52123456`, UF `RJ`).
- Vínculo às especialidades clínicas (Catarata, Córnea, Glaucoma, Retina, Estrabismo, Vias Lacrimais).

### 5.3. Catálogo de Municípios do Estado do Rio de Janeiro
- Cadastro e ativação dos municípios cobertos pela regulação.

---

## 6. Parametrização de Regras Automáticas do Sistema

Na sub-aba **Regras e Parâmetros**, o administrador calibra a inteligência de regulação:

### 6.1. Regra de Limite de Faltas
- **Parâmetro**: *Número de Faltas para Mover para Aguardando Micrologos*.
- **Padrão Oficial**: `2` faltas.
- **Comportamento**: Quando um atendente registra a 2ª falta de um paciente em qualquer procedimento agendado, o sistema executa uma regra automática (`AUTO_RULE`), altera o status para **Aguardando Micrologos** e emite um registro auditado no prontuário.

### 6.2. Regra de Tentativas de Contato Frustradas
- **Parâmetro**: *Tentativas de Contato sem Êxito para Mover para Aguardando Micrologos*.
- **Padrão Oficial**: `3` tentativas.
- **Comportamento**: Se a equipe de recepção registrar 3 ligações consecutivas sem sucesso (ex: não atende, ocupado, caixa postal), o paciente é movido para **Aguardando Micrologos** para que a supervisão articule a busca ativa externa com a UBS de origem.

### 6.3. Prazos de Retorno e Follow-up
- Configuração do intervalo máximo recomendado em dias para o primeiro retorno pós-operatório (ex: 7 dias, 15 dias, 30 dias).

---

## 7. Monitoramento da Trilha de Auditoria (Audit Logs)

Na aba **Auditoria**:
- Registro cronológico imutável de todas as transações:
  - Criação, edição e exclusão de prontuários.
  - Disparos de regras automáticas do sistema.
  - Alterações cadastrais de usuários e resets de senhas.
  - Mudanças nos parâmetros de regras.
- Cada log contém: Data e hora precisa em padrão ISO, ID do usuário operador, nome do usuário, tipo de entidade afetada, valores anteriores (`previousValues`) e valores atualizados (`newValues`).
- Permite filtragem por período, usuário ou tipo de ação (CRIAÇÃO, EDIÇÃO, REGRA AUTOMÁTICA, ADMINISTRAÇÃO).

---

## 8. Monitoramento do Banco de Dados (Supabase)
No menu superior da barra azul (ícone de Banco de Dados):
- Exibe o status da sincronização com a nuvem:
  - **Supabase Conectado (Ponto Verde)**: Conexão ativa, transações salvas em tempo real no PostgreSQL.
  - **Sincronizando (Ponto Âmbar)**: Envio ou recuperação de pacotes de dados em andamento.
  - **Offline / Local (Ponto Vermelho/Cinza)**: Falha de conexão na rede do cliente; o sistema opera com fila offline local e sincroniza automaticamente assim que a conexão de internet é restabelecida.
- Botão **Enviar Dados Locais para o Supabase**: Força um push integral dos cadastros locais para a nuvem.
- Botão **Recarregar Dados da Nuvem**: Recarrega o estado atualizado do banco de dados na tela.
