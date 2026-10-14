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
  const [filterCategory, setFilterCategory] = useState<'all' | 'bb' | 'silos_machinery' | 'suppliers' | 'mcr'>('all');
  const [viewUnit, setViewUnit] = useState<'currency' | 'sacks'>('currency');

  // Form State
  const [creditor, setCreditor] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [cedulaNumber, setCedulaNumber] = useState('');
  const [isUnderMcrProrrogation, setIsUnderMcrProrrogation] = useState(false);
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

  // Filtros combinados
  const filteredDebts = debts.filter(d => {
    // Filtro por categoria / credor
    if (filterCategory === 'bb' && !d.creditor.toLowerCase().includes('brasil')) return false;
    if (filterCategory === 'silos_machinery' && !d.creditor.toLowerCase().includes('silo') && !d.creditor.toLowerCase().includes('deere')) return false;
    if (filterCategory === 'suppliers' && (d.creditorType !== 'Fornecedor' && d.creditorType !== 'Trading / Revenda' && !d.creditor.toLowerCase().includes('parasul') && !d.creditor.toLowerCase().includes('syngenta') && !d.creditor.toLowerCase().includes('arrendamento'))) return false;
    if (filterCategory === 'mcr' && !d.isUnderMcrProrrogation && d.status !== 'em_prorrogacao' && d.status !== 'prorrogada') return false;

    // Filtro por status
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  const bbDebts = debts.filter(d => d.creditor.toLowerCase().includes('brasil'));
  const bbTotalBalance = bbDebts.reduce((sum, d) => sum + d.currentBalance, 0);
  const bbTotalSacks = Math.round(bbTotalBalance / 110);

  const formatValue = (amount: number) => {
    if (viewUnit === 'sacks') {
      const sacks = Math.round(amount / 110);
      return `${sacks.toLocaleString('pt-BR')} sc`;
    }
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const origVal = parseFloat(originalAmount.replace(/\./g, '').replace(',', '.')) || 0;
    const currVal = parseFloat(currentBalance.replace(/\./g, '').replace(',', '.')) || 0;
    const dueVal = parseFloat(nextDueAmount.replace(/\./g, '').replace(',', '.')) || currVal;
    const rateVal = parseFloat(annualInterestRate.replace(',', '.')) || 12;

    const newDebt: DebtLiability = {
      id: `debt-${Date.now()}`,
      creditor: creditor.trim() || 'Banco',
      beneficiaryName: beneficiaryName.trim() || undefined,
      cedulaNumber: cedulaNumber.trim() || undefined,
      isUnderMcrProrrogation,
      creditorType,
      operationType,
      contractNumber: contractNumber.trim() || `CTR-${Math.floor(Math.random() * 90000 + 10000)}`,
      originalAmount: origVal,
      currentBalance: currVal,
      equivalentSacksSoja: Math.round(currVal / 110),
      annualInterestRate: rateVal,
      installmentsTotal: 1,
      installmentsRemaining: 1,
      nextDueDate: nextDueDate || '2025-05-30',
      nextDueAmount: dueVal,
      term,
      status: isUnderMcrProrrogation ? 'em_prorrogacao' : status,
      guarantees: guarantees.trim() || 'Aval dos Sócios e Safra',
      relatedSafra: '2024/2025',
      farmId: 'farm-01'
    };

    onAddDebt(newDebt);
    setIsModalOpen(false);
    setCreditor('');
    setBeneficiaryName('');
    setCedulaNumber('');
    setIsUnderMcrProrrogation(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Endividamento & Gestão de Passivos Bancários</h2>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              Base Real Safra 25/26
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
            Raio-X de Cédulas Rurais, Credores, Silos Klepper, MCR 2.6.9 e Cronograma de Vencimento
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Seletor de Unidade: R$ vs Sacas de Soja */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-2)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setViewUnit('currency')}
              className="btn"
              style={{
                padding: '5px 11px',
                fontSize: '0.75rem',
                background: viewUnit === 'currency' ? 'var(--cyan-glow)' : 'transparent',
                color: viewUnit === 'currency' ? '#000' : 'var(--text-muted)',
                fontWeight: viewUnit === 'currency' ? 700 : 500
              }}
            >
              Exibir em R$
            </button>
            <button
              onClick={() => setViewUnit('sacks')}
              className="btn"
              style={{
                padding: '5px 11px',
                fontSize: '0.75rem',
                background: viewUnit === 'sacks' ? 'var(--amber-400, #fbbf24)' : 'transparent',
                color: viewUnit === 'sacks' ? '#000' : 'var(--text-muted)',
                fontWeight: viewUnit === 'sacks' ? 700 : 500
              }}
            >
              Exibir em Sacas (sc)
            </button>
          </div>

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
            {viewUnit === 'sacks' 
              ? `${Math.round(metrics.totalBalance / 110).toLocaleString('pt-BR')} sc`
              : `R$ ${(metrics.totalBalance / 1000000).toFixed(2)}M`}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {viewUnit === 'sacks' ? 'Convertido a R$ 110,00/sc' : `${Math.round(metrics.totalBalance / 110).toLocaleString('pt-BR')} sacas de soja`}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>BANCO DO BRASIL (15 CÉDULAS)</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fbbf24', marginTop: '4px' }}>
            {viewUnit === 'sacks'
              ? `${bbTotalSacks.toLocaleString('pt-BR')} sc`
              : `R$ ${(bbTotalBalance / 1000000).toFixed(2)}M`}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
            {((bbTotalBalance / metrics.totalBalance) * 100).toFixed(1)}% do passivo total
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>SILO KLEPPER (5 SAFRAS)</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#38bdf8', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '10.946 sc' : 'R$ 1,20M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Parcela anual: 3.568 sc (R$ 392,5k)
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>EM PRORROGAÇÃO MCR 2.6.9</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '48.518 sc' : 'R$ 5,34M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#34d399' }}>
            3 cédulas BB protegidas
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>TAXA MÉDIA PONDERADA</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
            {metrics.averageInterestRate.toFixed(2)}% a.a.
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Custo médio de capital rural</span>
        </div>
      </div>

      {/* Creditor Concentration Bar Chart */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Concentração por Credor e Instituição Financeira</h3>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Distribuição proporcional da dívida por banco, fornecedor de estrutura ou barter
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {metrics.creditorConcentration.map((c, idx) => (
            <div key={c.creditor}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{c.creditor}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {viewUnit === 'sacks'
                    ? `${Math.round(c.amount / 110).toLocaleString('pt-BR')} sc`
                    : `R$ ${(c.amount / 1000000).toFixed(2)}M`}
                  {' '}<strong style={{ color: c.percentage > 35 ? '#f87171' : '#34d399' }}>({c.percentage.toFixed(1)}%)</strong>
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${c.percentage}%`,
                  height: '100%',
                  background: idx === 0 && c.percentage > 35 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#06b6d4',
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
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>Operações de Crédito & Cédulas Rurais Ativas ({filteredDebts.length})</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Metodologia Gran Bernardo de auditoria de contratos e verificação de garantias
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Filtros Rápidos Gran Bernardo */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: '8px' }}>
              <button
                onClick={() => setFilterCategory('all')}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterCategory === 'all' ? 'var(--cyan-glow)' : 'transparent',
                  color: filterCategory === 'all' ? '#000' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: filterCategory === 'all' ? 700 : 400
                }}
              >
                Todos ({debts.length})
              </button>
              <button
                onClick={() => setFilterCategory('bb')}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterCategory === 'bb' ? 'var(--cyan-glow)' : 'transparent',
                  color: filterCategory === 'bb' ? '#000' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: filterCategory === 'bb' ? 700 : 400
                }}
              >
                Banco do Brasil (15 Cédulas)
              </button>
              <button
                onClick={() => setFilterCategory('silos_machinery')}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterCategory === 'silos_machinery' ? 'var(--cyan-glow)' : 'transparent',
                  color: filterCategory === 'silos_machinery' ? '#000' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: filterCategory === 'silos_machinery' ? 700 : 400
                }}
              >
                Silo Klepper & Máquinas
              </button>
              <button
                onClick={() => setFilterCategory('suppliers')}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterCategory === 'suppliers' ? 'var(--cyan-glow)' : 'transparent',
                  color: filterCategory === 'suppliers' ? '#000' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: filterCategory === 'suppliers' ? 700 : 400
                }}
              >
                Insumos & Fornecedores
              </button>
              <button
                onClick={() => setFilterCategory('mcr')}
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterCategory === 'mcr' ? '#f59e0b' : 'transparent',
                  color: filterCategory === 'mcr' ? '#000' : '#fbbf24',
                  cursor: 'pointer',
                  fontWeight: filterCategory === 'mcr' ? 700 : 500
                }}
              >
                ⏳ MCR 2.6.9
              </button>
            </div>

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
              <option value="em_prorrogacao">Em Prorrogação MCR</option>
              <option value="prorrogada">Prorrogada</option>
              <option value="vencida">Vencida</option>
              <option value="renegociada">Renegociada</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Credor / Beneficiário</th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Operação & Cédula</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>
                  Saldo Devedor {viewUnit === 'sacks' ? '(sc)' : '(R$)'}
                </th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Juros</th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Próximo Vencimento</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>
                  Valor Parcela {viewUnit === 'sacks' ? '(sc)' : '(R$)'}
                </th>
                <th style={{ padding: '10px 12px', color: '#fff' }}>Garantias</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Prazo</th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: d.status === 'vencida' ? 'rgba(239, 68, 68, 0.05)' : d.isUnderMcrProrrogation ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Landmark size={15} color={d.status === 'vencida' ? '#f87171' : d.isUnderMcrProrrogation ? '#fbbf24' : '#06b6d4'} />
                      <span>{d.creditor}</span>
                    </div>
                    {d.beneficiaryName ? (
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'block', marginLeft: '23px', fontWeight: 500 }}>
                        Beneficiário: {d.beneficiaryName}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block', marginLeft: '23px' }}>
                        {d.creditorType}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 500 }}>{d.operationType}</span>
                      {d.isUnderMcrProrrogation && (
                        <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          MCR 2.6.9
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: d.cedulaNumber ? '#fbbf24' : 'var(--text-subtle)', display: 'block', fontFamily: 'JetBrains Mono' }}>
                      {d.cedulaNumber ? `Cédula: ${d.cedulaNumber}` : d.contractNumber}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#f87171' }}>
                    {formatValue(d.currentBalance)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {d.annualInterestRate > 0 ? `${d.annualInterestRate.toFixed(1)}% a.a.` : '0%'}
                  </td>
                  <td style={{ padding: '12px', color: d.status === 'vencida' ? '#f87171' : 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {d.nextDueDate}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                    {formatValue(d.nextDueAmount)}
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
                      d.status === 'em_prorrogacao' ? 'badge-amber' :
                      d.status === 'prorrogada' ? 'badge-amber' : 'badge-purple'
                    }`}>
                      {d.status === 'em_prorrogacao' ? 'Em Prorrogação' : d.status}
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
                    Beneficiário / Produtor Titular
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo, Vinicius, Ananias..."
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
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
                    Número da Cédula Rural (ex: CPR / CCB)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 251715692, 40.829-45X..."
                    value={cedulaNumber}
                    onChange={(e) => setCedulaNumber(e.target.value)}
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
                    Código Interno / Contrato
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

              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="checkbox"
                  id="mcrProrrogation"
                  checked={isUnderMcrProrrogation}
                  onChange={(e) => setIsUnderMcrProrrogation(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                />
                <label htmlFor="mcrProrrogation" style={{ fontSize: '0.78rem', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}>
                  Operação enquadrada no Manual de Crédito Rural (MCR 2.6.9 - Prorrogação de Custeio)
                </label>
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
