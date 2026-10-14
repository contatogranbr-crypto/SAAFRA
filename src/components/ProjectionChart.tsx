// Componente de Gráfico de Projeção Financeira & Trajetória de Safra - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight
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
    icsd: number;
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

export const DEFAULT_PROJECTION_DATA: MultiYearProjectionSafra[] = [
  {
    safra: '2025/2026',
    label: 'Safra 25/26',
    isProjected: false,
    base: {
      revenue: 7250775,
      costs: 3755800,
      margin: 3494975,
      debtService: 8643160,
      endingCash: -5148185,
      icsd: 0.40
    },
    pessimistic: {
      revenue: 5220000,
      costs: 3950000,
      margin: 1270000,
      debtService: 8643160,
      endingCash: -7373160,
      icsd: 0.15
    },
    restructured: {
      revenue: 7250775,
      costs: 4205800,
      margin: 3044975,
      debtService: 5515548,
      endingCash: -2470574,
      icsd: 0.55
    },
    judicial: {
      revenue: 7250775,
      costs: 3865800,
      margin: 3384975,
      debtService: 2693700,
      endingCash: 691275,
      icsd: 1.26
    }
  },
  {
    safra: '2026/2027',
    label: 'Safra 26/27 (Proj.)',
    isProjected: true,
    base: {
      revenue: 7850000,
      costs: 3950000,
      margin: 3900000,
      debtService: 8900000,
      endingCash: -9540035,
      icsd: 0.44
    },
    pessimistic: {
      revenue: 5800000,
      costs: 4100000,
      margin: 1700000,
      debtService: 8900000,
      endingCash: -12640000,
      icsd: 0.19
    },
    restructured: {
      revenue: 7850000,
      costs: 4100000,
      margin: 3750000,
      debtService: 7609546,
      endingCash: -6330120,
      icsd: 0.49
    },
    judicial: {
      revenue: 7850000,
      costs: 4000000,
      margin: 3850000,
      debtService: 3500293,
      endingCash: 1040981,
      icsd: 1.10
    }
  },
  {
    safra: '2027/2028',
    label: 'Safra 27/28 (Proj.)',
    isProjected: true,
    base: {
      revenue: 8400000,
      costs: 4200000,
      margin: 4200000,
      debtService: 9200000,
      endingCash: -13800000,
      icsd: 0.46
    },
    pessimistic: {
      revenue: 6400000,
      costs: 4300000,
      margin: 2100000,
      debtService: 9200000,
      endingCash: -17500000,
      icsd: 0.23
    },
    restructured: {
      revenue: 8400000,
      costs: 4250000,
      margin: 4150000,
      debtService: 6697855,
      endingCash: -8877976,
      icsd: 0.62
    },
    judicial: {
      revenue: 8400000,
      costs: 4100000,
      margin: 4300000,
      debtService: 3848436,
      endingCash: 1492545,
      icsd: 1.12
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
  // Toggle de cenários opcionais (para evitar poluição visual de 4 linhas simultâneas)
  const [showStress, setShowStress] = useState<boolean>(false);
  const [showJudicial, setShowJudicial] = useState<boolean>(false);
  // Cenário no breakdown
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'restructured' | 'base' | 'pessimistic' | 'judicial'>('restructured');
  // Tooltip
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
  const svgWidth = 660;
  const svgHeight = compact ? 210 : 230;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 35;

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

  // Cores suaves e elegantes
  const colors = {
    restructured: '#06b6d4',  // Teal Principal
    base: '#3b82f6',          // Azul Suave
    pessimistic: '#f59e0b',   // Âmbar
    judicial: '#8b5cf6'       // Roxo Suave
  };

  const pointsRestructured = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.restructured.endingCash)}`).join(' ');
  const pointsBase = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.base.endingCash)}`).join(' ');
  const pointsPessimistic = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.pessimistic.endingCash)}`).join(' ');
  const pointsJudicial = data.map((d, i) => `${getXForIndex(i)},${getYForCash(d.judicial.endingCash)}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Clean Mode Switcher & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* View Mode Pills */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-2)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          gap: '2px'
        }}>
          <button
            onClick={() => setViewMode('cash_evolution')}
            style={{
              padding: '5px 12px',
              fontSize: '0.74rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'cash_evolution' ? '#06b6d4' : 'transparent',
              color: viewMode === 'cash_evolution' ? '#081018' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={13} />
            <span>Trajetória de Caixa</span>
          </button>

          <button
            onClick={() => setViewMode('breakdown')}
            style={{
              padding: '5px 12px',
              fontSize: '0.74rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'breakdown' ? '#06b6d4' : 'transparent',
              color: viewMode === 'breakdown' ? '#081018' : 'var(--color-text-muted)',
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
              fontSize: '0.74rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: viewMode === 'coverage' ? '#06b6d4' : 'transparent',
              color: viewMode === 'coverage' ? '#081018' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={13} />
            <span>Capacidade (ICSD)</span>
          </button>
        </div>

        {/* Optional Overlays Toggle (When in cash_evolution) */}
        {viewMode === 'cash_evolution' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>Comparar:</span>
            <button
              onClick={() => setShowStress(prev => !prev)}
              style={{
                background: showStress ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: showStress ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--color-border)',
                color: showStress ? '#fbbf24' : 'var(--color-text-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showStress ? '✓ Cenário de Estresse' : '+ Estresse (Quebra)'}
            </button>
            <button
              onClick={() => setShowJudicial(prev => !prev)}
              style={{
                background: showJudicial ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                border: showJudicial ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--color-border)',
                color: showJudicial ? '#c4b5fd' : 'var(--color-text-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showJudicial ? '✓ Recuperação Judicial' : '+ Rec. Judicial'}
            </button>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div style={{
        background: 'var(--color-surface-2)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        padding: '16px 14px 10px',
        position: 'relative'
      }}>
        
        {/* Tooltip Overlay */}
        {hoveredData && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(svgWidth - 190, Math.max(10, hoveredData.x))}px`,
            top: `${Math.max(10, hoveredData.y - 65)}px`,
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid var(--color-primary)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.75rem',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ color: '#06b6d4', fontWeight: 700, marginBottom: '2px' }}>
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
          <div style={{ minWidth: '540px', height: `${svgHeight}px` }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Subtle Grid Lines */}
              <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.5} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight * 0.5} stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} stroke="rgba(255,255,255,0.06)" />

              {/* Linha Zero (Equilíbrio de Caixa) */}
              <line
                x1={paddingLeft}
                y1={zeroCashY}
                x2={svgWidth - paddingRight}
                y2={zeroCashY}
                stroke="rgba(239, 68, 68, 0.25)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 8}
                y={zeroCashY + 3}
                fill="#f87171"
                fontSize="8.5"
                fontWeight="600"
                textAnchor="end"
              >
                R$ 0
              </text>

              {/* Y Axis Reference */}
              <text x={paddingLeft - 8} y={getYForCash(25000000)} fill="#64748b" fontSize="8.5" textAnchor="end">+25M</text>
              <text x={paddingLeft - 8} y={getYForCash(-20000000)} fill="#64748b" fontSize="8.5" textAnchor="end">-20M</text>

              {/* Vertical Column Guides */}
              {data.map((d, i) => {
                const x = getXForIndex(i);
                return (
                  <g key={d.safra}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <text
                      x={x}
                      y={svgHeight - 8}
                      fill={d.isProjected ? '#94a3b8' : '#f8fafc'}
                      fontSize="9.5"
                      fontWeight={d.isProjected ? '500' : '700'}
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* MODO 1: Trajetória de Caixa */}
              {viewMode === 'cash_evolution' && (
                <>
                  {/* Curva Estressada (Opcional) */}
                  {showStress && (
                    <polyline
                      fill="none"
                      stroke={colors.pessimistic}
                      strokeWidth="2"
                      strokeDasharray="4,3"
                      points={pointsPessimistic}
                    />
                  )}

                  {/* Curva Judicial (Opcional) */}
                  {showJudicial && (
                    <polyline
                      fill="none"
                      stroke={colors.judicial}
                      strokeWidth="1.8"
                      strokeDasharray="3,2"
                      points={pointsJudicial}
                    />
                  )}

                  {/* Curva Base Oficial */}
                  <polyline
                    fill="none"
                    stroke={colors.base}
                    strokeWidth="1.8"
                    strokeDasharray="4,2"
                    points={pointsBase}
                  />

                  {/* Curva Reestruturada Gran Bernardo (Destaque Principal) */}
                  <polyline
                    fill="none"
                    stroke={colors.restructured}
                    strokeWidth="2.8"
                    points={pointsRestructured}
                  />

                  {/* Pontos Reestruturados */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = getYForCash(d.restructured.endingCash);
                    return (
                      <circle
                        key={`restructured-${d.safra}`}
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#06b6d4"
                        stroke="#0b0f17"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Reestruturação Gran Bernardo',
                            value: d.restructured.endingCash,
                            additionalInfo: `Serviço Dívida: R$ ${(d.restructured.debtService / 1000000).toFixed(2)}M • ICSD: ${d.restructured.icsd}x`,
                            x,
                            y
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}

                  {/* Pontos Cenário Base */}
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = getYForCash(d.base.endingCash);
                    return (
                      <circle
                        key={`base-${d.safra}`}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#3b82f6"
                        stroke="#0b0f17"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredData({
                            safraLabel: d.safra,
                            scenarioName: 'Cenário Base (Oficial)',
                            value: d.base.endingCash,
                            additionalInfo: `Margem: R$ ${(d.base.margin / 1000000).toFixed(2)}M`,
                            x,
                            y
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}
                </>
              )}

              {/* MODO 2: Breakdown */}
              {viewMode === 'breakdown' && (
                <>
                  {data.map((d, i) => {
                    const xCenter = getXForIndex(i);
                    const metrics = d[selectedScenarioKey];
                    const barW = 20;
                    const maxVal = 28000000;
                    const hRevenue = (metrics.revenue / maxVal) * (chartHeight * 0.85);
                    const hCost = (metrics.costs / maxVal) * (chartHeight * 0.85);
                    const hDebt = (metrics.debtService / maxVal) * (chartHeight * 0.85);

                    return (
                      <g key={`bar-${d.safra}`}>
                        <rect
                          x={xCenter - barW * 1.5 - 2}
                          y={paddingTop + chartHeight - hRevenue}
                          width={barW}
                          height={Math.max(hRevenue, 2)}
                          fill="#10b981"
                          rx="2"
                          opacity="0.85"
                        />
                        <rect
                          x={xCenter - barW * 0.5}
                          y={paddingTop + chartHeight - hCost}
                          width={barW}
                          height={Math.max(hCost, 2)}
                          fill="#f59e0b"
                          rx="2"
                          opacity="0.85"
                        />
                        <rect
                          x={xCenter + barW * 0.5 + 2}
                          y={paddingTop + chartHeight - hDebt}
                          width={barW}
                          height={Math.max(hDebt, 2)}
                          fill="#ef4444"
                          rx="2"
                          opacity="0.85"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* MODO 3: ICSD */}
              {viewMode === 'coverage' && (
                <>
                  <line
                    x1={paddingLeft}
                    y1={paddingTop + chartHeight * 0.7}
                    x2={svgWidth - paddingRight}
                    y2={paddingTop + chartHeight * 0.7}
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={paddingTop + chartHeight * 0.7 + 3}
                    fill="#f87171"
                    fontSize="8.5"
                    textAnchor="end"
                  >
                    1.0x Crítico
                  </text>
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    points={data.map((d, i) => {
                      const x = getXForIndex(i);
                      const y = paddingTop + chartHeight * (1 - Math.min(6.5, d.restructured.icsd) / 6.5);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {data.map((d, i) => {
                    const x = getXForIndex(i);
                    const y = paddingTop + chartHeight * (1 - Math.min(6.5, d.restructured.icsd) / 6.5);
                    return (
                      <circle key={`icsd-${d.safra}`} cx={x} cy={y} r="4" fill="#06b6d4" stroke="#0b0f17" strokeWidth="1.5" />
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Clean Minimal Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '3px', background: colors.restructured, borderRadius: '2px' }} />
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>Plano Gran Bernardo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '2px', background: colors.base, borderTop: '2px dashed #3b82f6' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>Cenário Base (Atual)</span>
            </div>
            {showStress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', background: colors.pessimistic, borderTop: '2px dashed #f59e0b' }} />
                <span style={{ color: '#fbbf24' }}>Estresse / Quebra</span>
              </div>
            )}
            {showJudicial && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', background: colors.judicial, borderTop: '2px dashed #8b5cf6' }} />
                <span style={{ color: '#c4b5fd' }}>Recuperação Judicial</span>
              </div>
            )}
          </div>

          <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.68rem' }}>
            Modelagem Determinística Gran Bernardo
          </span>
        </div>

      </div>

      {/* 3 Balanced Key Financial Projection Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
            Alívio de Caixa (Ano 1)
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22d3ee', marginTop: '2px' }}>
            +R$ 6,22M
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
            Carência de amortização principal
          </span>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
            Liquidez Final Projetada (27/28)
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
            R$ 24,15M
          </div>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
            Capacidade plena de reinvestimento
          </span>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
            Proteção Contra Estresse
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            R$ 21,2M
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
            Evita insolvência acumulada
          </span>
        </div>
      </div>

    </div>
  );
};
