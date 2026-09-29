# Manual de Operação — Perfil Atendente
**Sistema de Controle e Regulação de Pacientes Oftalmológicos (SUS - RJ)**

---

## 1. Apresentação e Objetivo do Perfil
O perfil de **Atendente** é o operador de linha de frente do sistema, responsável pelo acolhimento, cadastro dos pacientes encaminhados, busca ativa através de contatos telefônicos, registro de faltas e evolução do prontuário regulatório.

As ações realizadas pelo atendente alimentam diretamente os indicadores do Dashboard e a fila de regulação para as cirurgias e procedimentos oftalmológicos.

---

## 2. Acesso ao Sistema e Segurança

### 2.1. Primeiro Acesso e Login
1. Abra o navegador e acerte o endereço do sistema.
2. No formulário de login, preencha:
   - **Usuário / Login**: Seu login fornecido pela supervisão (ex: `mariana.silva`).
   - **Senha**: A senha inicial fornecida pela administração.
3. Clique no botão **Acessar o Sistema**.

### 2.2. Troca Obrigatória de Senha
- Caso a administração tenha marcado a opção de troca obrigatória, ao entrar você será imediatamente direcionado para definir sua nova senha pessoal.
- A nova senha deve conter no mínimo **4 caracteres**.
- **Atenção**: Nunca compartilhe sua senha com outros colegas.

### 2.3. Tempo Limite de Inatividade (15 Minutos)
- Em conformidade com a segurança dos dados de saúde (LGPD e CFM), se o sistema ficar **15 minutos sem movimentação**, a sessão será automaticamente bloqueada e deslogada.
- Basta digitar seu login e senha novamente para retomar o trabalho.

---

## 3. Seleção da Unidade de Trabalho
No canto superior direito (barra azul-marinho / Navbar):
1. Clique no seletor com o ícone de prédio (**Unidade de Trabalho**).
2. Se você atende mais de uma unidade, escolha a unidade atual em que está trabalhando (ex: *Unidade Lagos*, *Unidade São João de Meriti* ou *Unidade Magé*).
3. Ao selecionar a unidade, o sistema filtra automaticamente os pacientes e municípios daquela região.

---

## 4. Navegação no Painel (Dashboard)
Ao acessar o sistema, você verá o **Dashboard** com os 6 indicadores principais:
- **Total Pacientes**: Volume total de pacientes na fila sob a sua unidade.
- **Agendados**: Pacientes que já possuem data e horário confirmados para a cirurgia/exame.
- **Regulados**: Pacientes cujos laudos e exames foram validados pela regulação médica.
- **Aguardando Micrologos**: Pacientes que atingiram o limite de faltas (2 faltas) ou de contatos frustrados (3 tentativas sem sucesso).
- **Sem Interação**: Pacientes recém-cadastrados que **ainda não receberam nenhuma ligação ou tentativa de contato**.
- **Casos Urgentes**: Pacientes classificados com necessidade de atendimento oftalmológico prioritário.

> **Dica Prática**: Clicar em qualquer um desses cards abre diretamente a listagem com os pacientes daquela situação para você iniciar os contatos!

---

## 5. Cadastro de Novo Paciente

Para cadastrar um paciente encaminhado pela rede básica ou regulação:
1. No menu superior, clique no botão azul **Novo Paciente** (ou na aba **Pacientes** -> botão **+ Novo Paciente**).
2. O formulário de cadastro será exibido. Preencha os campos com atenção:

### 5.1. Dados Pessoais
- **Nome Completo do Paciente** (*Obrigatório*): Digite sem abreviações.
- **Data de Nascimento**: Insira a data (o sistema calcula a idade automaticamente).
- **CPF**: Digite os 11 dígitos do CPF do paciente.
- **Cartão Nacional de Saúde (CNS / SUS)**: Digite o número do cartão SUS.
- **Telefone Principal** (*Obrigatório*): Informe DDD + número (ex: `(22) 99876-5432`). É fundamental para a busca ativa.
- **Telefone Secundário / Recado**: Telefone de familiar ou vizinho.
- **Nome da Mãe**: Ajuda na localização inequívoca do paciente no CADSUS.

### 5.2. Unidade e Município de Atendimento
- **Unidade de Atendimento** (*Obrigatório*): Selecione a unidade onde o procedimento será realizado (ex: *Unidade Lagos*).
- **Município de Atendimento** (*Obrigatório*):
  - O sistema exibe **apenas os municípios atendidos por aquela unidade específica**!
  - *Exemplo*: Se você escolheu *Unidade Lagos*, só aparecerão `Armação dos Búzios`, `São Pedro da Aldeia` e `Arraial do Cabo`.
