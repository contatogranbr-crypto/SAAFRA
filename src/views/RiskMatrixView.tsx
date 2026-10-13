// Matriz de Riscos & Oportunidades - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Layers 
} from 'lucide-react';
import { RiskAlert } from '../types';

interface RiskMatrixViewProps {
  risks: RiskAlert[];
  onConvertToRestructuringAction: (risk: RiskAlert) => void;
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({
  risks,
  onConvertToRestructuringAction
}) => {
  const [filterType, setFilterType] = useState<'all' | 'risk' | 'opportunity'>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = risks.filter(r => {
    const matchType = filterType === 'all' || r.type === filterType;
    const matchSev = filterSeverity === 'all' || r.severity === filterSeverity;
    return matchType && matchSev;
  });

  const criticalCount = risks.filter(r => r.severity === 'critical' || r.severity === 'high').length;
  const oppCount = risks.filter(r => r.type === 'opportunity').length;

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
          <h2 style={{ fontSize: '1.3rem' }}>Matriz de Riscos & Oportunidades Estratégicas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Diagnóstico Autônomo com Metodologia Gran Bernardo de Mitigação e Reestruturação
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setFilterType('all'); setFilterSeverity('all'); }}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filterType === 'all' ? 'var(--agro-green-600)' : 'var(--bg-surface-2)',
              color: '#fff'
            }}
          >
            Todos ({risks.length})
          </button>
          <button
            onClick={() => { setFilterType('risk'); setFilterSeverity('all'); }}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filterType === 'risk' ? 'var(--agro-red-500)' : 'var(--bg-surface-2)',
              color: '#fff'
            }}
          >
            Apenas Riscos ({criticalCount})
          </button>
          <button
            onClick={() => { setFilterType('opportunity'); setFilterSeverity('all'); }}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: filterType === 'opportunity' ? 'var(--agro-gold-500)' : 'var(--bg-surface-2)',
              color: '#fff'
            }}
          >
            Oportunidades ({oppCount})
          </button>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '16px' }}>
        {filtered.map(item => {
          const isRisk = item.type === 'risk';
          const isCritical = item.severity === 'critical';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${isCritical ? '#ef4444' : isRisk ? '#f59e0b' : '#10b981'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                {/* Header do Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isRisk ? (
                      <ShieldAlert size={18} color={isCritical ? '#ef4444' : '#f59e0b'} />
                    ) : (
                      <Sparkles size={18} color="#10b981" />
                    )}
                    <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>{item.title}</h3>
                  </div>

                  <span className={`badge ${
                    isCritical ? 'badge-red' :
                    item.severity === 'high' ? 'badge-amber' :
                    item.severity === 'medium' ? 'badge-amber' : 'badge-green'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                {/* Problema / Descrição */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {item.problem}
                </p>

                {/* Dados Utilizados & Impacto */}
                <div style={{
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '8px',
                  fontSize: '0.75rem',
                  marginBottom: '12px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Dados Base do Cálculo:</span>
                    <span style={{ color: '#fff' }}>{item.dataUsed}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Impacto Financeiro:</span>
                    <strong style={{ fontSize: '0.9rem', color: isRisk ? '#f87171' : '#34d399' }}>
                      {isRisk ? '-' : '+'} R$ {item.impactR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Recomendação da Consultoria Gran Bernardo */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderLeft: '3px solid #10b981',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  marginBottom: '8px'
                }}>
                  <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>
                    Recomendação do Consultor Gran Bernardo:
                  </strong>
                  {item.recommendation}
                </div>

                {/* Premissas */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                  Premissa: {item.assumptions}
                </div>
              </div>

              {/* Botão para transformar em ação de reestruturação */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => onConvertToRestructuringAction(item)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                >
                  <span>Incluir no Plano de Reestruturação</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
