// Fluxo de Caixa Agropecuário - Metodologia Gran Bernardo
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  CashFlowCategory, 
  CashFlowEntry, 
  CashFlowMonthlySummary, 
  EntryStatus, 
  EntryType 
} from '../types';
import { ExcelImporterService } from '../services/excelImporter';

interface CashFlowViewProps {
  entries: CashFlowEntry[];
  monthlySummaries: CashFlowMonthlySummary[];
  onAddEntry: (entry: CashFlowEntry) => void;
  onUpdateEntry: (entry: CashFlowEntry) => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  entries,
  monthlySummaries,
  onAddEntry,
  onUpdateEntry
}) => {
  const [activeTab, setActiveTab] = useState<'summary_planilha' | 'matrix' | 'records'>('summary_planilha');
  const [viewUnit, setViewUnit] = useState<'currency' | 'sacks'>('currency');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Formulário do novo lançamento
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<EntryType>('outflow');
  const [newCategory, setNewCategory] = useState<CashFlowCategory>('fertilizantes_adubos');
  const [newSupplier, setNewSupplier] = useState('');
  const [newStatus, setNewStatus] = useState<EntryStatus>('previsto');

  // Cálculos consolidados da safra
  const totalInflows = monthlySummaries.reduce((a, b) => a + b.inflows, 0);
  const totalOperatingOutflows = monthlySummaries.reduce((a, b) => a + b.outflowsOperating, 0);
  const totalFixedCosts = monthlySummaries.reduce((a, b) => a + b.fixedCosts, 0);
  const totalDebtService = monthlySummaries.reduce((a, b) => a + b.debtService, 0);
  const totalOutflows = totalOperatingOutflows + totalFixedCosts + totalDebtService;
  const netCashFlowSafra = totalInflows - totalOutflows;
  const endingCashBalance = monthlySummaries[monthlySummaries.length - 1]?.endingBalance || 0;

  const formatVal = (amount: number) => {
    if (viewUnit === 'sacks') {
      const sacks = Math.round(amount / 110);
      return `${sacks.toLocaleString('pt-BR')} sc`;
    }
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Filtro de lançamentos da tabela
  const filteredEntries = entries.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.supplierOrClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount.replace(/\./g, '').replace(',', '.')) || 0;
    if (amountVal <= 0 || !newDesc.trim()) return;

    const categoryLabels: Record<CashFlowCategory, string> = {
      receita_soja: 'Receita da Venda de Soja',
      receita_milho: 'Receita da Venda de Milho',
      receita_outras_culturas: 'Receita de Outras Culturas / Pecuária',
      recebiveis_cpr: 'Recebíveis Futuros (CPR / Contratos)',
      outras_entradas: 'Outras Entradas Operacionais',
      sementes: 'Sementes e Mudas',
      fertilizantes_adubos: 'Fertilizantes e Adubos',
      defensivos_quimicos: 'Defensivos Químicos e Biológicos',
      combustiveis_lubrificantes: 'Combustíveis e Lubrificantes',
      mao_de_obra_folha: 'Mão de Obra e Encargos',
      manutencao_maquinas: 'Manutenção de Máquinas e Implementos',
      fretes_armazenagem: 'Fretes e Logística Rural',
      servicos_terceiros: 'Serviços de Terceiros e Operações',
      arrendamento_terras: 'Arrendamentos de Terras',
      pro_labore_socios: 'Pró-labore e Retiradas de Sócios',
      energia_eletrica: 'Energia Elétrica e Pivôs',
      impostos_funrural_itr: 'Impostos e Encargos (Funrural/ITR)',
      seguros_patrimoniais: 'Seguros Rurais e Patrimoniais',
      financiamento_custeio: 'Financiamento de Custeio Agrícola',
      financiamento_investimento: 'Financiamento de Investimento / Máquinas',
      juros_encargos_bancarios: 'Juros e Encargos Bancários',
      liquidacao_cpr_barter: 'Liquidação de Barter / CPR',
      dividas_renegociadas: 'Passivos e Dívidas Renegociadas',
      silo_armazenagem: 'Silos e Armazenagem (Klepper)',
      emprestimo_terceiros: 'Empréstimos de Terceiros / Mútuo',
      cessao_credito_bunge: 'Cessão de Crédito / Barter Bunge'
    };

    const newEntry: CashFlowEntry = {
      id: `manual-${Date.now()}`,
      date: newDate,
      month: newDate.slice(0, 7),
      description: newDesc,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Outros',
      type: newType,
      expectedAmount: amountVal,
      realizedAmount: newStatus === 'realizado' ? amountVal : undefined,
      status: newStatus,
      safra: '2025/2026',
      farmId: 'farm-01',
      supplierOrClient: newSupplier.trim() || 'Fornecedor Agro',
      confidence: 100,
      source: 'manual'
    };

    onAddEntry(newEntry);
    setIsAddModalOpen(false);
    setNewDesc('');
    setNewAmount('');
    setNewSupplier('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header & Actions */}
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
            <h2 style={{ fontSize: '1.3rem' }}>Fluxo de Caixa Agropecuário Consolidado</h2>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              Safra 25/26 Gran Bernardo
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
            Demonstrativo de Safra • Visão Analítica (16 Meses) • Auditoria de Passivos & Break-Even
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
                background: viewUnit === 'sacks' ? '#fbbf24' : 'transparent',
                color: viewUnit === 'sacks' ? '#000' : 'var(--text-muted)',
                fontWeight: viewUnit === 'sacks' ? 700 : 500
              }}
            >
              Exibir em Sacas (sc)
            </button>
          </div>

          {/* Toggle View: Resumo Planilha vs Matriz Mensal vs Lançamentos */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '3px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('summary_planilha')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'summary_planilha' ? 'var(--cyan-glow)' : 'transparent',
                color: activeTab === 'summary_planilha' ? '#000' : '#fff',
                fontWeight: activeTab === 'summary_planilha' ? 700 : 500
              }}
            >
              Resumo Planilha Real
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'matrix' ? 'var(--cyan-glow)' : 'transparent',
                color: activeTab === 'matrix' ? '#000' : '#fff',
                fontWeight: activeTab === 'matrix' ? 700 : 500
              }}
            >
              Matriz 16 Meses
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'records' ? 'var(--cyan-glow)' : 'transparent',
                color: activeTab === 'records' ? '#000' : '#fff',
                fontWeight: activeTab === 'records' ? 700 : 500
              }}
            >
              Lançamentos ({entries.length})
            </button>
          </div>

          <button onClick={() => ExcelImporterService.exportCurrentCashFlowToExcel(entries)} className="btn btn-secondary">
            <Download size={15} />
            <span>Exportar XLSX</span>
          </button>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>RECEITA LÍQUIDA SAFRA 25/26</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#10b981', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '80.702 sc' : 'R$ 7,25M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Soja 740ha + Milho 340ha</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>CUSTOS & DESPESAS OPERACIONAIS</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#fbbf24', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '41.041 sc' : 'R$ 4,51M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fixas, Variáveis & Arrendamentos</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>BANCOS & FORNECEDORES CURTO PRAZO</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#f87171', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '72.391 sc' : 'R$ 7,96M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bancos &lt; 360d + Fornecedores</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>PREJUÍZO SAFRA (CENÁRIO BASE)</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#f87171', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '-46.802 sc' : '-R$ 5,15M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#f87171' }}>Déficit sem reestruturação</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>DÉFICIT ANALÍTICO ACUMULADO</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#f87171', marginTop: '4px' }}>
            {viewUnit === 'sacks' ? '-86.728 sc' : '-R$ 9,54M'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Posição final em 16 meses</span>
        </div>
      </div>

      {/* VIEW MODE 0: RESUMO EXECUTIVO DA PLANILHA REAL (Tab FLUXO RESUMO Gran Bernardo) */}
      {activeTab === 'summary_planilha' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card de Alerta e Diagnóstico */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 700, letterSpacing: '0.5px' }}>
                DIAGNÓSTICO OFICIAL — GRAN BERNARDO AGRO
              </span>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px', maxWidth: '850px' }}>
                A operação da Safra 2025/2026 apresenta <strong>prejuízo de -R$ 5.148.185,45 (-46.802 sc)</strong> e 
                déficit acumulado de <strong>-R$ 9.540.034,65</strong> no fluxo analítico de 16 meses. 
                A concentração de R$ 5,96M em bancos de curto prazo e R$ 2,00M de fornecedores exige aplicação imediata do MCR 2.6.9 e transição para o plano de Recuperação Judicial Especial (que reverte o resultado para <strong>+R$ 691.274,53</strong>).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                padding: '8px 12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.68rem', color: '#34d399', display: 'block', fontWeight: 600 }}>Com RJ Judicial</span>
                <strong style={{ fontSize: '1.05rem', color: '#10b981' }}>+R$ 691k</strong>
              </div>
            </div>
          </div>

          {/* Tabela do Fluxo Resumo */}
          <div className="glass-panel" style={{ padding: '22px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Demonstrativo Orçamentário e Financeiro — Safra 25/26</h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Valores extraídos diretamente da planilha operacional Gran Bernardo Agro (Base Soja: R$ 110,00/sc | Milho: R$ 55,00/sc)
                </span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', color: '#fff' }}>Linha Orçamentária / Grupo de Contas</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', color: '#fff' }}>Área / Qtd</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#fff' }}>Produtividade / Cotação</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#fbbf24' }}>Volume em Sacas (sc)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#34d399' }}>Valor Financeiro (R$)</th>
                </tr>
              </thead>
              <tbody>

                {/* GRUPO 1: RECEITAS */}
                <tr style={{ background: 'rgba(16, 185, 129, 0.08)', fontWeight: 700 }}>
                  <td colSpan={5} style={{ padding: '10px 14px', color: '#34d399', fontSize: '0.85rem' }}>
                    1. RECEITAS DA SAFRA 2025/2026
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Soja 1ª Safra</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>740 ha</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>70 sc/ha a R$ 110/sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff', fontWeight: 600 }}>51.800 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>R$ 5.698.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Milho 2ª Safra (Safrinha)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>340 ha</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>95 sc/ha a R$ 55/sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff', fontWeight: 600 }}>32.300 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>R$ 1.776.500,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Venda de Máquinas e Ativos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Desimobilização</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>1.364 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399' }}>R$ 150.000,00</td>
                </tr>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 600 }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>(+) Total Receitas Brutas</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#fff' }}>1.080 ha</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>84.100 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>R$ 7.624.500,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#f87171' }}>(-) Custo de Armazenagem Soja</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Armazém Terceiros</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171' }}>-3.398 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171' }}>-R$ 373.725,00</td>
                </tr>
                <tr style={{ background: 'rgba(16, 185, 129, 0.15)', fontWeight: 800 }}>
                  <td style={{ padding: '12px 14px', color: '#34d399' }}>(=) TOTAL RECEITA LÍQUIDA SAFRA 25/26</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#fff' }}>1.080 ha</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Líquido Silo</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#fbbf24', fontSize: '0.92rem' }}>80.702 sc</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#34d399', fontSize: '0.92rem' }}>R$ 7.250.775,00</td>
                </tr>

                {/* GRUPO 2: DESPESAS OPERACIONAIS & ARRENDAMENTO */}
                <tr style={{ background: 'rgba(245, 158, 11, 0.08)', fontWeight: 700 }}>
                  <td colSpan={5} style={{ padding: '10px 14px', color: '#fbbf24', fontSize: '0.85rem', marginTop: '10px' }}>
                    2. DESPESAS OPERACIONAIS & ARRENDAMENTOS
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Despesas Fixas da Operação</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Folha / Admin</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>14.455 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 1.590.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Despesas Variáveis de Campo</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Diesel / Tratos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>7.827 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 861.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Arrendamento Marcorelio Novais</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Terras</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>3.680 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 404.800,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Empréstimo Pessoal</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Mútuo</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Taxa 1,5% a.m.</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>3.261 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 358.685,45</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Construtor Silo</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Obras</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Montagem</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>2.727 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 300.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Insumos Milho Safra 26</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Adubo / Sem</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>9.091 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 1.000.000,00</td>
                </tr>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
                  <td style={{ padding: '10px 14px', color: '#fbbf24' }}>Subtotal Despesas Operacionais</td>
                  <td colSpan={2} style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>41.041 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24' }}>R$ 4.514.485,45</td>
                </tr>

                {/* GRUPO 3: FORNECEDORES E PASSIVOS BANCÁRIOS */}
                <tr style={{ background: 'rgba(239, 68, 68, 0.08)', fontWeight: 700 }}>
                  <td colSpan={5} style={{ padding: '10px 14px', color: '#f87171', fontSize: '0.85rem' }}>
                    3. PASSIVOS BANCÁRIOS & FORNECEDORES (VENCIDOS E A VENCER)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#f87171' }}>Fornecedores Vencidos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Em atraso</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Insumos/Químicos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171' }}>7.164 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>R$ 788.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Fornecedores A Vencer</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Safra 25/26</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Insumos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>11.027 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 1.213.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fbbf24' }}>Passivo Bancário &lt; 360 dias (Curto Prazo)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Bancos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>BB Custeios</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>54.200 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>R$ 5.962.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>Passivo Bancário &gt; 360 dias (Longo Prazo)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Bancos</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>Investimentos BB</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>93.382 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#fff' }}>R$ 10.272.000,00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', color: '#38bdf8' }}>Silo Klepper (Estrutura de Armazenagem)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Klepper</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>5 Safras</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#38bdf8' }}>10.946 sc</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#38bdf8' }}>R$ 1.204.023,90</td>
                </tr>

                {/* GRUPO 4: RESULTADO CONSOLIDADO */}
                <tr style={{ background: 'rgba(239, 68, 68, 0.15)', fontWeight: 800 }}>
                  <td style={{ padding: '12px 14px', color: '#f87171', fontSize: '0.9rem' }}>
                    (=) PREJUÍZO OPERACIONAL SAFRA 25/26 (CENÁRIO BASE)
                  </td>
                  <td colSpan={2} style={{ padding: '12px 14px', textAlign: 'right', color: '#f87171' }}>
                    Déficit da Safra
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#f87171', fontSize: '0.92rem' }}>
                    -46.802 sc
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#f87171', fontSize: '0.92rem' }}>
                    -R$ 5.148.185,45
                  </td>
                </tr>
                <tr style={{ background: 'rgba(0, 0, 0, 0.4)', fontWeight: 800 }}>
                  <td style={{ padding: '12px 14px', color: '#ef4444', fontSize: '0.9rem' }}>
                    DÉFICIT ACUMULADO NO FLUXO ANALÍTICO (16 MESES)
                  </td>
                  <td colSpan={2} style={{ padding: '12px 14px', textAlign: 'right', color: '#ef4444' }}>
                    Posição Caixa Final
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#ef4444', fontSize: '0.92rem' }}>
                    -86.728 sc
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#ef4444', fontSize: '0.92rem' }}>
                    -R$ 9.540.034,65
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comparativo de Estratégias Gran Bernardo */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
              Impacto Comparativo dos Cenários de Reestruturação Gran Bernardo Agro
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Cenário 1: Base */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700 }}>1. CENÁRIO BASE (ATUAL)</span>
                  <span className="badge badge-red">Inviável</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: '8px' }}>
                  -R$ 5.148.185,45
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Déficit Acumulado: -R$ 9.540.034,65
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Pagamento integral de R$ 5,96M de bancos no curto prazo e fornecedores vencidos consome toda a receita da soja e do milho.
                </p>
              </div>

              {/* Cenário 2: RJ Extra */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>2. REESTRUTURAÇÃO EXTRA (TAB RJ-EXTRA)</span>
                  <span className="badge badge-amber">Parcial</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '8px' }}>
                  -R$ 2.470.573,62
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Déficit 3 Safras: -R$ 8.877.976,09
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Alongamento do BB em 10 parcelas de R$ 3,06M/ano e Silo em 5 parcelas de R$ 392k. Reduz o déficit mas ainda mantém caixa pressionado.
                </p>
              </div>

              {/* Cenário 3: RJ Judicial */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid #10b981',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>3. RJ ESPECIAL (TAB RJ-JUDICIAL)</span>
                  <span className="badge badge-green">Recomendado</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
                  +R$ 691.274,53
                </div>
                <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'block', marginTop: '2px' }}>
                  Superávit 3 Safras: +R$ 1.492.544,57
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Blindagem judicial, pagamento a fornecedores locais (R$ 1,01M), Admin Judicial 2,5% em 36x (R$ 208k/ano) e captação de insumos.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW MODE 1: MATRIZ 12 MESES (Gran Bernardo Format) */}
      {activeTab === 'matrix' && (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Demonstrativo Financeiro Mensal (Metodologia Gran Bernardo)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valores em R$ (Reais)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '2px solid rgba(16, 185, 129, 0.4)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#fff' }}>Linha Orçamentária / Mês</th>
                {monthlySummaries.map(m => (
                  <th key={m.month} style={{ padding: '10px 6px', textAlign: 'right', color: '#fff', fontSize: '0.75rem' }}>
                    {m.monthLabel}
                  </th>
                ))}
                <th style={{ padding: '10px 10px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>Total Safra</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. ENTRADAS */}
              <tr style={{ background: 'rgba(16, 185, 129, 0.08)', fontWeight: 600 }}>
                <td style={{ padding: '10px 12px', color: '#34d399' }}>(+) ENTRADAS OPERACIONAIS (VENDAS)</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '10px 6px', textAlign: 'right', color: m.inflows > 0 ? '#34d399' : 'var(--text-subtle)' }}>
                    {m.inflows > 0 ? (m.inflows / 1000).toFixed(0) + 'k' : '-'}
                  </td>
                ))}
                <td style={{ padding: '10px 10px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                  R$ {(totalInflows / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* 2. CUSTOS OPERACIONAIS */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>(-) Custos Operacionais Variáveis</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '8px 6px', textAlign: 'right', color: m.outflowsOperating > 0 ? '#fbbf24' : 'var(--text-subtle)' }}>
                    {m.outflowsOperating > 0 ? (m.outflowsOperating / 1000).toFixed(0) + 'k' : '-'}
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#fbbf24' }}>
                  R$ {(totalOperatingOutflows / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* RESULTADO OPERACIONAL */}
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 600 }}>
                <td style={{ padding: '8px 12px', color: '#fff' }}>(=) RESULTADO OPERACIONAL BRUTO</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '8px 6px', textAlign: 'right', color: m.operatingResult >= 0 ? '#34d399' : '#f87171' }}>
                    {(m.operatingResult / 1000).toFixed(0)}k
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>
                  R$ {((totalInflows - totalOperatingOutflows) / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* 3. DESPESAS FIXAS */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>(-) Custos Fixos & Arrendamentos</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '8px 6px', textAlign: 'right', color: m.fixedCosts > 0 ? '#9ca3af' : 'var(--text-subtle)' }}>
                    {m.fixedCosts > 0 ? (m.fixedCosts / 1000).toFixed(0) + 'k' : '-'}
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  R$ {(totalFixedCosts / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* 4. SERVIÇO DA DÍVIDA */}
              <tr style={{ background: 'rgba(239, 68, 68, 0.06)', borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', color: '#f87171', fontWeight: 600 }}>(-) SERVIÇO DA DÍVIDA (BANCOS & CPRs)</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '8px 6px', textAlign: 'right', color: m.debtService > 0 ? '#f87171' : 'var(--text-subtle)', fontWeight: m.debtService > 0 ? 600 : 400 }}>
                    {m.debtService > 0 ? (m.debtService / 1000).toFixed(0) + 'k' : '-'}
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f87171', fontWeight: 700 }}>
                  R$ {(totalDebtService / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* FLUXO LÍQUIDO */}
              <tr style={{ background: 'rgba(255, 255, 255, 0.06)', fontWeight: 700, borderTop: '2px solid rgba(255, 255, 255, 0.2)' }}>
                <td style={{ padding: '10px 12px', color: '#ffffff' }}>(=) FLUXO LÍQUIDO DO MÊS</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '10px 6px', textAlign: 'right', color: m.netCashFlow >= 0 ? '#34d399' : '#f87171' }}>
                    {(m.netCashFlow / 1000).toFixed(0)}k
                  </td>
                ))}
                <td style={{ padding: '10px 10px', textAlign: 'right', color: netCashFlowSafra >= 0 ? '#34d399' : '#f87171' }}>
                  R$ {(netCashFlowSafra / 1000000).toFixed(2)}M
                </td>
              </tr>

              {/* SALDO FINAL ACUMULADO */}
              <tr style={{ background: 'var(--bg-surface-2)', fontWeight: 800, borderBottom: '2px solid rgba(52, 211, 153, 0.3)' }}>
                <td style={{ padding: '11px 12px', color: '#38bdf8' }}>SALDO FINAL ACUMULADO</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '11px 6px', textAlign: 'right', color: m.endingBalance >= 0 ? '#38bdf8' : '#ef4444' }}>
                    {(m.endingBalance / 1000).toFixed(0)}k
                  </td>
                ))}
                <td style={{ padding: '11px 10px', textAlign: 'right', color: '#38bdf8' }}>
                  R$ {(endingCashBalance / 1000).toFixed(0)}k
                </td>
              </tr>

              {/* NECESSIDADE DE CAPITAL DE GIRO */}
              <tr style={{ background: 'rgba(239, 68, 68, 0.04)' }}>
                <td style={{ padding: '8px 12px', color: '#f87171', fontSize: '0.74rem' }}>Necessidade de Empréstimo / Giro</td>
                {monthlySummaries.map(m => (
                  <td key={m.month} style={{ padding: '8px 6px', textAlign: 'right', color: m.loanNeed > 0 ? '#f87171' : 'var(--text-subtle)', fontSize: '0.74rem' }}>
                    {m.loanNeed > 0 ? (m.loanNeed / 1000).toFixed(0) + 'k' : '-'}
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f87171', fontSize: '0.74rem' }}>
                  -
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: TABELA DE LANÇAMENTOS INDIVIDUAIS */}
      {activeTab === 'records' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface-2)',
              borderRadius: '8px',
              padding: '6px 12px',
              flex: 1,
              minWidth: '220px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Search size={15} color="var(--text-subtle)" />
              <input
                type="text"
                placeholder="Buscar por descrição, fornecedor ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">Todos os Tipos</option>
              <option value="inflow">Apenas Entradas</option>
              <option value="outflow">Apenas Saídas</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="realizado">Realizado</option>
              <option value="previsto">Previsto</option>
              <option value="vencido">Vencido</option>
              <option value="renegociado">Renegociado</option>
            </select>
          </div>

          {/* Records Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Data</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Descrição / Histórico</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Categoria</th>
                  <th style={{ padding: '10px 12px', color: '#fff' }}>Favorecido / Fornecedor</th>
                  <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Valor Previsto</th>
                  <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right' }}>Valor Realizado</th>
                  <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center' }}>Origem</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {entry.date}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#ffffff', fontWeight: 500 }}>
                      {entry.description}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.75rem', color: entry.type === 'inflow' ? '#34d399' : 'var(--text-muted)' }}>
                        {entry.categoryLabel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                      {entry.supplierOrClient}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: entry.type === 'inflow' ? '#34d399' : '#f87171' }}>
                      {entry.type === 'inflow' ? '+' : '-'} R$ {entry.expectedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {entry.realizedAmount !== undefined ? `R$ ${entry.realizedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span className={`badge ${
                        entry.status === 'realizado' ? 'badge-green' :
                        entry.status === 'previsto' ? 'badge-cyan' :
                        entry.status === 'vencido' ? 'badge-red' : 'badge-amber'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {entry.source === 'import_excel' ? 'Excel' : entry.source === 'ai_assistant' ? 'IA Chat' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO MANUAL */}
      {isAddModalOpen && (
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Adicionar Lançamento no Fluxo de Caixa</h3>

            <form onSubmit={handleCreateEntry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Descrição / Histórico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compra de Fertilizante NPK ou Venda de Soja"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Tipo de Movimentação
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EntryType)}
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
                    <option value="outflow">Saída / Desembolso</option>
                    <option value="inflow">Entrada / Receita</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
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
                    Data do Movimento
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
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
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as EntryStatus)}
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
                    <option value="previsto">Previsto</option>
                    <option value="realizado">Realizado</option>
                    <option value="vencido">Vencido</option>
                    <option value="renegociado">Renegociado</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Categoria Gran Bernardo
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CashFlowCategory)}
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
                  <optgroup label="Entradas">
                    <option value="receita_soja">Receita da Venda de Soja</option>
                    <option value="receita_milho">Receita da Venda de Milho</option>
                    <option value="recebiveis_cpr">Recebíveis Futuros (CPR)</option>
                    <option value="outras_entradas">Outras Entradas</option>
                  </optgroup>
                  <optgroup label="Custos Operacionais Variáveis">
                    <option value="fertilizantes_adubos">Fertilizantes e Adubos</option>
                    <option value="sementes">Sementes e Mudas</option>
                    <option value="defensivos_quimicos">Defensivos Químicos</option>
                    <option value="combustiveis_lubrificantes">Combustíveis e Diesel</option>
                    <option value="mao_de_obra_folha">Mão de Obra e Encargos</option>
                    <option value="manutencao_maquinas">Manutenção de Máquinas</option>
                    <option value="fretes_armazenagem">Fretes e Logística</option>
                  </optgroup>
                  <optgroup label="Serviço da Dívida & Financiamentos">
                    <option value="financiamento_custeio">Custeio Agrícola Bancário</option>
                    <option value="financiamento_investimento">Finame / Máquinas</option>
                    <option value="liquidacao_cpr_barter">Liquidação CPR / Barter</option>
                    <option value="juros_encargos_bancarios">Juros e Tarifas</option>
                  </optgroup>
                  <optgroup label="Custos Fixos">
                    <option value="arrendamento_terras">Arrendamentos de Terras</option>
                    <option value="pro_labore_socios">Pró-labore dos Sócios</option>
                    <option value="impostos_funrural_itr">Funrural / Impostos</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Fornecedor / Favorecido / Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Yara, Banco do Brasil, Bunge..."
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
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
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
