# Documentação Operacional e Manuais de Utilização por Perfil
**Sistema de Controle e Regulação de Pacientes Oftalmológicos (SUS - RJ)**

Bem-vindo à documentação oficial do sistema. Para assegurar a correta utilização, o cumprimento dos fluxos de trabalho e a segurança dos dados clínicos regulatórios, os manuais foram divididos de forma modular de acordo com as atribuições e níveis de acesso de cada perfil:

---

## 📚 Manuais Ilustrados Disponíveis

Todos os manuais contam com **capturas visuais das telas**, tabelas explicativas, caixas de atenção e instruções em passos numerados simples:

| Perfil | Documento | Principais Responsabilidades |
| :--- | :--- | :--- |
| **Atendente / Recepção** | [**`MANUAL_ATENDENTE.md`**](./MANUAL_ATENDENTE.md) | Passo a passo com telas do cadastro de pacientes, busca ativa de contatos, registro de faltas e atualizações de prontuário. |
| **Supervisora / Coordenação** | [**`MANUAL_SUPERVISORA.md`**](./MANUAL_SUPERVISORA.md) | Guia ilustrado do painel executivo, ordenamento da fila cirúrgica, priorizações clínicas, tratativa de casos Micrologos e exportação Excel. |
| **Administrador do Sistema** | [**`MANUAL_ADMINISTRADOR.md`**](./MANUAL_ADMINISTRADOR.md) | Guia completo de governança com telas de gestão de usuários, resets de senhas, configuração de polos e regras automáticas. |

---

## 🛡️ Matriz de Permissões e Acessos por Perfil

| Módulo / Funcionalidade | Atendente | Supervisora | Administrador |
| :--- | :---: | :---: | :---: |
| **Login e Autenticação Supabase** | ✅ | ✅ | ✅ |
| **Dashboard e Indicadores Principais** | ✅ (Unidades atribuídas) | ✅ (Unidades atribuídas) | ✅ (Todas as Unidades) |
| **Filtro Dinâmico de Municípios por Unidade** | ✅ | ✅ | ✅ |
| **Cadastro de Novos Pacientes** | ✅ | ✅ | ✅ |
| **Registro de Tentativas de Contato** | ✅ | ✅ | ✅ |
| **Registro de Faltas** | ✅ | ✅ | ✅ |
| **Registro de Evolução Clínica** | ✅ | ✅ | ✅ |
| **Visualização de Prontuário e Linha do Tempo** | ✅ | ✅ | ✅ |
| **Edição de Paciente Após Criação** | ❌ | ✅ | ✅ |
| **Definição de Prioridade de Regulação (*Override*)** | ❌ | ✅ | ✅ |
| **Exclusão de Paciente (com Justificativa)** | ❌ | ❌ | ✅ |
| **Emissão e Visualização de Relatórios** | ✅ (Básico) | ✅ (Completo) | ✅ (Completo) |
| **Exportação de Relatórios para Excel (.xlsx)** | ❌ | ✅ | ✅ |
| **Impressão de Relatórios em PDF** | ✅ | ✅ | ✅ |
| **Gestão de Procedimentos e SIGTAP** | ❌ | ✅ | ✅ |
| **Gestão de Médicos Oftalmologistas e CRM** | ❌ | ✅ | ✅ |
| **Gestão de Municípios Conveniados** | ❌ | ✅ | ✅ |
| **Trilha de Auditoria Clínica (Audit Logs)** | ❌ | ✅ | ✅ |
| **Criação e Gestão de Usuários e Senhas** | ❌ | ❌ | ✅ |
| **Reset Administrativo de Senhas com Forçamento** | ❌ | ❌ | ✅ |
| **Gestão de Unidades / Polos de Saúde** | ❌ | ❌ | ✅ |
| **Parametrização de Regras Automáticas** | ❌ | ❌ | ✅ |

---

## 🔒 Diretrizes Gerais de Segurança da Informação
1. **Credenciais Individuais**: É expressamente proibido o uso compartilhado de logins e senhas.
2. **Troca Periódica**: Todo usuário deve manter sua senha protegida.
3. **Bloqueio por Inatividade**: O sistema encerra automaticamente a sessão após **15 minutos** sem uso.
4. **Conformidade Legal**: Todas as inserções, edições e regras automáticas são registradas de forma imutável no módulo de auditoria para fins de controle e conformidade com a LGPD e o SUS.
