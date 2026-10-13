// Simulador de Cenários Multidimensionais - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Layers 
} from 'lucide-react';
import { 
  CropPlanningItem, 
  DebtLiability, 
  CashFlowMonthlySummary, 
  ScenarioSimulation 
} from '../types';
import { FinancialEngine } from '../services/financialEngine';
import { ProjectionChart } from '../components/ProjectionChart';

interface ScenarioSimulatorViewProps {
  scenarios: ScenarioSimulation[];
  crops: CropPlanningItem[];
  debts: DebtLiability[];
  monthlySummaries: CashFlowMonthlySummary[];
  onUpdateScenario: (updated: ScenarioSimulation) => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  scenarios,
  crops,
  debts,
  monthlySummaries,
  onUpdateScenario
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-pessimistic');

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const handleSliderChange = (param: keyof ScenarioSimulation, value: number) => {
    const updated = {
      ...activeScenario,
      [param]: value
    };
    const recalculated = FinancialEngine.runScenarioSimulation(
      updated,
      crops,
      debts,
      monthlySummaries
    );
    onUpdateScenario(recalculated);
  };

  const handleReset = () => {
    handleSliderChange('priceDeltaPercent', 0);
    handleSliderChange('yieldDeltaPercent', 0);
    handleSliderChange('costDeltaPercent', 0);
    handleSliderChange('debtHaircutPercent', 0);
    handleSliderChange('gracePeriodYears', 0);
    handleSliderChange('termExtensionYears', 0);
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
          <h2 style={{ fontSize: '1.3rem' }}>Simulador de Cenários & Teste de Estresse</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Simulações paramétricas sem alterar os dados oficiais da base • Comparativo Estratégico Gran Bernardo
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {scenarios.map(s => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  background: isSelected ? 'var(--agro-green-600)' : 'var(--bg-surface-2)',
                  color: '#fff',
                  border: isSelected ? '1px solid #34d399' : '1px solid var(--border-subtle)'
                }}
              >
                {s.name.split('(')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Parametric Controls Panel vs Real-time Simulation Output */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Controls Card with Interactive Sliders */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Parâmetros de Estresse & Negociação</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeScenario.name}</span>
            </div>
            <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
              <RotateCcw size={12} />
              <span>Resetar Parâmetros</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Slider 1: Variação de Preço */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: '#fff' }}>Oscilação de Preço dos Grãos (Soja/Milho)</span>
                <strong style={{ color: activeScenario.priceDeltaPercent >= 0 ? '#34d399' : '#f87171' }}>
                  {activeScenario.priceDeltaPercent > 0 ? '+' : ''}{activeScenario.priceDeltaPercent}%
                </strong>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={activeScenario.priceDeltaPercent}
                onChange={(e) => handleSliderChange('priceDeltaPercent', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                <span>-30% (Queda CBOT)</span>
                <span>0% (Preço Base)</span>
                <span>+30% (Alta Cotação)</span>
              </div>
            </div>

            {/* Slider 2: Produtividade / Quebra de Safra */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: '#fff' }}>Quebra / Aumento de Produtividade (sc/ha)</span>
                <strong style={{ color: activeScenario.yieldDeltaPercent >= 0 ? '#34d399' : '#f87171' }}>
                  {activeScenario.yieldDeltaPercent > 0 ? '+' : ''}{activeScenario.yieldDeltaPercent}%
                </strong>
              </div>
              <input
                type="range"
                min="-40"
                max="20"
                step="1"
                value={activeScenario.yieldDeltaPercent}
                onChange={(e) => handleSliderChange('yieldDeltaPercent', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                <span>-40% (Veranico Severo)</span>
                <span>0% (Produtividade Média)</span>
                <span>+20% (Safra Recorde)</span>
              </div>
            </div>

            {/* Slider 3: Custo de Insumos */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: '#fff' }}>Variação de Custos Operacionais / Insumos</span>
                <strong style={{ color: activeScenario.costDeltaPercent <= 0 ? '#34d399' : '#f87171' }}>
                  {activeScenario.costDeltaPercent > 0 ? '+' : ''}{activeScenario.costDeltaPercent}%
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="1"
                value={activeScenario.costDeltaPercent}
                onChange={(e) => handleSliderChange('costDeltaPercent', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                <span>-20% (Otimização Insumos)</span>
                <span>0% (Custo Atual)</span>
                <span>+30% (Inflação Fertilizantes)</span>
              </div>
            </div>

            {/* Divisor Reestruturação */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                Premissas do Plano de Reestruturação Gran Bernardo:
              </span>

              {/* Slider 4: Deságio de Dívida */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fff' }}>Deságio em Dívidas de Fornecedores / Bancos (Haircut)</span>
                  <strong style={{ color: '#fbbf24' }}>{activeScenario.debtHaircutPercent}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={activeScenario.debtHaircutPercent}
                  onChange={(e) => handleSliderChange('debtHaircutPercent', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                />
              </div>

              {/* Slider 5: Carência de Pagamento */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fff' }}>Carência para Amortização Principal (Anos)</span>
                  <strong style={{ color: '#38bdf8' }}>{activeScenario.gracePeriodYears} {activeScenario.gracePeriodYears === 1 ? 'ano' : 'anos'}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={activeScenario.gracePeriodYears}
                  onChange={(e) => handleSliderChange('gracePeriodYears', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              {/* Slider 6: Alongamento de Prazo */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fff' }}>Alongamento de Prazo Adicional de Pagamento</span>
                  <strong style={{ color: '#34d399' }}>+{activeScenario.termExtensionYears} anos</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={activeScenario.termExtensionYears}
                  onChange={(e) => handleSliderChange('termExtensionYears', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                />
              </div>

            </div>

          </div>
        </div>

        {/* Simulation Output KPIs & Diagnosis */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Impacto Financeiro Calculado</h3>
              <span className={`badge ${
                activeScenario.projectedEndingCash >= 0 ? 'badge-green' : 'badge-red'
              }`}>
                {activeScenario.projectedEndingCash >= 0 ? 'Caixa Sustentável' : 'Déficit de Liquidez'}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {activeScenario.description}
            </p>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>Receita Bruta Ajustada</span>
                <div className="metric-number" style={{ fontSize: '1.25rem', color: '#fff', marginTop: '2px' }}>
                  R$ {(activeScenario.projectedRevenue / 1000000).toFixed(2)}M
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>Custos Operacionais Ajustados</span>
                <div className="metric-number" style={{ fontSize: '1.25rem', color: '#fbbf24', marginTop: '2px' }}>
                  R$ {(activeScenario.projectedCosts / 1000000).toFixed(2)}M
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>Margem Operacional Líquida</span>
                <div className="metric-number" style={{ fontSize: '1.25rem', color: activeScenario.projectedMargin >= 0 ? '#34d399' : '#f87171', marginTop: '2px' }}>
                  R$ {(activeScenario.projectedMargin / 1000000).toFixed(2)}M
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block' }}>Serviço da Dívida Anual</span>
                <div className="metric-number" style={{ fontSize: '1.25rem', color: '#f87171', marginTop: '2px' }}>
                  R$ {(activeScenario.debtServiceAnnual / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Ending Cash & Capital Need Callout */}
            <div style={{
              background: activeScenario.projectedEndingCash >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${activeScenario.projectedEndingCash >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block' }}>
                    Saldo Final Projetado de Caixa
                  </span>
                  <div className="metric-number" style={{ fontSize: '1.5rem', color: activeScenario.projectedEndingCash >= 0 ? '#34d399' : '#f87171' }}>
                    R$ {(activeScenario.projectedEndingCash / 1000000).toFixed(2)}M
                  </div>
                </div>

                {activeScenario.capitalNeed > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600, display: 'block' }}>
                      NECESSIDADE DE CAPITAL
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#f87171' }}>
                      R$ {(activeScenario.capitalNeed / 1000000).toFixed(2)}M
                    </strong>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Advisory Commentary */}
          <div style={{
            background: 'var(--bg-surface-3)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
              Parecer Técnico Gran Bernardo:
            </strong>
            {activeScenario.capitalNeed > 0 ? (
              <span>
                Neste cenário estressado, o produtor não tem capacidade de amortizar o serviço original da dívida sem queimar patrimônio. É indispensável aplicar o plano de <strong>Reestruturação Extrajudicial</strong> com carência mínima de 12 meses para evitar insolvência.
              </span>
            ) : (
              <span>
                A estrutura de capital simulada preserva a solvência da fazenda e assegura o pagamento de insumos para a próxima safra com sobra de caixa operacional.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Gráfico de Projeção Financeira & Trajetória de Safra */}
      <div className="bento-card">
        <ProjectionChart 
          scenarios={scenarios}
          activeScenarioId={selectedScenarioId}
          onScenarioSelect={(id) => setSelectedScenarioId(id)}
        />
      </div>

      {/* Side-by-Side Comparison Table of All 5 Scenarios */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Comparativo Lado a Lado dos 5 Cenários Gran Bernardo</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '850px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '2px solid rgba(16, 185, 129, 0.4)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: '#fff' }}>Indicador Comparado</th>
              {scenarios.map(s => (
                <th key={s.id} style={{ padding: '10px 10px', textAlign: 'right', color: s.id === selectedScenarioId ? '#34d399' : '#fff' }}>
                  {s.name.split('(')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>Receita Bruta Total</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '9px 10px', textAlign: 'right', color: '#fff' }}>
                  R$ {(s.projectedRevenue / 1000000).toFixed(2)}M
                </td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>Custos Operacionais Insumos</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '9px 10px', textAlign: 'right', color: '#fbbf24' }}>
                  R$ {(s.projectedCosts / 1000000).toFixed(2)}M
                </td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>Margem Operacional</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '9px 10px', textAlign: 'right', color: s.projectedMargin >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  R$ {(s.projectedMargin / 1000000).toFixed(2)}M
                </td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>Serviço Anual da Dívida</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '9px 10px', textAlign: 'right', color: '#f87171' }}>
                  R$ {(s.debtServiceAnnual / 1000000).toFixed(2)}M
                </td>
              ))}
            </tr>
            <tr style={{ background: 'var(--bg-surface-2)', fontWeight: 700 }}>
              <td style={{ padding: '11px 12px', color: '#38bdf8' }}>Saldo Final Acumulado de Caixa</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '11px 10px', textAlign: 'right', color: s.projectedEndingCash >= 0 ? '#38bdf8' : '#ef4444' }}>
                  R$ {(s.projectedEndingCash / 1000000).toFixed(2)}M
                </td>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '9px 12px', color: '#f87171' }}>Necessidade de Capital Adicional</td>
              {scenarios.map(s => (
                <td key={s.id} style={{ padding: '9px 10px', textAlign: 'right', color: s.capitalNeed > 0 ? '#f87171' : 'var(--text-subtle)' }}>
                  {s.capitalNeed > 0 ? `R$ ${(s.capitalNeed / 1000000).toFixed(2)}M` : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
