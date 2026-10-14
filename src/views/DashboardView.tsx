// Visão Executiva (Dashboard Bento Grid Cockpit) - Gran Bernardo Agro (Clean Executive)
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sprout, 
  Landmark, 
  ShieldAlert, 
  ArrowUpRight, 
  FileText,
  Sliders,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  CropPlanningItem, 
  DebtLiability, 
  CashFlowMonthlySummary, 
  RiskAlert, 
  RestructuringAction,
  FarmProperty
} from '../types';
import { FinancialEngine } from '../services/financialEngine';
import { ProjectionChart } from '../components/ProjectionChart';

interface DashboardViewProps {
  crops: CropPlanningItem[];
  monthlySummaries: CashFlowMonthlySummary[];
  debts: DebtLiability[];
  risks: RiskAlert[];
  actions: RestructuringAction[];
  onNavigate: (tab: any) => void;
  farms?: FarmProperty[];
  selectedFarmId?: string;
  onFarmChange?: (farmId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  crops,
  monthlySummaries,
  debts,
  risks,
  actions,
  onNavigate,
  farms = [],
  selectedFarmId = 'all',
  onFarmChange
}) => {
  const [chartMode, setChartMode] = useState<'projection' | 'monthly'>('projection');

  // Multi-Farm Scope Calculations
  const isConsolidated = !selectedFarmId || selectedFarmId === 'all';
  const currentFarm = farms.find(f => f.id === selectedFarmId);
  const totalAreaAllFarms = farms.reduce((acc, f) => acc + f.totalAreaHa, 0);
  const totalArableAllFarms = farms.reduce((acc, f) => acc + f.arableAreaHa, 0);

  // Proportional weight when filtering by a specific farm
  const farmArableRatio = isConsolidated 
    ? 1 
    : ((currentFarm?.arableAreaHa || 2100) / totalArableAllFarms);

  // Cálculos consolidados ou filtrados da safra
  const baseGrossRevenue = crops.reduce((acc, c) => acc + c.grossRevenue, 0);
  const baseOperatingCost = crops.reduce((acc, c) => acc + c.totalOperatingCost, 0);
  
  const totalGrossRevenue = baseGrossRevenue * farmArableRatio;
  const totalOperatingCost = baseOperatingCost * farmArableRatio;
  const grossMargin = totalGrossRevenue - totalOperatingCost;
  const marginPercent = totalGrossRevenue > 0 ? (grossMargin / totalGrossRevenue) * 100 : 0;

  const baseDebtMetrics = FinancialEngine.calculateDebtMetrics(debts);
  const debtBalance = baseDebtMetrics.totalBalance * farmArableRatio;

  const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high');
  const pendingActions = actions.filter(a => a.status !== 'concluido');
  const soyCrop = crops.find(c => c.crop === 'Soja') || crops[0];
  const cornCrop = crops.find(c => c.crop.includes('Milho')) || crops[1];

  // Normalização para o gráfico mensal
  const maxMonthlyVal = Math.max(
    ...monthlySummaries.map(m => Math.max(m.inflows, m.outflowsOperating + m.debtService, Math.abs(m.endingBalance))),
    5000000
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Clean Executive Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
              Visão Executiva & Diagnóstico Rural
            </h1>
            {isConsolidated ? (
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Consolidado ({farms.length} Fazendas)
              </span>
            ) : (
              <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Fazenda: {currentFarm?.name}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
            {isConsolidated ? (
              <>Grupo Agropecuário Santa Maria • <strong>{totalAreaAllFarms.toLocaleString('pt-BR')} ha totais</strong> ({totalArableAllFarms.toLocaleString('pt-BR')} ha aráveis) • Consultor: <span style={{ color: '#f8fafc', fontWeight: 600 }}>Dr. Roberto Bernardo</span></>
            ) : (
              <>{currentFarm?.name} • <strong>{currentFarm?.totalAreaHa.toLocaleString('pt-BR')} ha totais</strong> ({currentFarm?.arableAreaHa.toLocaleString('pt-BR')} ha aráveis) • {currentFarm?.municipality}/{currentFarm?.state} • Culturas: {currentFarm?.crops.join(', ')}</>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('scenarios')} className="btn btn-secondary">
            <Sliders size={14} color="#06b6d4" />
            <span>Simulador de Cenários</span>
          </button>
          <button onClick={() => onNavigate('reports')} className="btn btn-primary">
            <FileText size={14} />
            <span>Dossiê Executivo</span>
          </button>
        </div>
      </div>

      {/* Multifarm Scope Switcher Strip (Clean Pill Bar) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'var(--color-surface-2)',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
            Escopo:
          </span>

          {/* Consolidated Button */}
          <button
            onClick={() => onFarmChange && onFarmChange('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: isConsolidated ? '1px solid #06b6d4' : '1px solid var(--color-border)',
              background: isConsolidated ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: isConsolidated ? '#22d3ee' : 'var(--color-text-muted)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌾 Consolidado ({totalAreaAllFarms.toLocaleString('pt-BR')} ha)</span>
          </button>

          {/* Individual Farm Buttons */}
          {farms.map(f => {
            const isSelected = selectedFarmId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onFarmChange && onFarmChange(f.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #f59e0b' : '1px solid var(--color-border)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: isSelected ? '#fbbf24' : 'var(--color-text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>📍 {f.name} ({f.totalAreaHa.toLocaleString('pt-BR')} ha)</span>
              </button>
            );
          })}
        </div>

        <div>
          {isConsolidated ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
              Totalidade do Grupo Econômico • 2 Propriedades Auditadas
            </span>
          ) : (
            <button
              onClick={() => onFarmChange && onFarmChange('all')}
              style={{
                background: 'none',
                border: 'none',
                color: '#06b6d4',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>← Voltar à Visão Consolidada</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Balanced Core Financial KPI Cards (Clean, spacious, high hierarchy) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        
        {/* KPI 1: Receita Bruta */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Receita Bruta Safra
            </span>
            <span style={{ color: '#06b6d4' }}><TrendingUp size={16} /></span>
          </div>
          <div className="metric-number" style={{ fontSize: '1.75rem', color: '#f8fafc' }}>
            R$ {(totalGrossRevenue / 1000000).toFixed(2)}M
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: '#10b981' }}>
            <ArrowUpRight size={13} />
            <span>{Math.round(214400 * farmArableRatio).toLocaleString('pt-BR')} sacas ({isConsolidated ? 'Soja + Milho' : currentFarm?.crops.join(' + ')})</span>
          </div>
        </div>

        {/* KPI 2: Custos de Produção */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Custos Operacionais
            </span>
            <span style={{ color: '#94a3b8' }}><DollarSign size={16} /></span>
          </div>
          <div className="metric-number" style={{ fontSize: '1.75rem', color: '#f8fafc' }}>
            R$ {(totalOperatingCost / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '6px' }}>
            Insumos, maquinário e fretes
          </div>
        </div>

        {/* KPI 3: Margem Operacional */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Margem Líquida da Safra
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.66rem' }}>
              {marginPercent.toFixed(1)}%
            </span>
          </div>
          <div className="metric-number" style={{ fontSize: '1.75rem', color: '#34d399' }}>
            R$ {(grossMargin / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '6px' }}>
            Resultado operacional positivo
          </div>
        </div>

        {/* KPI 4: Passivo Bancário */}
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Passivo Bancário & CPRs
            </span>
            <span style={{ color: '#f87171' }}><Landmark size={16} /></span>
          </div>
          <div className="metric-number" style={{ fontSize: '1.75rem', color: '#f87171' }}>
            R$ {(debtBalance / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            <strong style={{ color: '#f87171' }}>{baseDebtMetrics.shortTermPercent.toFixed(0)}%</strong> no curto prazo (alerta de carência)
          </div>
        </div>

      </div>

      {/* Main Trajectory Chart Container (Clean Single-Header Bento Card) */}
      <div className="bento-card" style={{ padding: '20px 24px' }}>
        
        {/* Single Unified Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Trajetória Financeira & Sustentabilidade
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Projeção plurianual da geração de caixa vs amortização da dívida
            </p>
          </div>

          {/* Segmented Control for Multi-year vs 12-Month Cash Flow */}
          <div style={{
            display: 'flex',
            background: 'var(--color-surface-2)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            gap: '3px'
          }}>
            <button
              onClick={() => setChartMode('projection')}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: chartMode === 'projection' ? '#06b6d4' : 'transparent',
                color: chartMode === 'projection' ? '#081018' : 'var(--color-text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              <TrendingUp size={13} />
              <span>Projeção Multissafra (4 Ciclos)</span>
            </button>
            <button
              onClick={() => setChartMode('monthly')}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: chartMode === 'monthly' ? '#06b6d4' : 'transparent',
                color: chartMode === 'monthly' ? '#081018' : 'var(--color-text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={13} />
              <span>Fluxo Mensal (12M)</span>
            </button>
          </div>
        </div>

        {/* Content: Either Multi-year Projection or 12-Month Flow */}
        {chartMode === 'projection' ? (
          <ProjectionChart onScenarioSelect={() => onNavigate('scenarios')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: '540px', height: '220px', position: 'relative' }}>
                <svg 
                  viewBox="0 0 600 200" 
                  preserveAspectRatio="xMidYMid meet"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  {/* Horizontal Baseline */}
                  <line x1="40" y1="160" x2="580" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1="40" y1="110" x2="580" y2="110" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                  <line x1="40" y1="60" x2="580" y2="60" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />

                  {/* Monthly Bars */}
                  {monthlySummaries.map((m, idx) => {
                    const x = 50 + idx * 45;
                    const inflowHeight = (m.inflows / maxMonthlyVal) * 110;
                    const outflowHeight = ((m.outflowsOperating + m.debtService) / maxMonthlyVal) * 110;

                    return (
                      <g key={m.month}>
                        {/* Inflow Bar */}
                        <rect
                          x={x}
                          y={160 - inflowHeight}
                          width="16"
                          height={Math.max(inflowHeight, 2)}
                          fill="#10b981"
                          rx="2"
                          opacity="0.8"
                        />
                        {/* Outflow Bar */}
                        <rect
                          x={x + 18}
                          y={160 - outflowHeight}
                          width="16"
                          height={Math.max(outflowHeight, 2)}
                          fill="#f59e0b"
                          rx="2"
                          opacity="0.8"
                        />
                        {/* Month Text */}
                        <text
                          x={x + 16}
                          y="180"
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {m.monthLabel.split('/')[0]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cash Balance Line Path */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    points={monthlySummaries.map((m, idx) => {
                      const x = 50 + idx * 45 + 16;
                      const y = Math.max(20, Math.min(160, 140 - (m.endingBalance / maxMonthlyVal) * 90));
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Cash Balance Dots */}
                  {monthlySummaries.map((m, idx) => {
                    const x = 50 + idx * 45 + 16;
                    const y = Math.max(20, Math.min(160, 140 - (m.endingBalance / maxMonthlyVal) * 90));
                    return (
                      <circle
                        key={`dot-${m.month}`}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill={m.endingBalance >= 0 ? '#06b6d4' : '#ef4444'}
                        stroke="#0b0f17"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '6px', fontSize: '0.74rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Recebimentos (Entradas)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Desembolsos (Operacional + Dívida)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2.5px', background: '#06b6d4', borderRadius: '2px' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Saldo Acumulado de Caixa</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Row: Agronomic Diagnostics & Restructuring Priorities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Agronomic Break-even Diagnostics */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={17} color="#34d399" />
                <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>Diagnóstico Agronômico & Break-Even</h3>
              </div>
              <button onClick={() => onNavigate('crops')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                Ver Safras
              </button>
            </div>

            {/* Soja Card */}
            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '12px 14px',
              border: '1px solid var(--color-border)',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>Soja 1ª Safra ({soyCrop.plantedAreaHa} ha)</strong>
                <span className="badge badge-green">{soyCrop.expectedYieldScHa} sc/ha</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.74rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Custo/ha</span>
                  <strong style={{ color: '#fff' }}>R$ {soyCrop.operatingCostPerHa.toLocaleString('pt-BR')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Break-Even</span>
                  <strong style={{ color: '#fbbf24' }}>{soyCrop.breakEvenScHa.toFixed(1)} sc/ha</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Margem Direta</span>
                  <strong style={{ color: '#34d399' }}>R$ {(soyCrop.grossMargin / 1000000).toFixed(2)}M</strong>
                </div>
              </div>
            </div>

            {/* Milho Card */}
            {cornCrop && (
              <div style={{
                background: 'var(--color-surface-2)',
                borderRadius: '8px',
                padding: '12px 14px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>Milho 2ª Safra ({cornCrop.plantedAreaHa} ha)</strong>
                  <span className="badge badge-amber">{cornCrop.expectedYieldScHa} sc/ha</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.74rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Custo/ha</span>
                    <strong style={{ color: '#fff' }}>R$ {cornCrop.operatingCostPerHa.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Break-Even</span>
                    <strong style={{ color: '#fbbf24' }}>{cornCrop.breakEvenScHa.toFixed(1)} sc/ha</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-subtle)', display: 'block' }}>Margem Direta</span>
                    <strong style={{ color: '#34d399' }}>R$ {(cornCrop.grossMargin / 1000000).toFixed(2)}M</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '12px',
            background: 'rgba(6, 182, 212, 0.06)',
            borderLeft: '2px solid #06b6d4',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.74rem',
            color: 'var(--color-text-muted)'
          }}>
            <strong style={{ color: '#22d3ee' }}>Segurança Agronômica:</strong> A soja está 26,8 sc/ha acima do custo de equilíbrio. Trava recomendada para o milho a R$ 56/sc.
          </div>
        </div>

        {/* Restructuring & Risk Highlights Card */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={17} color="#06b6d4" />
                <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>Plano de Ação & Riscos</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => onNavigate('restructuring')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  Ver Ações ({pendingActions.length})
                </button>
                <button onClick={() => onNavigate('risks')} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  Matriz ({criticalRisks.length})
                </button>
              </div>
            </div>

            {/* Top Priority Action */}
            {actions[0] && (
              <div style={{
                background: 'var(--color-surface-2)',
                borderRadius: '8px',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>Ação Prioritária</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>Prazo: {actions[0].deadline}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, margin: '4px 0' }}>
                  {actions[0].action}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  <span>Resp: {actions[0].responsible.split('(')[0]}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>+R$ {(actions[0].estimatedImpactR$ / 1000).toFixed(0)}k</span>
                </div>
              </div>
            )}

            {/* Top Critical Risk */}
            {criticalRisks[0] && (
              <div style={{
                background: 'var(--color-surface-2)',
                borderRadius: '8px',
                padding: '12px 14px',
                borderLeft: '2px solid #ef4444',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>{criticalRisks[0].title}</span>
                  <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>Crítico</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: '4px 0 6px' }}>
                  {criticalRisks[0].problem}
                </p>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
                  <strong>Recomendação:</strong> {criticalRisks[0].recommendation}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => onNavigate('restructuring')} 
              className="btn btn-secondary" 
              style={{ width: '100%', fontSize: '0.76rem', justifyContent: 'space-between' }}
            >
              <span>Gerenciar Plano de Reestruturação Completo</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
