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
  const [activeTab, setActiveTab] = useState<'matrix' | 'records'>('matrix');
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
      dividas_renegociadas: 'Passivos e Dívidas Renegociadas'
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
      safra: '2024/2025',
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
          <h2 style={{ fontSize: '1.3rem' }}>Fluxo de Caixa Agropecuário Consolidado</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Metodologia Gran Bernardo de Gestão e Reestruturação • 12 Meses de Safra (Out/24 a Set/25)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Toggle View: Matriz Mensal vs Lançamentos */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '3px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('matrix')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'matrix' ? 'var(--agro-green-600)' : 'transparent',
                color: '#fff'
              }}
            >
              Matriz 12 Meses
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: activeTab === 'records' ? 'var(--agro-green-600)' : 'transparent',
                color: '#fff'
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
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>ENTRADAS OPERACIONAIS</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#10b981', marginTop: '4px' }}>
            R$ {(totalInflows / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vendas Soja & Milho</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>CUSTOS VARIÁVEIS PROD.</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#fbbf24', marginTop: '4px' }}>
            R$ {(totalOperatingOutflows / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Insumos, Folha, Frete, Diesel</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>SERVIÇO DA DÍVIDA (BANCOS)</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: '#f87171', marginTop: '4px' }}>
            R$ {(totalDebtService / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Custeio, Finame, Juros</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>FLUXO LÍQUIDO DA SAFRA</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: netCashFlowSafra >= 0 ? '#34d399' : '#f87171', marginTop: '4px' }}>
            R$ {(netCashFlowSafra / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saldo Operacional - Dívida</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>SALDO FINAL ACUMULADO</span>
          <div className="metric-number" style={{ fontSize: '1.35rem', color: endingCashBalance >= 0 ? '#ffffff' : '#f87171', marginTop: '4px' }}>
            R$ {(endingCashBalance / 1000).toFixed(0)} mil
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Posição em 30/Set/2025</span>
        </div>
      </div>

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