- **Endereço Completo e Bairro**: Informações complementares para contato e correspondência.

### 5.3. Procedimento e Dados Clínicos
- **Procedimento Oftalmológico Solicitado** (*Obrigatório*): Selecione na lista (ex: *Facectomia com Implante de LIO (Catarata)*, *Capsulotomia a YAG Laser*, etc.).
- **Olho a ser Operado / Tratado**:
  - `OD` = Olho Direito
  - `OE` = Olho Esquerdo
  - `AO` = Ambos os Olhos
- **Médico Solicitante**: Selecione o médico oftalmologista responsável pelo encaminhamento (o CRM aparece automaticamente).
- **Marcação de Urgência**: Marque a caixa **Marcar como Urgente** apenas se houver justificativa clínica expressa no pedido médico (ex: descolamento de retina, glaucoma agudo).
- **Observações Clínicas Iniciais**: Qualquer recomendação relevante (ex: "Paciente hipertenso", "Necessita de acompanhante", "Cadeirante").

3. Clique em **Salvar Paciente**. O sistema registrará o cadastro e criará a primeira entrada na Linha do Tempo do paciente.

---

## 6. Acompanhamento e Busca Ativa (Rotina Diária)

Na aba **Pacientes**, utilize a barra de busca e os filtros rápidos:
- **Localizar por Nome, CPF ou Município**: Digite na barra de busca superior.
- **Filtro Rápido**: Filtre por *Sem Interação*, *Agendados*, *Aguardando Contato*, etc.

Ao localizar o paciente, você terá botões de ação rápida em cada linha:

### 6.1. Registrando uma Tentativa de Contato Telefônico (Ícone de Telefone)
1. Clique no botão **Contato** na linha do paciente.
2. Preencha:
   - **Forma de Contato**: Telefone Principal, WhatsApp ou Telefone de Recado.
   - **Desfecho / Resultado da Chamada**:
     - *Contato Efetivo (Falou com o paciente)*: O paciente atendeu e foi orientado.
     - *Não Atende / Chama até cair*: Não houve atendimento.
     - *Linha Ocupada*: Telefone ocupado.
     - *Número Inexistente / Caixa Postal*: Não completou.
     - *Recado com Terceiro*: Deixado recado com parente.
   - **Notas da Ligação**: Descreva resumidamente o que foi falado (ex: *"Confirmou que virá na terça-feira com acompanhante"*).
3. Clique em **Registrar Contato**.
   > **Atenção — Regra Automática**: Caso sejam registradas **3 tentativas de contato consecutivas sem sucesso**, o sistema moverá automaticamente o paciente para o status **Aguardando Micrologos** e emitirá um alerta no prontuário.

### 6.2. Registrando uma Falta (Ícone de Alerta)
Caso o paciente não compareça à consulta de avaliação ou ao procedimento agendado:
1. Clique no botão **Registrar Falta**.
2. Preencha a data em que ocorreu a falta, se houve justificativa (ex: atestado médico) e o motivo alegado.
3. Clique em **Confirmar Falta**.
   > **Atenção — Regra Automática**: Se o paciente acumular **2 faltas**, o sistema aplicará a regra automática de regulação e transferirá o status para **Aguardando Micrologos**.

### 6.3. Registrando uma Evolução / Atualização de Situação
1. Clique no botão **Evolução** no prontuário.
2. Selecione a nova situação do paciente (ex: *Exames Pré-operatórios Entregues*, *Apto para Cirurgia*, *Desistência*, *Doente*).
3. Digite o parecer detalhado no campo de texto.
4. Se o status geral do paciente mudou, selecione o novo status (ex: *Agendado*, *Regulado*, *Concluído*).
5. Clique em **Salvar Evolução**.

---

## 7. Consulta ao Prontuário e Linha do Tempo (Timeline)
- Para ver o histórico completo de qualquer paciente, clique sobre o **Nome do Paciente** na listagem.
- Uma janela modal abrirá mostrando:
  - Ficha cadastral completa, contatos e endereço.
  - Procedimentos solicitados e lateralidade ocular.
  - **Linha do Tempo Cronológica Auditada**: Exibe exatamente quem cadastrou, quem ligou, as notas de evolução e quando o status foi alterado.

---

## 8. Boas Práticas e Recomendações
1. **Confirmação Cadastral**: Sempre confirme os telefones do paciente em todas as chamadas.
2. **Clareza nas Notas**: Registre sempre notas claras e profissionais nas evoluções, pois elas são documentos oficiais e auditáveis pelo SUS.
3. **Privacidade**: Não deixe o computador desbloqueado ao se ausentar da recepção ou do posto de regulação.
