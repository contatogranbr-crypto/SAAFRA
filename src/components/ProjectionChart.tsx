// Componente de Gráfico de Projeção Financeira & Trajetória de Safra - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { ScenarioSimulation } from '../types';

export interface MultiYearProjectionSafra {
  safra: string;
  label: string;
  isProjected: boolean;
  base: {
    revenue: number;
    costs: number;
    margin: number;
    debtService: number;
    endingCash: number;
    icsd: number; // Índice de Cobertura do Serviço da Dívida (EBITDA / Serviço Dívida)
  };
  pessimistic: {
    revenue: number;
    costs: number;
    margin: number;
    debtService: number;
    endingCash: number;
    icsd: number;
  };
  restructured: {
    revenue: number;
    costs: number;
    margin: number;
    debtService: number;
    endingCash: number;
    icsd: number;
  };
  judicial: {
    revenue: number;
    costs: number;
    margin: number;
    debtService: number;
    endingCash: number;
    icsd: number;
  };
}

// Projeção multissafra determinística alinhada à modelagem Gran Bernardo
export const DEFAULT_PROJECTION_DATA: MultiYearProjectionSafra[] = [
  {
    safra: '2024/2025',
    label: 'Safra 24/25 (Atual)',
    isProjected: false,
    base: {
      revenue: 20371200,
      costs: 11864000,
      margin: 8507200,
      debtService: 8880000,
      endingCash: 410600,
      icsd: 0.96
    },
    pessimistic: {
      revenue: 13852416,
      costs: 12813120,
      margin: 1039296,
      debtService: 8880000,
      endingCash: -7057304,
      icsd: 0.12
    },
    restructured: {
      revenue: 20371200,
      costs: 11389440,
      margin: 8981760,
      debtService: 2664000,
      endingCash: 4210360,
      icsd: 3.38
    },
    judicial: {
      revenue: 18384000,
      costs: 11864000,
      margin: 6520000,
      debtService: 1864800,
      endingCash: 3120000,
      icsd: 3.50
    }
  },
  {
    safra: '2025/2026',
    label: 'Safra 25/26 (Proj.)',
    isProjected: true,
    base: {
      revenue: 21800000,
      costs: 12200000,
      margin: 9600000,
      debtService: 8200000,
      endingCash: 1810600,
      icsd: 1.17
    },
    pessimistic: {
      revenue: 15200000,
      costs: 13100000,
      margin: 2100000,
      debtService: 9400000,
      endingCash: -14357304,
      icsd: 0.22
    },
    restructured: {
      revenue: 22400000,
      costs: 11900000,
      margin: 10500000,
      debtService: 3200000,
      endingCash: 9450360,
      icsd: 3.28
    },
    judicial: {
      revenue: 19500000,
      costs: 12100000,
      margin: 7400000,
      debtService: 1950000,
      endingCash: 6810000,
      icsd: 3.79
    }
  },
  {
    safra: '2026/2027',
    label: 'Safra 26/27 (Proj.)',
    isProjected: true,
    base: {
      revenue: 23100000,
      costs: 12600000,
      margin: 10500000,
      debtService: 6900000,
      endingCash: 5410600,
      icsd: 1.52
    },
    pessimistic: {
      revenue: 16500000,
      costs: 13500000,
      margin: 3000000,
      debtService: 9900000,
      endingCash: -21257304,
      icsd: 0.30
    },
    restructured: {
      revenue: 24200000,
      costs: 12400000,
      margin: 11800000,
      debtService: 3400000,
      endingCash: 15650360,
      icsd: 3.47
    },
    judicial: {
      revenue: 21200000,
      costs: 12500000,
      margin: 8700000,
      debtService: 2400000,
      endingCash: 11210000,
      icsd: 3.63
    }
  },
  {
    safra: '2027/2028',
    label: 'Safra 27/28 (Proj.)',
    isProjected: true,
    base: {
      revenue: 24500000,
      costs: 13000000,
      margin: 11500000,
      debtService: 4200000,
      endingCash: 12710600,
      icsd: 2.74
    },
    pessimistic: {
      revenue: 17800000,
      costs: 13900000,
      margin: 3900000,
      debtService: 10400000,
      endingCash: -27757304,
      icsd: 0.38
    },
    restructured: {
      revenue: 26000000,
      costs: 12900000,
      margin: 13100000,
      debtService: 2100000,
      endingCash: 24150360,
      icsd: 6.24
    },
    judicial: {
      revenue: 23000000,
      costs: 12900000,
      margin: 10100000,
      debtService: 2600000,
      endingCash: 16710000,
      icsd: 3.88
    }
  }
];

