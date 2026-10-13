// Planejamento de Safra & Margens Agronômicas - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  TrendingUp, 
  Scale, 
  Layers, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Edit3 
} from 'lucide-react';
import { CropPlanningItem } from '../types';
import { FinancialEngine } from '../services/financialEngine';

interface CropPlanningViewProps {
  crops: CropPlanningItem[];
  onAddCrop: (crop: CropPlanningItem) => void;
  onUpdateCrop: (crop: CropPlanningItem) => void;
  currentSafra: string;
}

export const CropPlanningView: React.FC<CropPlanningViewProps> = ({
  crops,
  onAddCrop,
  onUpdateCrop,
  currentSafra
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropPlanningItem | null>(null);

  // Form State
  const [cropName, setCropName] = useState<'Soja' | 'Milho 2ª Safra' | 'Algodão' | 'Trigo'>('Soja');
  const [cycle, setCycle] = useState<'1ª Safra (Verão)' | '2ª Safra (Safrinha)' | 'Inverno'>('1ª Safra (Verão)');
  const [areaHa, setAreaHa] = useState(1600);
  const [expectedYield, setExpectedYield] = useState(64);
  const [expectedPrice, setExpectedPrice] = useState(136);
  const [costPerHa, setCostPerHa] = useState(4850);
  const [barterBags, setBarterBags] = useState(25000);

  const totalAreaAllCrops = crops.reduce((acc, c) => acc + c.plantedAreaHa, 0);
  const totalProductionAllBags = crops.reduce((acc, c) => acc + c.totalProductionSc, 0);
  const totalGrossRevenue = crops.reduce((acc, c) => acc + c.grossRevenue, 0);
  const totalCost = crops.reduce((acc, c) => acc + c.totalOperatingCost, 0);
  const totalMargin = totalGrossRevenue - totalCost;

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setCropName('Soja');
    setCycle('1ª Safra (Verão)');
    setAreaHa(1000);
    setExpectedYield(60);
    setExpectedPrice(135);
    setCostPerHa(4800);
    setBarterBags(10000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CropPlanningItem) => {
    setEditingCrop(c);
    setCropName(c.crop);
    setCycle(c.cycle);
    setAreaHa(c.plantedAreaHa);
    setExpectedYield(c.expectedYieldScHa);
    setExpectedPrice(c.expectedPricePerSc);
    setCostPerHa(c.operatingCostPerHa);
    setBarterBags(c.barterFinancedSc || 0);
    setIsModalOpen(true);
  };

  const handleSaveCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = FinancialEngine.calculateCropMetrics({
      id: editingCrop ? editingCrop.id : `crop-${Date.now()}`,
      safra: currentSafra,
      crop: cropName,
      cycle,
      plantedAreaHa: Number(areaHa),
      expectedYieldScHa: Number(expectedYield),
      expectedPricePerSc: Number(expectedPrice),
      operatingCostPerHa: Number(costPerHa),
      barterFinancedSc: Number(barterBags)
    });

    if (editingCrop) {
      onUpdateCrop(calculated);
    } else {
      onAddCrop(calculated);
    }
    setIsModalOpen(false);
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
          <h2 style={{ fontSize: '1.3rem' }}>Planejamento de Safra & Margens Agronômicas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Ano Agrícola {currentSafra} • Análise de Produtividade, Break-Even e Resultado por Cultura
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Cadastrar Nova Cultura</span>
        </button>
      </div>

      {/* Global Agronomic KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>ÁREA TOTAL CULTIVADA</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
            {totalAreaAllCrops.toLocaleString('pt-BR')} ha
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1ª Safra + 2ª Safra Safrinha</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>VOLUME TOTAL ESTIMADO</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#fbbf24', marginTop: '4px' }}>
            {totalProductionAllBags.toLocaleString('pt-BR')} sc
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sacas de 60 kg</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>FATURAMENTO BRUTO DA SAFRA</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#10b981', marginTop: '4px' }}>
            R$ {(totalGrossRevenue / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Produção × Preço por Saca</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>MARGEM BRUTA OPERACIONAL</span>
          <div className="metric-number" style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '4px' }}>
            R$ {(totalMargin / 1000000).toFixed(2)}M
          </div>
          <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
            {totalGrossRevenue > 0 ? ((totalMargin / totalGrossRevenue) * 100).toFixed(1) : 0}% de margem
          </span>
        </div>
      </div>

      {/* Cards de Cada Cultura com Detalhamento e Break-even */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {crops.map(crop => {
          const isSoy = crop.crop === 'Soja';
          const safetyMarginSc = crop.expectedYieldScHa - crop.breakEvenScHa;

          return (
            <div key={crop.id} className="glass-panel" style={{ padding: '22px', borderLeft: `4px solid ${isSoy ? '#10b981' : '#f59e0b'}` }}>
              
              {/* Header do Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{crop.crop}</h3>
                    <span className={`badge ${isSoy ? 'badge-green' : 'badge-amber'}`}>
                      {crop.cycle}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Safra {crop.safra} • {crop.plantedAreaHa.toLocaleString('pt-BR')} Hectares
                  </p>
                </div>

                <button onClick={() => handleOpenEdit(crop)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                  <Edit3 size={14} />
                  <span>Editar Premissas</span>
                </button>
              </div>

              {/* Grid de Métricas Principais */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                background: 'var(--bg-surface-2)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>Produtividade</span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{crop.expectedYieldScHa} sc/ha</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>Preço Unitário</span>
                  <strong style={{ fontSize: '1rem', color: '#10b981' }}>R$ {crop.expectedPricePerSc.toFixed(2)}/sc</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>Custo Direto/ha</span>
                  <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>R$ {crop.operatingCostPerHa.toLocaleString('pt-BR')}/ha</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', display: 'block' }}>Produção Total</span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{crop.totalProductionSc.toLocaleString('pt-BR')} sc</strong>
                </div>
              </div>

              {/* Breakdown Financeiro: Receita, Custo Total e Margem */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.07)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>RECEITA BRUTA</span>
                  <div className="metric-number" style={{ fontSize: '1.15rem', color: '#fff', marginTop: '2px' }}>
                    R$ {(crop.grossRevenue / 1000000).toFixed(2)}M
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.07)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>CUSTO TOTAL</span>
                  <div className="metric-number" style={{ fontSize: '1.15rem', color: '#fff', marginTop: '2px' }}>
                    R$ {(crop.totalOperatingCost / 1000000).toFixed(2)}M
                  </div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.07)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>MARGEM BRUTA</span>
                  <div className="metric-number" style={{ fontSize: '1.15rem', color: '#38bdf8', marginTop: '2px' }}>
                    R$ {(crop.grossMargin / 1000000).toFixed(2)}M ({crop.marginPercent.toFixed(0)}%)
                  </div>
                </div>
              </div>

              {/* Ponto de Equilíbrio (Break-Even) Visual */}
              <div style={{ background: 'var(--bg-surface-3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Scale size={15} color="#fbbf24" />
                    <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Ponto de Equilíbrio (Break-Even):</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>
                    {crop.breakEvenScHa.toFixed(1)} sc/ha (Preço Mínimo: R$ {crop.breakEvenPrice.toFixed(2)}/sc)
                  </span>
                </div>

                {/* Barra de Progresso / Margem de Segurança */}
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${Math.min(100, (crop.breakEvenScHa / crop.expectedYieldScHa) * 100)}%`,
                    height: '100%',
                    background: '#fbbf24'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Cobre custos: {crop.breakEvenScHa.toFixed(1)} sc/ha</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    Margem de Segurança: +{safetyMarginSc.toFixed(1)} sc/ha
                  </span>
                </div>
              </div>

              {/* Barter / CPR Travado */}
              {crop.barterFinancedSc && crop.barterFinancedSc > 0 && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Sacas Comprometidas em Barter / CPR Insumos:</span>
                  <strong style={{ color: '#fff' }}>
                    {crop.barterFinancedSc.toLocaleString('pt-BR')} sc ({((crop.barterFinancedSc / crop.totalProductionSc) * 100).toFixed(0)}% da safra)
                  </strong>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* MODAL: ADICIONAR / EDITAR CULTURA */}
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
            maxWidth: '520px',
            padding: '24px',
            background: '#0e1713',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
              {editingCrop ? 'Editar Cultura da Safra' : 'Cadastrar Nova Cultura'}
            </h3>

            <form onSubmit={handleSaveCrop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Cultura
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value as any)}
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
                    <option value="Soja">Soja</option>
                    <option value="Milho 2ª Safra">Milho 2ª Safra</option>
                    <option value="Algodão">Algodão</option>
                    <option value="Trigo">Trigo</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Ciclo / Época
                  </label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as any)}
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
                    <option value="1ª Safra (Verão)">1ª Safra (Verão)</option>
                    <option value="2ª Safra (Safrinha)">2ª Safra (Safrinha)</option>
                    <option value="Inverno">Inverno</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Área Plantada (Hectares)
                  </label>
                  <input
                    type="number"
                    value={areaHa}
                    onChange={(e) => setAreaHa(Number(e.target.value))}
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
                    Produtividade Esperada (sc/ha)
                  </label>
                  <input
                    type="number"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(Number(e.target.value))}
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
                    Preço Esperado (R$/saca)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
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
                    Custo Operacional (R$/ha)
                  </label>
                  <input
                    type="number"
                    value={costPerHa}
                    onChange={(e) => setCostPerHa(Number(e.target.value))}
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

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Sacas Travadas em Barter / CPR (Opcional)
                </label>
                <input
                  type="number"
                  value={barterBags}
                  onChange={(e) => setBarterBags(Number(e.target.value))}
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
                  {editingCrop ? 'Atualizar Cultura' : 'Salvar Cultura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
