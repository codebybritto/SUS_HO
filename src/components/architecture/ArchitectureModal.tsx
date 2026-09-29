import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Database,
  Shield,
  Layers,
  GitBranch,
  FileText,
  Sliders,
  CheckCircle,
  Cpu,
  Lock,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('arch');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden my-6 border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Proposta de Arquitetura Técnica & Especificação do Sistema
              </h2>
              <p className="text-xs text-slate-400">
                Modelo de dados, fluxo de vida do paciente, regras automáticas e rastreabilidade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex space-x-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'arch', label: '1. Visão Geral & Stack' },
            { id: 'db', label: '2. Banco de Dados & Entidades' },
            { id: 'rbac', label: '3. Usuários, Unidades & RBAC' },
            { id: 'flow', label: '4. Fluxo & Regras Automáticas' },
            { id: 'audit', label: '5. Timeline & Auditoria' },
            { id: 'reports', label: '6. Relatórios & Dashboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-teal-600 text-teal-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
          {activeSection === 'arch' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                1. Arquitetura do Sistema e Stack Tecnológica Recomendada
              </h3>
              <p>
                O sistema foi concebido sob uma <strong>Arquitetura Orientada a Serviços e Eventos</strong> (Clean Architecture),
                com separação estrita entre a camada de regulação/gestão de fluxo de pacientes e prontuários clínicos tradicionais.
                O foco primordial é o <em>controle operacional da fila de atendimento</em>, rastreamento de tentativas de contato, controle de faltas e conformidade de regulação.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>Frontend & Experiência do Atendente</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>React 19 + TypeScript</strong>: Interfaces reativas com tipagem estrita de status, lateralidade e permissões.</li>
                    <li><strong>Tailwind CSS</strong>: Design limpo, alto contraste WCAG AA, sem elementos supérfluos.</li>
                    <li><strong>Atalhos e Ações Rápidas</strong>: Fluxo otimizado com no máximo 2 cliques para registrar contato ou evolução.</li>
                    <li><strong>Suporte a Impressão e PDF Nativo</strong>: Layouts de relatório com cabeçalho oficial e exportação direta.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Cpu className="w-4 h-4 text-teal-600" />
                    <span>Backend & Persistência</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Motor de Regras de Negócio (BRMS)</strong>: Avaliação síncrona pós-ação de contatos e faltas.</li>
                    <li><strong>Event Sourcing & Timeline Imutável</strong>: Todos os eventos de pacientes geram registros somente de anexação (append-only).</li>
                    <li><strong>Banco de Dados Híbrido</strong>: PostgreSQL (relacional com RBAC e constraints) + Log append-only particionado.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'db' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                2. Estrutura do Banco de Dados & Entidades
              </h3>
              <p>
                A modelagem de dados assegura integridade referencial, isolamento multi-unidade e auditoria com snapshots de valores anteriores e novos.
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5">Entidade / Tabela</th>
                      <th className="p-2.5">Campos Principais</th>
                      <th className="p-2.5">Relacionamentos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_unidades</td>
                      <td className="p-2.5">id, nome, codigo, cnes, cidade, uf, ativo, telefone, endereco</td>
                      <td className="p-2.5">1:N com pacientes, N:N com procedimentos, N:N com médicos, N:N com usuários</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_usuarios</td>
                      <td className="p-2.5">id, nome, login, senha_hash, perfil, ativo, permissoes_json, criado_em</td>
                      <td className="p-2.5">N:N com unidades (tb_usuario_unidades)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_procedimentos</td>
                      <td className="p-2.5">id, nome, codigo_sigtap, ativo, requer_lateralidade</td>
                      <td className="p-2.5">N:N com unidades (tb_procedimento_unidades)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_medicos</td>
                      <td className="p-2.5">id, nome, crm, uf_crm, especialidade, ativo</td>
                      <td className="p-2.5">N:N com unidades (tb_medico_unidades)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_pacientes</td>
                      <td className="p-2.5">id, nome, cns, cpf, data_nasc, procedimento_id, olho (AO/OD/OE), urgente, municipio, acompanhamento, status_atual, unidade_id, is_deleted</td>
                      <td className="p-2.5">N:1 com unidade, N:1 com procedimento, N:1 com médico, 1:N com timeline, 1:N com contatos, 1:N com faltas</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_tentativas_contato</td>
                      <td className="p-2.5">id, paciente_id, numero_tentativa (1..3), data, hora, canal, resultado, is_successful, usuario_id, observacao</td>
                      <td className="p-2.5">N:1 com paciente, N:1 com usuário</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_ocorrencias_faltas</td>
                      <td className="p-2.5">id, paciente_id, numero_falta (1..N), data_falta, data_agendada, motivo, usuario_id</td>
                      <td className="p-2.5">N:1 com paciente, N:1 com usuário</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_timeline_eventos</td>
                      <td className="p-2.5">id, paciente_id, data, hora, acao, tipo_evento, status_anterior, novo_status, descricao, usuario_id, is_automatic</td>
                      <td className="p-2.5">N:1 com paciente, imutável append-only</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold font-mono text-teal-800">tb_auditoria_logs</td>
                      <td className="p-2.5">id, timestamp, usuario_id, acao, entidade_tipo, entidade_id, valores_anteriores_json, novos_valores_json</td>
                      <td className="p-2.5">N:1 com usuário (ou Sistema Automático)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'rbac' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                3. Sistema de Usuários, Unidades & Permissões Granulares (RBAC)
              </h3>
              <p>
                O controle de acesso combina <strong>Escopo Organizacional</strong> (unidades atribuídas) com <strong>Permissões Funcionais Granulares</strong>.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-800 block">Regra de Isolamento Multi-Unidade:</span>
                <p className="text-slate-600">
                  Um atendente vinculado apenas à Unidade Norte <strong>não tem acesso</strong> de leitura ou escrita a pacientes de outras unidades.
                  Mesmo na barra de busca global ou nos relatórios consolidados, as consultas são automaticamente restritas às unidades autorizadas no perfil do usuário logado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { role: 'Atendente / Regulador', desc: 'Cadastra pacientes, registra contatos, tratativas e faltas. Filtra procedimentos da unidade de trabalho.' },
                  { role: 'Coordenador / Supervisor', desc: 'Acessa relatórios consolidados, exportações CSV/PDF, auditoria de pacientes e reclassificação de status.' },
                  { role: 'Administrador Geral', desc: 'Gerencia usuários, unidades, tabela de procedimentos SIGTAP, corpo clínico e regras automáticas globais.' },
                ].map((item) => (
                  <div key={item.role} className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="font-bold text-teal-800">{item.role}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'flow' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                4. Fluxo do Paciente & Mecanismo de Regras Automáticas
              </h3>
              <p>
                O ciclo de vida do paciente inicia no cadastro na fila de regulação e encerra em Conclusão Cirúrgica, Micrologos, Desistência ou Óbito.
              </p>

              {/* State diagram */}
              <div className="p-4 bg-slate-900 text-white rounded-lg space-y-3 font-mono text-[11px]">
                <div className="text-teal-400 font-bold uppercase">Diagrama de Transição de Condições:</div>
                <div className="space-y-1 text-slate-300">
                  <div>[Cadastro Inicial] ──&gt; (Aguardando Contato)</div>
                  <div>(Aguardando Contato) ──[Regulação Aprovada]──&gt; (Regulado)</div>
                  <div>(Regulado) ──[Agendamento de Data]──&gt; (Agendado)</div>
                  <div className="text-amber-300">
                    (Agendado) ──[1ª Falta]──&gt; (Faltou) ──[2ª Falta Consecutiva]──&gt; [AUTO: MICROLOGOS]
                  </div>
                  <div className="text-amber-300">
                    (Aguardando) ──[1ª e 2ª Falha]──&gt; (Tentativa 3 s/ êxito) ──&gt; [AUTO: MICROLOGOS]
                  </div>
                  <div>(Qualquer Status) ──[Atestado / Hospitalização]──&gt; (Doente)</div>
                  <div>(Qualquer Status) ──[Formalização]──&gt; (Desistência / Óbito)</div>
                  <div>(Agendado) ──[Procedimento Realizado]──&gt; (Concluído)</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                <strong>Gatilhos Automáticos (Configuráveis no Painel Admin):</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Regra de 2 Faltas:</strong> Ao atingir a 2ª falta registrada, o robô do sistema atualiza o status para <em>Micrologos</em>, adiciona a evolução correspondente e cria o evento de Timeline com etiqueta explícita de "Regra Automática".</li>
                  <li><strong>Regra de 3 Tentativas de Contato:</strong> Ao registrar a 3ª tentativa sem sucesso (chamou até cair, número inexistente, etc.), o paciente migra automaticamente para <em>Micrologos</em>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'audit' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                5. Sistema de Timeline & Trilha de Auditoria
              </h3>
              <p>
                Garantia de <strong>não-repúdio, rastreabilidade e integridade legal</strong> exigida em sistemas públicos de saúde.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 text-xs mb-1">Timeline do Paciente</div>
                  <p className="text-slate-600">
                    Histórico cronológico voltado à operação clínica e administrativa. Exibe o caminho do paciente desde a data de entrada,
                    mudanças de status de regulação, tentativas de contato, faltas e gatilhos automáticos.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 text-xs mb-1">Auditoria Completa (Compliance)</div>
                  <p className="text-slate-600">
                    Trilha forense que registra <em>quem</em> executou a alteração, <em>quando</em> (timestamp preciso),
                    o <em>tipo de ação</em> e os objetos JSON de <strong>valores anteriores</strong> e <strong>novos valores</strong>.
                    Protegida contra exclusão física.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                6. Estrutura de Relatórios & Dashboard Gerencial
              </h3>
              <p>
                Fornece inteligência operacional para a Secretaria de Saúde e gestores de regulação.
              </p>

              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li><strong>Relatórios com Filtros Combinados:</strong> Cruzamento de Unidade, Procedimento, Faixa Etária, Município de Atendimento, Status de Regulação e Contagem de Faltas/Contatos.</li>
                <li><strong>Exportação Universal:</strong> Geração de planilhas compatíveis com Microsoft Excel e formato impresso/PDF oficial com cabeçalho limpo e totalizadores.</li>
                <li><strong>Dashboard de Controle de Gargalos:</strong> Indicadores em tempo real para identificação imediata de casos urgentes, pacientes que caíram em Micrologos e absenteísmo por procedimento.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
          >
            Fechar Especificação
          </button>
        </div>
      </div>
    </div>
  );
};
