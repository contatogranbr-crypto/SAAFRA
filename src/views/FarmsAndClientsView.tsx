// Clientes & Propriedades Rurais - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Layers, 
  Users, 
  Award, 
  CheckCircle2, 
  Edit3 
} from 'lucide-react';
import { EconomicGroup, FarmProperty } from '../types';

interface FarmsAndClientsViewProps {
  groups: EconomicGroup[];
  farms: FarmProperty[];
  onAddFarm: (farm: FarmProperty) => void;
}

export const FarmsAndClientsView: React.FC<FarmsAndClientsViewProps> = ({
  groups,
  farms,
  onAddFarm
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [farmName, setFarmName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [state, setState] = useState('GO');
  const [totalAreaHa, setTotalAreaHa] = useState(1200);
  const [arableAreaHa, setArableAreaHa] = useState(1050);
  const [cropsStr, setCropsStr] = useState('Soja, Milho 2ª Safra');
  const [partnersStr, setPartnersStr] = useState('Carlos Eduardo Bernardo');

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    const newFarm: FarmProperty = {
      id: `farm-${Date.now()}`,
      groupId: 'grp-01',
      name: farmName.trim(),
      municipality: municipality.trim() || 'Rio Verde',
      state,
      totalAreaHa: Number(totalAreaHa),
      arableAreaHa: Number(arableAreaHa),
      crops: cropsStr.split(',').map(s => s.trim()),
      currentSafra: '2024/2025',
      responsiblePartners: partnersStr.split(',').map(s => s.trim())
    };

    onAddFarm(newFarm);
    setIsModalOpen(false);
    setFarmName('');
    setMunicipality('');
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
          <h2 style={{ fontSize: '1.3rem' }}>Clientes, Grupos Econômicos & Fazendas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Cadastro Cadastral, Matrículas, Áreas Produtivas e Sócios Responsáveis
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Cadastrar Nova Fazenda</span>
        </button>
      </div>

      {/* Economic Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Grupos Econômicos Atendidos</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '14px' }}>
          {groups.map(grp => (
            <div key={grp.id} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '1rem', color: '#fff' }}>{grp.name}</strong>
                <span className="badge badge-green">{grp.farmsCount} {grp.farmsCount === 1 ? 'Propriedade' : 'Propriedades'}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                CNPJ/CPF: <strong style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>{grp.cnpjCpf}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#34d399' }}>
                Consultor: <strong>{grp.consultantResponsible}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farms List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Propriedades Rurais Cadastradas</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
          {farms.map(f => (
            <div key={f.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #00f2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{f.name}</h4>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={13} color="#00f2fe" />
                    {f.municipality} - {f.state} • Safra Ativa: {f.currentSafra}
                  </span>
                </div>
              </div>

              {/* Area & Crops info */}
              <div style={{
                background: 'var(--bg-surface-2)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '0.78rem',
                marginBottom: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Área Total</span>
                  <strong style={{ color: '#fff' }}>{f.totalAreaHa.toLocaleString('pt-BR')} ha</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Área Agricultável</span>
                  <strong style={{ color: '#34d399' }}>{f.arableAreaHa.toLocaleString('pt-BR')} ha</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Aproveitamento</span>
                  <strong style={{ color: '#fbbf24' }}>{((f.arableAreaHa / f.totalAreaHa) * 100).toFixed(0)}%</strong>
                </div>
              </div>

              {/* Crops Badges */}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Culturas:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {f.crops.map((c, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Partners */}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Sócios e Responsáveis: <strong style={{ color: '#fff' }}>{f.responsiblePartners.join(', ')}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: NOVA FAZENDA */}
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Cadastrar Nova Propriedade Rural</h3>

            <form onSubmit={handleSaveFarm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Nome da Fazenda
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fazenda Boa Esperança"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Município
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Jataí"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
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
                    UF
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
                    <option value="GO">GO</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="PR">PR</option>
                    <option value="BA">BA</option>
                    <option value="MG">MG</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Área Total (Hectares)
                  </label>
                  <input
                    type="number"
                    value={totalAreaHa}
                    onChange={(e) => setTotalAreaHa(Number(e.target.value))}
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
                    Área Produtiva / Cultivada (ha)
                  </label>
                  <input
                    type="number"
                    value={arableAreaHa}
                    onChange={(e) => setArableAreaHa(Number(e.target.value))}
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
                  Culturas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={cropsStr}
                  onChange={(e) => setCropsStr(e.target.value)}
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
                  Sócios e Responsáveis
                </label>
                <input
                  type="text"
                  value={partnersStr}
                  onChange={(e) => setPartnersStr(e.target.value)}
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
                  Salvar Propriedade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