export interface ProjectionChartProps {
  scenarios?: ScenarioSimulation[];
  activeScenarioId?: string;
  onScenarioSelect?: (id: string) => void;
  compact?: boolean;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  scenarios,
  activeScenarioId = 'scen-extrajudicial',
  onScenarioSelect,
  compact = false
}) => {
  // Modos de visualização
  const [viewMode, setViewMode] = useState<'cash_evolution' | 'breakdown' | 'coverage'>('cash_evolution');
  // Cenário selecionado no breakdown
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'restructured' | 'base' | 'pessimistic' | 'judicial'>('restructured');
  // Tooltip interativo
  const [hoveredData, setHoveredData] = useState<{
    safraLabel: string;
    scenarioName: string;
    value: number;
    additionalInfo: string;
    x: number;
    y: number;
  } | null>(null);

  const data = DEFAULT_PROJECTION_DATA;

  // Ajustes de escala gráfica para o SVG
  const svgWidth = 640;
  const svgHeight = compact ? 220 : 250;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Escala para 'cash_evolution': varia de -30M a +28M
  const minCash = -30000000;
  const maxCash = 28000000;
  const cashRange = maxCash - minCash;

  const getYForCash = (val: number) => {
    const clamped = Math.max(minCash, Math.min(maxCash, val));
    const ratio = (clamped - minCash) / cashRange;
    return paddingTop + chartHeight * (1 - ratio);
  };

  const zeroCashY = getYForCash(0);

  const getXForIndex = (idx: number) => {
    return paddingLeft + (idx / (data.length - 1)) * chartWidth;
  };

  // Cores institucionais
  const colors = {
    restructured: '#00f2fe',  // Ciano Neon Gran Bernardo
    base: '#2563eb',          // Azul Elétrico
    pessimistic: '#f97316',   // Laranja Alerta
    judicial: '#a855f7'       // Roxo Reestruturação
  };

  // Caminhos SVG para as curvas
  const pointsRestructured = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.restructured.endingCash)}`).join(' ');
  const pointsBase = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.base.endingCash)}`).join(' ');
  const pointsPessimistic = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.pessimistic.endingCash)}`).join(' ');
  const pointsJudicial = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.judicial.endingCash)}`).join(' ');

  // Métricas do cenário ativo
  const lastSafra = data[data.length - 1];
  const firstSafra = data[0];
  const currentScenarioMetrics = lastSafra[selectedScenarioKey];
  const cashGainThreeYears = (currentScenarioMetrics.endingCash - firstSafra[selectedScenarioKey].endingCash) / 1000000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Chart Header & Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: '#00f2fe', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Projeção Plurianual de Safra (4 Ciclos)
            </span>
            <span style={{ color: 'var(--color-text-subtle)' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
              Metodologia Gran Bernardo
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
            Trajetória de Caixa & Sustentabilidade da Safra
          </h3>
        </div>

        {/* Clean Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-2)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          gap: '4px'
        }}>
          <button
            onClick={() => setViewMode('cash_evolution')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'cash_evolution' ? '#00f2fe' : 'transparent',
              color: viewMode === 'cash_evolution' ? '#090b0e' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={13} />
            <span>Cenários de Caixa</span>
          </button>

          <button
            onClick={() => setViewMode('breakdown')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'breakdown' ? '#00f2fe' : 'transparent',
              color: viewMode === 'breakdown' ? '#090b0e' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={13} />
            <span>Receita vs Dívida</span>
          </button>

          <button
            onClick={() => setViewMode('coverage')}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'coverage' ? '#00f2fe' : 'transparent',
              color: viewMode === 'coverage' ? '#090b0e' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={13} />
            <span>Capacidade de Pagamento (ICSD)</span>
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Chart Container */}
      <div style={{
        background: 'var(--color-surface-2)',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        padding: '16px 14px',
        position: 'relative'
      }}>
        
        {/* Tooltip Overlay */}
        {hoveredData && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(svgWidth - 190, Math.max(10, hoveredData.x))}px`,
            top: `${Math.max(10, hoveredData.y - 65)}px`,
            background: 'rgba(11, 13, 17, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #00f2fe',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.75rem',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ color: '#00f2fe', fontWeight: 700, marginBottom: '2px' }}>
              {hoveredData.safraLabel} • {hoveredData.scenarioName}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
              R$ {(hoveredData.value / 1000000).toFixed(2)}M
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginTop: '2px' }}>
              {hoveredData.additionalInfo}
            </div>
          </div>
        )}

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '560px', height: `${svgHeight}px` }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="gradientRestructured" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradientPessimistic" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.25} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight * 0.25} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.5} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.75} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight * 0.75} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} stroke="rgba(255,255,255,0.08)" />

              {/* Linha Zero (Break-even de Caixa) */}
              <line
                x1={paddingLeft}
                y1={zeroCashY}
                x2={svgWidth - paddingRight}
                y2={zeroCashY}
                stroke="rgba(239, 68, 68, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 8}
                y={zeroCashY + 3}
                fill="#ef4444"
                fontSize="9"
                fontWeight="700"
                textAnchor="end"
                fontFamily="IBM Plex Sans, Inter"
              >
                R$ 0 (Zero)
              </text>

              {/* Eixo Y Labels */}
              <text x={paddingLeft - 8} y={getYForCash(25000000)} fill="#94a3b8" fontSize="9" textAnchor="end">+R$ 25M</text>
              <text x={paddingLeft - 8} y={getYForCash(12500000)} fill="#94a3b8" fontSize="9" textAnchor="end">+R$ 12.5M</text>
              <text x={paddingLeft - 8} y={getYForCash(-15000000)} fill="#94a3b8" fontSize="9" textAnchor="end">-R$ 15M</text>
              <text x={paddingLeft - 8} y={getYForCash(-28000000)} fill="#94a3b8" fontSize="9" textAnchor="end">-R$ 28M</text>

              {/* Vertical Guide Lines for Each Safra */}
              {data.map((d, i) => {
                const x = getXForIndex(i);
                return (
                  <g key={d.safra}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="2,2"
                    />
                    {/* Safra Label */}
                    <text
                      x={x}
                      y={svgHeight - 12}
                      fill={d.isProjected ? '#00f2fe' : '#ffffff'}
                      fontSize="10"
                      fontWeight={d.isProjected ? '600' : '700'}
                      textAnchor="middle"
                      fontFamily="IBM Plex Sans, Inter"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* ========================================================
                  MODO 1: CENÁRIOS DE CAIXA (CASH EVOLUTION)
                  ======================================================== */}
              {viewMode === 'cash_evolution' && (
                <>
                  {/* Curva Estressada (Laranja) */}
                  <polyline
                    fill="none"
                    stroke={colors.pessimistic}
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    points={pointsPessimistic}
                  />

                  {/* Curva Base (Azul Elétrico) */}
                  <polyline
                    fill="none"
                    stroke={colors.base}
                    strokeWidth="2"
                    points={pointsBase}
                  />

                  {/* Curva Judicial (Roxo) */}
                  <polyline
                    fill="none"
                    stroke={colors.judicial}
                    strokeWidth="1.8"
                    strokeDasharray="3,2"
                    points={pointsJudicial}
                  />

                  {/* Curva Reestruturada Gran Bernardo (Ciano Neon - Destaque Principal) */}
                  <polyline
                    fill="none"
                    stroke={colors.restructured}
                    strokeWidth="3.2"
                    points={pointsRestructured}
                  />

                  {/* Pontos Interativos: Gran Bernardo Reestruturado */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = getYForCash(d.restructured.endingCash);
                    return (
                      <circle
                        key={`restructured-${d.safra}`}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#00f2fe"
                        stroke="#090b0e"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Reestruturação Gran Bernardo',
                            value: d.restructured.endingCash,
                            additionalInfo: `Serviço Dívida: R$ ${(d.restructured.debtService / 1000000).toFixed(2)}M • ICSD: ${d.restructured.icsd}x`,
                            x: x,
                            y: y
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}

                  {/* Pontos Interativos: Cenário Estresse (Alerta) */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = getYForCash(d.pessimistic.endingCash);
                    return (
                      <circle
                        key={`pessimistic-${d.safra}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#f97316"
                        stroke="#090b0e"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Cenário de Estresse (Quebra)',
                            value: d.pessimistic.endingCash,
                            additionalInfo: 'Déficit severo sem alongamento de passivo',
                            x: x,
                            y: y
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}

                  {/* Pontos Interativos: Cenário Base */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = getYForCash(d.base.endingCash);
                    return (
                      <circle
                        key={`base-${d.safra}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#2563eb"
                        stroke="#090b0e"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Cenário Base (Oficial)',
                            value: d.base.endingCash,
                            additionalInfo: `Margem: R$ ${(d.base.margin / 1000000).toFixed(2)}M`,
                            x: x,
                            y: y
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}
                </>
              )}

              {/* ========================================================
                  MODO 2: BREAKDOWN (RECEITAS VS CUSTOS VS DÍVIDA)
                  ======================================================== */}
              {viewMode === 'breakdown' && (
                <>
                  {data.map((d, i) => {
                    const xCenter = getXForIndex(i);
                    const metrics = d[selectedScenarioKey];
                    const barW = 22;

                    // Normalização para 28M
                    const maxVal = 28000000;
                    const hRevenue = (metrics.revenue / maxVal) * (chartHeight * 0.85);
                    const hCost = (metrics.costs / maxVal) * (chartHeight * 0.85);
                    const hDebt = (metrics.debtService / maxVal) * (chartHeight * 0.85);

                    return (
                      <g key={`bar-${d.safra}`}>
                        {/* Barra Receita (Verde) */}
                        <rect
                          x={xCenter - barW * 1.5 - 3}
                          y={paddingTop + chartHeight - hRevenue}
                          width={barW}
                          height={Math.max(hRevenue, 3)}
                          fill="#10b981"
                          rx="3"
                          opacity="0.85"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Receita Bruta Total',
                            value: metrics.revenue,
                            additionalInfo: `Margem Bruta: R$ ${(metrics.margin / 1000000).toFixed(2)}M`,
                            x: xCenter - barW,
                            y: paddingTop + chartHeight - hRevenue
                          })}
                          onMouseLeave={() => setHoveredData(null)}
                        />

                        {/* Barra Custos (Laranja) */}
                        <rect
                          x={xCenter - barW * 0.5}
                          y={paddingTop + chartHeight - hCost}
                          width={barW}
                          height={Math.max(hCost, 3)}
                          fill="#f97316"
                          rx="3"
                          opacity="0.85"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Custos Operacionais',
                            value: metrics.costs,
                            additionalInfo: 'Insumos, Máquinas e Mão de Obra',
                            x: xCenter,
                            y: paddingTop + chartHeight - hCost
                          })}
                          onMouseLeave={() => setHoveredData(null)}
                        />

                        {/* Barra Serviço da Dívida (Vermelho) */}
                        <rect
                          x={xCenter + barW * 0.5 + 3}
                          y={paddingTop + chartHeight - hDebt}
                          width={barW}
                          height={Math.max(hDebt, 3)}
                          fill="#ef4444"
                          rx="3"
                          opacity="0.85"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Serviço da Dívida Anual',
                            value: metrics.debtService,
                            additionalInfo: 'Amortizações de Custeio, CPRs e Investimento',
                            x: xCenter + barW,
                            y: paddingTop + chartHeight - hDebt
                          })}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* ========================================================
                  MODO 3: COBERTURA DO SERVIÇO DA DÍVIDA (ICSD)
                  ======================================================== */}
              {viewMode === 'coverage' && (
                <>
                  {/* Faixa Segura (> 1.5x) */}
                  <rect
                    x={paddingLeft}
                    y={paddingTop}
                    width={chartWidth}
                    height={chartHeight * 0.5}
                    fill="rgba(16, 185, 129, 0.05)"
                  />
                  {/* Faixa Crítica (< 1.0x) */}
                  <rect
                    x={paddingLeft}
                    y={paddingTop + chartHeight * 0.7}
                    width={chartWidth}
                    height={chartHeight * 0.3}
                    fill="rgba(239, 68, 68, 0.08)"
                  />

                  {/* Linha 1.0x (Limite Mínimo de Sobrevivência) */}
                  <line
                    x1={paddingLeft}
                    y1={paddingTop + chartHeight * 0.7}
                    x2={svgWidth - paddingRight}
                    y2={paddingTop + chartHeight * 0.7}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={paddingTop + chartHeight * 0.7 + 3}
                    fill="#ef4444"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="end"
                  >
                    1.0x Crítico
                  </text>

                  {/* Curva ICSD Reestruturada */}
                  <polyline
                    fill="none"
                    stroke="#00f2fe"
                    strokeWidth="3"
                    points={data.map((d, i) => {
                      const x = getXForIndex(i);
                      // ICSD normalizado de 0 a 7
                      const y = paddingTop + chartHeight * (1 - Math.min(6.5, d.restructured.icsd) / 6.5);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Curva ICSD Base */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                    points={data.map((d, i) => {
                      const x = getXForIndex(i);
                      const y = paddingTop + chartHeight * (1 - Math.min(6.5, d.base.icsd) / 6.5);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Pontos ICSD */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = paddingTop + chartHeight * (1 - Math.min(6.5, d.restructured.icsd) / 6.5);
                    return (
                      <g key={`icsd-${d.safra}`}>
                        <circle cx={x} cy={y} r="5" fill="#00f2fe" stroke="#090b0e" strokeWidth="2" />
                        <text
                          x={x}
                          y={y - 10}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {d.restructured.icsd.toFixed(1)}x
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

            </svg>
          </div>
        </div>

        {/* Dynamic Legend and Scenario Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.74rem'
        }}>
          {viewMode === 'cash_evolution' && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '3.5px', background: colors.restructured, borderRadius: '2px' }} />
                <strong style={{ color: '#ffffff' }}>Reestruturação Gran Bernardo (Ciano Neon)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2.5px', background: colors.base, borderRadius: '2px' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Cenário Base (Azul Elétrico)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2.5px', background: colors.pessimistic, borderTop: '2px dashed #f97316' }} />
                <span style={{ color: '#f97316' }}>Estresse / Quebra (Laranja)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: colors.judicial, borderTop: '2px dashed #a855f7' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Recuperação Judicial (Roxo)</span>
              </div>
            </div>
          )}

          {viewMode === 'breakdown' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                <span style={{ color: '#fff' }}>Receita Bruta</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#f97316', borderRadius: '2px' }} />
                <span style={{ color: '#fff' }}>Custos de Produção</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }} />
                <span style={{ color: '#fff' }}>Serviço da Dívida</span>
              </div>

              {/* Scenario Toggle for Breakdown */}
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value as any)}
                style={{
                  background: 'var(--color-surface-3)',
                  color: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="restructured">Cenário: Reestruturação Gran Bernardo</option>
                <option value="base">Cenário: Base Oficial</option>
                <option value="pessimistic">Cenário: Estresse / Quebra</option>
                <option value="judicial">Cenário: Recuperação Judicial</option>
              </select>
            </div>
          )}

          {viewMode === 'coverage' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '3px', background: '#00f2fe' }} />
                <span style={{ color: '#fff' }}>ICSD Projetado Gran Bernardo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: '#2563eb' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>ICSD Cenário Base</span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 600 }}>ICSD &gt; 1.5x indica capacidade plena de amortização</span>
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>
            Base determinística • Gran Bernardo Agro
          </div>
        </div>

      </div>

      {/* 3 Clean Projection Metric Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
            Alívio Imediato de Caixa (1º Ano)
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00f2fe', marginTop: '2px' }}>
            +R$ 6,22M
          </div>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
            Carência de amortização principal
          </span>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
            Saldo Projetado Safra 27/28
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            R$ 24,15M
          </div>
          <span style={{ fontSize: '0.7rem', color: '#00f2fe' }}>
            Recuperação total da liquidez
          </span>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 14px'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
            Proteção Contra Quebra
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            R$ 21,2M
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            Evita déficit acumulado no estresse
          </span>
        </div>
      </div>

    </div>
  );
};
