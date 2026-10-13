// Visão Executiva (Dashboard Bento Grid Cockpit) - Gran Bernardo Agro (UI/UX Pro Max)
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sprout, 
  Landmark, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  Bot, 
  FileText,
  Sliders,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { 
  CropPlanningItem, 
  DebtLiability, 
  CashFlowMonthlySummary, 
  RiskAlert, 
  RestructuringAction 
} from '../types';
import { FinancialEngine } from '../services/financialEngine';

interface DashboardViewProps {
  crops: CropPlanningItem[];
  monthlySummaries: CashFlowMonthlySummary[];
  debts: DebtLiability[];
  risks: RiskAlert[];
  actions: RestructuringAction[];
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  crops,
  monthlySummaries,
  debts,
  risks,
  actions,
  onNavigate
}) => {
  // Cálculos consolidados
  const totalGrossRevenue = crops.reduce((acc, c) => acc + c.grossRevenue, 0);
  const totalOperatingCost = crops.reduce((acc, c) => acc + c.totalOperatingCost, 0);
  const grossMargin = totalGrossRevenue - totalOperatingCost;
  const marginPercent = totalGrossRevenue > 0 ? (grossMargin / totalGrossRevenue) * 100 : 0;

  const debtMetrics = FinancialEngine.calculateDebtMetrics(debts);
  const endingCash = monthlySummaries[monthlySummaries.length - 1]?.endingBalance || 0;
  const worstCashMonth = monthlySummaries.reduce(
    (worst, cur) => cur.endingBalance < worst.endingBalance ? cur : worst, 
    monthlySummaries[0] || { endingBalance: 0, monthLabel: '-' }
  );

  const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high');
  const soyCrop = crops.find(c => c.crop === 'Soja') || crops[0];
  const cornCrop = crops.find(c => c.crop.includes('Milho')) || crops[1];

  // Maior valor para normalização do gráfico SVG
  const maxMonthlyVal = Math.max(
    ...monthlySummaries.map(m => Math.max(m.inflows, m.outflowsOperating + m.debtService, Math.abs(m.endingBalance))),
    5000000
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner / Welcome Advisory Cockpit */}
      <div className="bento-card" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(22, 25, 34, 0.95) 0%, rgba(16, 19, 25, 0.98) 100%)',
        borderLeft: '4px solid #00f2fe',
        border: '1px solid rgba(0, 242, 254, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
              Safra Ativa 2024/2025
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#00f2fe', fontWeight: 600 }}>
              2.450 ha totais / 2.800 ha cultivados
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
            Painel Executivo de Gestão & Reestruturação
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
            Grupo Agropecuário Santa Maria • Consultor Técnico: <strong style={{ color: '#fff' }}>Dr. Roberto Bernardo</strong>
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('import_center')} className="btn btn-secondary">
            <FileSpreadsheet size={15} color="#00f2fe" />
            <span>Upload Planilha</span>
          </button>
          <button onClick={() => onNavigate('ai_advisor')} className="btn btn-outline" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 242, 254, 0.12) 100%)' }}>
            <Bot size={15} color="#00f2fe" />
            <span>Consultar IA</span>
          </button>
          <button onClick={() => onNavigate('scenarios')} className="btn btn-secondary">
            <Sliders size={15} color="#f97316" />
            <span>Simular Quebra</span>
          </button>
          <button onClick={() => onNavigate('reports')} className="btn btn-primary">
            <FileText size={15} />
            <span>Dossiê PDF</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: 5 Core Financial KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        
        {/* KPI 1: Receita Bruta */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)', fontWeight: 700, letterSpacing: '0.04em' }}>
              RECEITA BRUTA DA SAFRA
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} color="#00f2fe" />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '1.65rem', color: '#ffffff' }}>
            R$ {(totalGrossRevenue / 1000000).toFixed(2)}M
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '0.74rem', color: '#10b981' }}>
            <ArrowUpRight size={14} />
            <span>Soja + Milho (214.400 sacas)</span>
          </div>
        </div>

        {/* KPI 2: Custos de Produção */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)', fontWeight: 700, letterSpacing: '0.04em' }}>
              CUSTOS TOTAIS PROD.
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={16} color="#f97316" />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '1.65rem', color: '#ffffff' }}>
            R$ {(totalOperatingCost / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Insumos, Máquinas, Fretes e Folha
          </div>
        </div>

        {/* KPI 3: Margem Bruta */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)', fontWeight: 700, letterSpacing: '0.04em' }}>
              MARGEM BRUTA OPERACIONAL
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
              {marginPercent.toFixed(1)}%
            </span>
          </div>
          <div className="metric-number" style={{ fontSize: '1.65rem', color: '#10b981' }}>
            R$ {(grossMargin / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Faturamento Líquido - Custos Diretos
          </div>
        </div>

        {/* KPI 4: Saldo Final de Caixa */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)', fontWeight: 700, letterSpacing: '0.04em' }}>
              SALDO CAIXA FINAL (SET/25)
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: endingCash >= 0 ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {endingCash >= 0 ? <TrendingUp size={16} color="#34d399" /> : <TrendingDown size={16} color="#f87171" />}
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '1.65rem', color: endingCash >= 0 ? '#ffffff' : '#f87171' }}>
            R$ {(endingCash / 1000).toFixed(0)} mil
          </div>
          <div style={{ fontSize: '0.74rem', color: worstCashMonth.endingBalance < 0 ? '#f87171' : 'var(--color-text-muted)', marginTop: '6px' }}>
            {worstCashMonth.endingBalance < 0 ? `Atenção: Gargalo em ${worstCashMonth.monthLabel}` : 'Fluxo positivo acumulado'}
          </div>
        </div>

        {/* KPI 5: Passivo Bancário */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)', fontWeight: 700, letterSpacing: '0.04em' }}>
              PASSIVO TOTAL BANCÁRIO
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Landmark size={16} color="#f87171" />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '1.65rem', color: '#f87171' }}>
            R$ {(debtMetrics.totalBalance / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {debtMetrics.shortTermPercent.toFixed(0)}% vence nos próximos 12 meses
          </div>
        </div>

      </div>

      {/* Main Section: Interactive Cash Flow Evolution Chart & Agronomic Break-even */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* SVG Responsive Cash Flow Evolution Chart */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Evolução Mensal do Fluxo de Caixa</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                Metodologia Gran Bernardo: Entradas Operacionais vs Desembolsos Totais
              </p>
            </div>
            <button onClick={() => onNavigate('cashflow')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
              Ver Matriz Completa
            </button>
          </div>

          {/* SVG Container with Horizontal Scroll fallback on small mobile screens */}
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '520px', height: '220px', position: 'relative' }}>
              <svg 
                viewBox="0 0 600 200" 
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                {/* Horizontal Baseline */}
                <line x1="40" y1="160" x2="580" y2="160" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

                {/* Grid Guidelines */}
                <line x1="40" y1="110" x2="580" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="40" y1="60" x2="580" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {/* Monthly Bars */}
                {monthlySummaries.map((m, idx) => {
                  const x = 50 + idx * 45;
                  const inflowHeight = (m.inflows / maxMonthlyVal) * 120;
                  const outflowHeight = ((m.outflowsOperating + m.debtService) / maxMonthlyVal) * 120;

                  return (
                    <g key={m.month}>
                      {/* Inflow Bar (Verde Positivo) */}
                      <rect
                        x={x}
                        y={160 - inflowHeight}
                        width="16"
                        height={Math.max(inflowHeight, 2)}
                        fill="#10b981"
                        rx="3"
                        opacity="0.9"
                      />
                      {/* Outflow Bar (Laranja Alerta) */}
                      <rect
                        x={x + 18}
                        y={160 - outflowHeight}
                        width="16"
                        height={Math.max(outflowHeight, 2)}
                        fill="#f97316"
                        rx="3"
                        opacity="0.9"
                      />
                      {/* Month Text */}
                      <text
                        x={x + 16}
                        y="180"
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="IBM Plex Sans, Inter"
                      >
                        {m.monthLabel.split('/')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Cash Balance Line Path (Azul Elétrico nos Gráficos) */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  points={monthlySummaries.map((m, idx) => {
                    const x = 50 + idx * 45 + 16;
                    const y = Math.max(20, Math.min(160, 140 - (m.endingBalance / maxMonthlyVal) * 100));
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Cash Balance Dots (Ciano Neon / Vermelho Erro) */}
                {monthlySummaries.map((m, idx) => {
                  const x = 50 + idx * 45 + 16;
                  const y = Math.max(20, Math.min(160, 140 - (m.endingBalance / maxMonthlyVal) * 100));
                  return (
                    <circle
                      key={`dot-${m.month}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={m.endingBalance >= 0 ? '#00f2fe' : '#ef4444'}
                      stroke="#0b0d11"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '12px', fontSize: '0.74rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>Entradas (Resultados Positivos)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f97316' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>Desembolsos (Alertas de Saída)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '3px', background: '#2563eb', borderRadius: '2px' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>Saldo Acumulado (Azul Elétrico)</span>
            </div>
          </div>
        </div>

        {/* Agronomic Break-Even & Safety Margin Cards */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={18} color="#34d399" />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Diagnóstico Agronômico & Break-Even</h3>
              </div>
              <button onClick={() => onNavigate('crops')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
                Gerenciar Safras
              </button>
            </div>

            {/* Soja 1ª Safra Card */}
            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--color-border)',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>Soja 1ª Safra ({soyCrop.plantedAreaHa} ha)</strong>
                <span className="badge badge-green">{soyCrop.expectedYieldScHa} sc/ha</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.76rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Custo Direto</span>
                  <strong style={{ color: '#fff' }}>R$ {soyCrop.operatingCostPerHa.toLocaleString('pt-BR')}/ha</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Break-Even</span>
                  <strong style={{ color: '#fbbf24' }}>{soyCrop.breakEvenScHa.toFixed(1)} sc/ha</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Margem Operacional</span>
                  <strong style={{ color: '#34d399' }}>R$ {(soyCrop.grossMargin / 1000000).toFixed(2)}M ({soyCrop.marginPercent.toFixed(0)}%)</strong>
                </div>
              </div>
            </div>

            {/* Milho 2ª Safra Card */}
            {cornCrop && (
              <div style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#ffffff', fontSize: '0.88rem' }}>Milho 2ª Safra ({cornCrop.plantedAreaHa} ha)</strong>
                  <span className="badge badge-amber">{cornCrop.expectedYieldScHa} sc/ha</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.76rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Custo Direto</span>
                    <strong style={{ color: '#fff' }}>R$ {cornCrop.operatingCostPerHa.toLocaleString('pt-BR')}/ha</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Break-Even</span>
                    <strong style={{ color: '#fbbf24' }}>{cornCrop.breakEvenScHa.toFixed(1)} sc/ha</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Margem Operacional</span>
                    <strong style={{ color: '#34d399' }}>R$ {(cornCrop.grossMargin / 1000000).toFixed(2)}M ({cornCrop.marginPercent.toFixed(0)}%)</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technical Note Callout */}
          <div style={{
            marginTop: '14px',
            background: 'rgba(0, 242, 254, 0.06)',
            borderLeft: '3px solid #00f2fe',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.76rem',
            color: 'var(--color-text-muted)'
          }}>
            <strong style={{ color: '#00f2fe' }}>Margem de Segurança:</strong> A soja está 26,8 sc/ha acima do custo. O milho requer trava de preço mínima a R$ 56/sc para garantir retorno líquido satisfatório.
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: Active Restructuring Actions & Critical Risk Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Urgent Restructuring Actions */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Plano de Reestruturação Gran Bernardo</span>
              <span className="badge badge-amber">{actions.filter(a => a.status !== 'concluido').length} Pendentes</span>
            </h3>
            <button onClick={() => onNavigate('restructuring')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
              Ver Kanban
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actions.slice(0, 3).map(action => (
              <div key={action.id} style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'border-color 0.15s ease'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge ${action.priority === 'urgente' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.62rem' }}>
                      {action.priority}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>Prazo: {action.deadline}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.35 }}>
                    {action.action}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Resp: {action.responsible.split('(')[0]}
                  </span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-subtle)', display: 'block' }}>Impacto</span>
                  <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>
                    +R$ {(action.estimatedImpactR$ / 1000).toFixed(0)}k
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Risks Matrix */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={17} color="#ef4444" />
              <span>Matriz de Riscos & Gargalos</span>
              <span className="badge badge-red">{criticalRisks.length} Prioritários</span>
            </h3>
            <button onClick={() => onNavigate('risks')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
              Ver Matriz
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalRisks.slice(0, 3).map(risk => (
              <div key={risk.id} style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                borderLeft: '3px solid #ef4444',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>{risk.title}</strong>
                  <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>{risk.severity}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  {risk.problem}
                </p>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.08)', padding: '5px 8px', borderRadius: '4px' }}>
                  <strong>Recomendação Gran Bernardo:</strong> {risk.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
