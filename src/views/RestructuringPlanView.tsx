// Plano de Reestruturação Gran Bernardo Agro - Quadro de Ações
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  User, 
  DollarSign, 
  ArrowRight,
  Send
} from 'lucide-react';
import { RestructuringAction } from '../types';

interface RestructuringPlanViewProps {
  actions: RestructuringAction[];
  onAddAction: (action: RestructuringAction) => void;
  onUpdateActionStatus: (actionId: string, newStatus: RestructuringAction['status']) => void;
  onAddHistoryNote: (actionId: string, note: string) => void;
}

export const RestructuringPlanView: React.FC<RestructuringPlanViewProps> = ({
  actions,
  onAddAction,
  onUpdateActionStatus,
  onAddHistoryNote
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNoteActionId, setActiveNoteActionId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Form State
  const [problem, setProblem] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [responsible, setResponsible] = useState('Dr. Roberto Bernardo (Consultor Gran Bernardo)');
  const [deadline, setDeadline] = useState('2025-03-30');
  const [priority, setPriority] = useState<RestructuringAction['priority']>('alta');
  const [impactR$, setImpactR$] = useState('500000');

  const pendingCount = actions.filter(a => a.status === 'a_iniciar').length;
  const inProgressCount = actions.filter(a => a.status === 'em_andamento').length;
  const completedCount = actions.filter(a => a.status === 'concluido').length;
  const totalImpact = actions.reduce((acc, a) => acc + a.estimatedImpactR$, 0);

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    const impactVal = parseFloat(impactR$.replace(/\./g, '').replace(',', '.')) || 0;

    const newAct: RestructuringAction = {
      id: `act-${Date.now()}`,
      problem,
      action: actionDesc,
      responsible,
      deadline,
      priority,
      status: 'a_iniciar',
      estimatedImpactR$: impactVal,
      documents: ['Parecer_Gran_Bernardo.pdf'],
      historyNotes: [`${new Date().toLocaleDateString('pt-BR')}: Ação cadastrada no plano de reestruturação.`]
    };

    onAddAction(newAct);
    setIsModalOpen(false);
    setProblem('');
    setActionDesc('');
  };

  const handleSendNote = (actionId: string) => {
    if (!newNoteText.trim()) return;
    const formatted = `${new Date().toLocaleDateString('pt-BR')}: ${newNoteText.trim()}`;
    onAddHistoryNote(actionId, formatted);
    setNewNoteText('');
    setActiveNoteActionId(null);
  };

  const columns: { status: RestructuringAction['status']; label: string; count: number; color: string }[] = [
    { status: 'a_iniciar', label: 'A Iniciar', count: pendingCount, color: '#00f2fe' },
    { status: 'em_andamento', label: 'Em Andamento', count: inProgressCount, color: '#f97316' },
    { status: 'concluido', label: 'Concluído', count: completedCount, color: '#10b981' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Plano de Reestruturação Agropecuária</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Ações Estratégicas Gran Bernardo: Alongamento Bancário, Renegociação de Barter e Eficiência Fiscal
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Impacto Financeiro Estimado:</span>
            <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>
              +R$ {(totalImpact / 1000000).toFixed(2)}M no Caixa
            </strong>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Nova Ação Estratégica</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        {columns.map(col => {
          const colActions = actions.filter(a => a.status === col.status);

          return (
            <div key={col.status} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Column Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '10px',
                borderBottom: `2px solid ${col.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{col.label}</strong>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  {colActions.length}
                </span>
              </div>

              {/* Action Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
                {colActions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                    Nenhuma ação nesta etapa.
                  </div>
                ) : (
                  colActions.map(action => (
                    <div
                      key={action.id}
                      style={{
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Priority & Deadline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${
                          action.priority === 'urgente' ? 'badge-red' :
                          action.priority === 'alta' ? 'badge-amber' : 'badge-green'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {action.priority}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          <span>Prazo: {action.deadline}</span>
                        </div>
                      </div>

                      {/* Problem & Action */}
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#fbbf24', marginBottom: '3px' }}>
                          <strong>Problema:</strong> {action.problem}
                        </div>
                        <p style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.4 }}>
                          {action.action}
                        </p>
                      </div>

                      {/* Responsible & Impact */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 10px',
                        borderRadius: '6px'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          👤 {action.responsible.split('(')[0]}
                        </span>
                        <strong style={{ color: '#34d399' }}>
                          +R$ {(action.estimatedImpactR$ / 1000).toFixed(0)}k
                        </strong>
                      </div>

                      {/* Documents Attachments */}
                      {action.documents && action.documents.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {action.documents.map((doc, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.68rem',
                              color: 'var(--text-subtle)',
                              background: 'var(--bg-surface-3)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FileText size={10} color="#34d399" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* History Logs Preview */}
                      {action.historyNotes && action.historyNotes.length > 0 && (
                        <div style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '8px',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)'
                        }}>
                          <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '2px' }}>Último Checkpoint:</span>
                          <span style={{ fontStyle: 'italic' }}>
                            {action.historyNotes[action.historyNotes.length - 1]}
                          </span>
                        </div>
                      )}

                      {/* Add History Note Input Toggle */}
                      {activeNoteActionId === action.id ? (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input
                            type="text"
                            placeholder="Adicionar nota de negociação..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            style={{
                              flex: 1,
                              background: 'var(--bg-surface-3)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              color: '#fff',
                              fontSize: '0.74rem',
                              outline: 'none'
                            }}
                          />
                          <button onClick={() => handleSendNote(action.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                            <Send size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveNoteActionId(action.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-subtle)',
                            fontSize: '0.7rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: '2px 0'
                          }}
                        >
                          + Adicionar atualização de histórico
                        </button>
                      )}

                      {/* Action Status Movement Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Mover:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {action.status !== 'a_iniciar' && (
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'a_iniciar')}
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                            >
                              A Iniciar
                            </button>
                          )}
                          {action.status !== 'em_andamento' && (
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'em_andamento')}
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                            >
                              Andamento
                            </button>
                          )}
                          {action.status !== 'concluido' && (
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'concluido')}
                              className="btn btn-primary"
                              style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                            >
                              <CheckCircle2 size={12} />
                              <span>Concluir</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: NOVA AÇÃO DE REESTRUTURAÇÃO */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            background: '#0e1713',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Cadastrar Nova Ação de Reestruturação</h3>

            <form onSubmit={handleCreateAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Problema Identificado
                </label>
                <input
                  type="text"
                  placeholder="Ex: Concentração de vencimento em maio ou juros elevados"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ação Proposta / Plano de Execução
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Reescalonamento com o banco com carência de 12 meses..."
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Impacto Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={impactR$}
                    onChange={(e) => setImpactR$(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
