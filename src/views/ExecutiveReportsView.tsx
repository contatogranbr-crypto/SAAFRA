// Relatórios Executivos & Central de Auditoria - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  AuditLog, 
  CashFlowMonthlySummary, 
  CropPlanningItem, 
  DebtLiability, 
  RestructuringAction, 
  RiskAlert, 
  ScenarioSimulation 
} from '../types';
import { FinancialEngine } from '../services/financialEngine';

interface ExecutiveReportsViewProps {
  crops: CropPlanningItem[];
  monthlySummaries: CashFlowMonthlySummary[];
  debts: DebtLiability[];
  risks: RiskAlert[];
  actions: RestructuringAction[];
  scenarios: ScenarioSimulation[];
  auditLogs: AuditLog[];
  onRollbackLog: (logId: string) => void;
  currentSafra: string;
}

export const ExecutiveReportsView: React.FC<ExecutiveReportsViewProps> = ({
  crops,
  monthlySummaries,
  debts,
  risks,
  actions,
  scenarios,
  auditLogs,
  onRollbackLog,
  currentSafra
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'audit'>('dossier');

  const totalGrossRevenue = crops.reduce((acc, c) => acc + c.grossRevenue, 0);
  const totalCost = crops.reduce((acc, c) => acc + c.totalOperatingCost, 0);
  const grossMargin = totalGrossRevenue - totalCost;
  const debtMetrics = FinancialEngine.calculateDebtMetrics(debts);
  const finalCash = monthlySummaries[monthlySummaries.length - 1]?.endingBalance || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner (No Print) */}
      <div className="glass-panel no-print" style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Relatórios Executivos & Auditoria</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Dossiê Financeiro Completo da Consultoria Gran Bernardo e Trilha de Conformidade LGPD
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-surface-2)', padding: '3px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('dossier')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'dossier' ? 'var(--agro-green-600)' : 'transparent',
                color: '#fff'
              }}
            >
              Dossiê Executivo (PDF)
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'audit' ? 'var(--agro-green-600)' : 'transparent',
                color: '#fff'
              }}
            >
              Trilha de Auditoria ({auditLogs.length})
            </button>
          </div>

          {activeTab === 'dossier' && (
            <button onClick={handlePrint} className="btn btn-primary">
              <Printer size={16} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DOSSIÊ EXECUTIVO DE CONSULTORIA (PRINTABLE) */}
      {activeTab === 'dossier' && (
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
          
          {/* Official Letterhead Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '2px solid rgba(16, 185, 129, 0.4)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>🌱</span>
                <div>
                  <h1 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#fff' }}>
                    GRAN BERNARDO CONSULTORIA & REESTRUTURAÇÃO
                  </h1>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                    Divisão de Inteligência Financeira e Agronômica Rural
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div><strong>Documento:</strong> Dossiê Executivo de Safra</div>
              <div><strong>Safra:</strong> {currentSafra}</div>
              <div><strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
              <div><strong>Status:</strong> Oficial / Parecer Conclusivo</div>
            </div>
          </div>

          {/* Client & Farm Identification */}
          <div style={{
            background: 'var(--bg-surface-2)',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '0.8rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Propriedade:</span>
              <strong style={{ color: '#fff' }}>Fazenda Santa Maria (Sede)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Grupo Econômico:</span>
              <strong style={{ color: '#fff' }}>Grupo Agropecuário Santa Maria</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Localização:</span>
              <strong style={{ color: '#fff' }}>Rio Verde / GO</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Consultor Responsável:</span>
              <strong style={{ color: '#34d399' }}>Dr. Roberto Bernardo (CRA/OAB)</strong>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px', borderLeft: '3px solid #00f2fe', paddingLeft: '10px' }}>
              1. Sumário Executivo & Diagnóstico Econômico
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.6, textAlign: 'justify' }}>
              O presente relatório consolida o diagnóstico da <strong>Safra {currentSafra}</strong> do Grupo Santa Maria, compreendendo 2.450 hectares totais e 2.800 hectares cultivados (Soja Verão e Milho Safrinha). A receita operacional projetada é de <strong>R$ {(totalGrossRevenue / 1000000).toFixed(2)} milhões</strong>, contra custos operacionais de produção de <strong>R$ {(totalCost / 1000000).toFixed(2)} milhões</strong>, gerando margem operacional bruta de <strong>R$ {(grossMargin / 1000000).toFixed(2)} milhões</strong> ({((grossMargin / totalGrossRevenue) * 100).toFixed(1)}%).
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '8px', textAlign: 'justify' }}>
              Entretanto, a estrutura de passivos bancários e com tradings totaliza <strong>R$ {(debtMetrics.totalBalance / 1000000).toFixed(2)} milhões</strong>, sendo {debtMetrics.shortTermPercent.toFixed(0)}% com vencimento nos próximos 12 meses. O descasamento entre a colheita dos grãos e o vencimento das cédulas de crédito rural em maio exige a execução imediata do <strong>Plano de Reestruturação Extrajudicial</strong> para evitar asfixia de liquidez.
            </p>
          </div>

          {/* Section 2: Financial Highlights Table */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '10px', borderLeft: '3px solid #00f2fe', paddingLeft: '10px' }}>
              2. Quadro Resumo de Indicadores da Safra
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: '#fff' }}>Cultura</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Área (ha)</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Produtividade</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Preço Unitário</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Receita Bruta</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Custo/ha</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Break-Even</th>
                  <th style={{ padding: '8px 12px', color: '#fff', textAlign: 'right' }}>Margem Bruta</th>
                </tr>
              </thead>
              <tbody>
                {crops.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>{c.crop}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{c.plantedAreaHa.toLocaleString('pt-BR')} ha</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{c.expectedYieldScHa} sc/ha</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>R$ {c.expectedPricePerSc.toFixed(2)}/sc</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>R$ {(c.grossRevenue / 1000000).toFixed(2)}M</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>R$ {c.operatingCostPerHa.toLocaleString('pt-BR')}/ha</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#fbbf24' }}>{c.breakEvenScHa.toFixed(1)} sc/ha</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>{c.marginPercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Liabilities Breakdown */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '10px', borderLeft: '3px solid #f87171', paddingLeft: '10px' }}>
              3. Raio-X do Endividamento & Garantias Fiduciárias
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {debts.map(d => (
                <div key={d.id} style={{
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#fff' }}>{d.creditor} ({d.operationType})</strong>
                    <span className={`badge ${d.status === 'normal' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                      {d.status}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Saldo: <strong style={{ color: '#f87171' }}>R$ {d.currentBalance.toLocaleString('pt-BR')}</strong></div>
                  <div style={{ color: 'var(--text-muted)' }}>Taxa: {d.annualInterestRate}% a.a. | Vencimento: {d.nextDueDate}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>Garantia: {d.guarantees}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Restructuring Plan Summary */}
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '10px', borderLeft: '3px solid #fbbf24', paddingLeft: '10px' }}>
              4. Ações Prioritárias de Reestruturação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actions.map(act => (
                <div key={act.id} style={{
                  background: 'var(--bg-surface-2)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{act.action}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Responsável: {act.responsible} • Prazo: {act.deadline}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      +R$ {(act.estimatedImpactR$ / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginTop: '30px',
            paddingTop: '30px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ width: '220px', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 8px' }} />
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Dr. Roberto Bernardo</strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gran Bernardo Consultoria & Reestruturações</div>
            </div>

            <div>
              <div style={{ width: '220px', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 8px' }} />
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Carlos Eduardo Bernardo</strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grupo Agropecuário Santa Maria (Produtor)</div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUDIT TRAIL LOGS (LGPD COMPLIANT) */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Trilha de Auditoria & Histórico de Alterações</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Rastreabilidade imutável de todas as edições, importações e lançamentos. Conformidade com governança e LGPD.
              </p>
            </div>

            <span className="badge badge-green">
              {auditLogs.length} Registros Auditados
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Data / Hora</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Módulo / Entidade</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Origem</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Valor Original</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Valor Atual</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Usuário Responsável</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Justificativa</th>
                  <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '0.74rem' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 600 }}>
                      {log.field}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${
                        log.source === 'import_excel' ? 'badge-green' :
                        log.source === 'ai_assistant' ? 'badge-cyan' : 'badge-amber'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {log.source === 'import_excel' ? 'Excel' : log.source === 'ai_assistant' ? 'IA Chat' : 'Manual'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-subtle)' }}>
                      {log.originalValue}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 600 }}>
                      {log.currentValue}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                      {log.user}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {log.reason}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {log.canRollback && (
                        <button
                          onClick={() => onRollbackLog(log.id)}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                          title="Restaurar valor original"
                        >
                          <RotateCcw size={11} />
                          <span>Reverter</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
