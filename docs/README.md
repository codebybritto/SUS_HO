# Documentação Operacional e Manuais de Utilização por Perfil
**Sistema de Controle e Regulação de Pacientes Oftalmológicos (SUS - RJ)**

Bem-vindo à documentação oficial do sistema. Para assegurar a correta utilização, o cumprimento dos fluxos de trabalho e a segurança dos dados clínicos regulatórios, os manuais foram divididos de forma modular de acordo com as atribuições e níveis de acesso de cada perfil:

---

## 📚 Manuais Disponíveis

| Perfil | Documento | Principais Responsabilidades |
| :--- | :--- | :--- |
| **Atendente / Recepção** | [**`MANUAL_ATENDENTE.md`**](./MANUAL_ATENDENTE.md) | Cadastro de pacientes, busca ativa de contatos telefônicos, registro de faltas, evolução da situação do paciente e agendamentos. |
| **Supervisora / Coordenação** | [**`MANUAL_SUPERVISORA.md`**](./MANUAL_SUPERVISORA.md) | Gestão e ordenamento da fila cirúrgica, priorizações clínicas (*Priority Override*), tratativa de casos retidos em Micrologos, emissão e exportação de relatórios (Excel/PDF) e manutenção de cadastros de apoio. |
| **Administrador do Sistema** | [**`MANUAL_ADMINISTRADOR.md`**](./MANUAL_ADMINISTRADOR.md) | Gestão central de usuários e acessos (Supabase Auth), resets de senhas, configuração de polos/unidades e seus municípios, parametrização de regras automáticas e monitoramento da auditoria. |

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
