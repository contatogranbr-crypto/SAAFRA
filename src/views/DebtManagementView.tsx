// Endividamento & Gestão de Passivos - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';
import { DebtLiability, DebtStatus, DebtTerm } from '../types';
import { FinancialEngine } from '../services/financialEngine';

interface DebtManagementViewProps {
  debts: DebtLiability[];
  onAddDebt: (debt: DebtLiability) => void;
  onUpdateDebt: (debt: DebtLiability) => void;
  onNavigateToScenarios: () => void;
}

export const DebtManagementView: React.FC<DebtManagementViewProps> = ({
  debts,
  onAddDebt,
  onUpdateDebt,
  onNavigateToScenarios
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [creditor, setCreditor] = useState('');
  const [creditorType, setCreditorType] = useState<any>('Banco Comercial');
  const [operationType, setOperationType] = useState<any>('Custeio Agrícola');
  const [contractNumber, setContractNumber] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('11.5');
  const [nextDueDate, setNextDueDate] = useState('');
  const [nextDueAmount, setNextDueAmount] = useState('');
  const [term, setTerm] = useState<DebtTerm>('curto');
  const [status, setStatus] = useState<DebtStatus>('normal');
  const [guarantees, setGuarantees] = useState('');

  const metrics = FinancialEngine.calculateDebtMetrics(debts);

  const filteredDebts = debts.filter(d => {
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const origVal = parseFloat(originalAmount.replace(/\./g, '').replace(',', '.')) || 0;
    const currVal = parseFloat(currentBalance.replace(/\./g, '').replace(',', '.')) || 0;
    const dueVal = parseFloat(nextDueAmount.replace(/\./g, '').replace(',', '.')) || currVal;
    const rateVal = parseFloat(annualInterestRate.replace(',', '.')) || 12;

    const newDebt: DebtLiability = {
      id: `debt-${Date.now()}`,
      creditor: creditor.trim() || 'Banco',
      creditorType,
      operationType,
      contractNumber: contractNumber.trim() || `CTR-${Math.floor(Math.random() * 90000 + 10000)}`,
      originalAmount: origVal,
      currentBalance: currVal,
      annualInterestRate: rateVal,
      installmentsTotal: 1,
      installmentsRemaining: 1,
      nextDueDate: nextDueDate || '2025-05-30',
      nextDueAmount: dueVal,
      term,
      status,
      guarantees: guarantees.trim() || 'Aval dos Sócios e Safra',
      relatedSafra: '2024/2025',
      farmId: 'farm-01'
    };

    onAddDebt(newDebt);
    setIsModalOpen(false);
    setCreditor('');
    setOriginalAmount('');
    setCurrentBalance('');
    setNextDueAmount('');
    setGuarantees('');
  };

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
          <h2 style={{ fontSize: '1.3rem' }}>Endividamento & Gestão de Passivos Bancários</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Raio-X de Credores, Amortizações, Garantias e Cronograma de Vencimento
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onNavigateToScenarios} className="btn btn-secondary">
            <Percent size={15} color="#fbbf24" />
            <span>Simular Alongamento / Deságio</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Nova Operação de Crédito</span>
          </button>
        </div>
      </div>

      {/* Debt KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>PASSIVO TOTAL CONSOLIDADO</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#f87171', marginTop: '4px' }}>
            R$ {(metrics.totalBalance / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Soma de Todos os Credores</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>CURTO PRAZO (&lt; 12 MESES)</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fbbf24', marginTop: '4px' }}>
            R$ {(metrics.shortTermBalance / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
            {metrics.shortTermPercent.toFixed(1)}% do passivo total
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>LONGO PRAZO (&gt; 36 MESES)</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '4px' }}>
            R$ {(metrics.longTermBalance / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Finame & Maquinários</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>PARCELAS EM ATRASO</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: metrics.pastDueBalance > 0 ? '#ef4444' : '#34d399', marginTop: '4px' }}>
            R$ {(metrics.pastDueBalance / 1000).toFixed(0)} mil
          </div>
          <span style={{ fontSize: '0.72rem', color: metrics.pastDueBalance > 0 ? '#ef4444' : '#34d399' }}>
            {metrics.pastDueBalance > 0 ? 'Risco iminente de execução' : 'Nenhuma parcela atrasada'}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>TAXA MÉDIA PONDERADA</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
            {metrics.averageInterestRate.toFixed(2)}% a.a.
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Custo médio de capital</span>
        </div>
      </div>

      {/* Creditor Concentration Bar Chart */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Concentração por Credor e Instituição Financeira</h3>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Distribuição proporcional da dívida por banco, cooperativa ou fornecedor
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {metrics.creditorConcentration.map((c, idx) => (
            <div key={c.creditor}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{c.creditor}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  R$ {(c.amount / 1000000).toFixed(2)}M <strong style={{ color: c.percentage > 35 ? '#f87171' : '#34d399' }}>({c.percentage.toFixed(1)}%)</strong>
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${c.percentage}%`,
                  height: '100%',
                  background: idx === 0 && c.percentage > 35 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#10b981',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debts Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.05rem' }}>Operações de Crédito & Financiamentos Ativos</h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">Todas as Situações</option>
              <option value="normal">Normal</option>
              <option value="vencida">Vencida</option>
              <option value="prorrogada">Prorrogada</option>
              <option value="renegociada">Renegociada</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Credor / Banco</th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Operação & Contrato</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Saldo Devedor</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Juros</th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Próximo Vencimento</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Valor Parcela</th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Garantias</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Prazo</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: d.status === 'vencida' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Landmark size={15} color={d.status === 'vencida' ? '#f87171' : '#10b981'} />
                      <span>{d.creditor}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', marginLeft: '23px' }}>
                      {d.creditorType}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#ffffff', fontWeight: 500 }}>{d.operationType}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', fontFamily: 'JetBrains Mono' }}>
                      {d.contractNumber}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#f87171' }}>
                    R$ {d.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {d.annualInterestRate.toFixed(1)}% a.a.
                  </td>
                  <td style={{ padding: '12px', color: d.status === 'vencida' ? '#f87171' : 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {d.nextDueDate}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                    R$ {d.nextDueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.73rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
                    {d.guarantees}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span className={`badge ${d.term === 'curto' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                      {d.term}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span className={`badge ${
                      d.status === 'normal' ? 'badge-green' :
                      d.status === 'vencida' ? 'badge-red' :
                      d.status === 'prorrogada' ? 'badge-amber' : 'badge-purple'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVA OPERAÇÃO DE CRÉDITO */}
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
            maxWidth: '540px',
            padding: '24px',
            background: '#0e1713',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Cadastrar Nova Dívida / Operação Bancária</h3>

            <form onSubmit={handleSaveDebt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Credor / Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Banco do Brasil, Sicredi..."
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
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
                    Tipo de Operação
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value as any)}
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
                    <option value="Custeio Agrícola">Custeio Agrícola</option>
                    <option value="Finame / Máquinas">Finame / Máquinas</option>
                    <option value="CPR Financeira">CPR Financeira</option>
                    <option value="Barter Insumos">Barter Insumos</option>
                    <option value="Capital de Giro">Capital de Giro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Número do Contrato / Cédula
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BB-CUST-2024/01"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
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
                    Saldo Devedor Atual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
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
                    Taxa de Juros (% a.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(e.target.value)}
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
                    Próximo Vencimento
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
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
                    Prazo
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as DebtTerm)}
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
                    <option value="curto">Curto Prazo (&lt; 12 meses)</option>
                    <option value="medio">Médio Prazo (12 a 36 meses)</option>
                    <option value="longo">Longo Prazo (&gt; 36 meses)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Situação Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DebtStatus)}
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
                    <option value="normal">Normal</option>
                    <option value="vencida">Vencida em Atraso</option>
                    <option value="prorrogada">Prorrogada (MCR)</option>
                    <option value="renegociada">Em Renegociação</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Garantias Vinculadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Penhor de 20.000 sacas de soja, Hipoteca Fazenda..."
                  value={guarantees}
                  onChange={(e) => setGuarantees(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
