// Sidebar Component - Gran Bernardo Agro (Clean Categorized Navigation)
import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Sprout, 
  Landmark, 
  Bot, 
  FileSpreadsheet, 
  AlertTriangle, 
  Sliders, 
  CheckSquare, 
  FileText, 
  Building,
  Sparkles,
  X,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { FarmProperty, UserProfile, UserRole } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'cashflow'
  | 'crops'
  | 'debts'
  | 'ai_advisor'
  | 'agent_trainer'
  | 'import_center'
  | 'risks'
  | 'scenarios'
  | 'restructuring'
  | 'reports'
  | 'farms';

interface NavSection {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount: number;
  pendingActionsCount: number;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  // Optional selectors for mobile drawer
  farms?: FarmProperty[];
  selectedFarmId?: string;
  onFarmChange?: (farmId: string) => void;
  currentSafra?: string;
  onSafraChange?: (safra: string) => void;
  currentUser?: UserProfile;
  onRoleChange?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  alertCount,
  pendingActionsCount,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  farms,
  selectedFarmId,
  onFarmChange,
  currentSafra,
  onSafraChange,
  currentUser,
  onRoleChange
}) => {
  const navSections: NavSection[] = [
    {
      title: 'VISÃO OPERACIONAL',
      items: [
        { id: 'dashboard', label: 'Visão Executiva', icon: <LayoutDashboard size={16} /> },
        { id: 'cashflow', label: 'Fluxo de Caixa', icon: <TrendingUp size={16} /> },
        { id: 'crops', label: 'Planejamento Safra', icon: <Sprout size={16} /> },
        { id: 'debts', label: 'Endividamento & Passivos', icon: <Landmark size={16} /> }
      ]
    },
    {
      title: 'ESTRATÉGIA & RISCO',
      items: [
        { 
          id: 'risks', 
          label: 'Riscos & Gargalos', 
          icon: <AlertTriangle size={16} />, 
          badge: alertCount > 0 ? alertCount : undefined, 
          badgeColor: 'badge-red' 
        },
        { id: 'scenarios', label: 'Simulador de Cenários', icon: <Sliders size={16} /> },
        { 
          id: 'restructuring', 
          label: 'Plano de Reestruturação', 
          icon: <CheckSquare size={16} />, 
          badge: pendingActionsCount > 0 ? pendingActionsCount : undefined, 
          badgeColor: 'badge-amber' 
        }
      ]
    },
    {
      title: 'INTELIGÊNCIA & GESTÃO',
      items: [
        { id: 'ai_advisor', label: 'Consultor IA & Voz', icon: <Bot size={16} /> },
        { id: 'import_center', label: 'Central de Importações', icon: <FileSpreadsheet size={16} /> },
        { id: 'reports', label: 'Relatórios & Auditoria', icon: <FileText size={16} /> },
        { id: 'farms', label: 'Clientes & Fazendas', icon: <Building size={16} /> },
        { id: 'agent_trainer', label: 'Configuração da IA', icon: <Sparkles size={16} /> }
      ]
    }
  ];

  const handleItemClick = (id: NavTab) => {
    onTabChange(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', padding: '16px 8px 16px 12px' }}>
      {/* Drawer Header (Mobile Mode) */}
      {isMobileDrawer && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 4px 12px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>GRAN BERNARDO</span>
            <span style={{ fontSize: '0.65rem', color: '#06b6d4', fontWeight: 700 }}>AGRO</span>
          </div>
          <button
            onClick={onCloseMobileDrawer}
            className="btn btn-secondary"
            style={{ padding: '6px', minHeight: '32px', width: '32px', borderRadius: '50%' }}
            aria-label="Fechar menu"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Mobile Selectors (Only shown in Mobile Drawer) */}
      {isMobileDrawer && farms && onFarmChange && currentSafra && onSafraChange && currentUser && onRoleChange && (
        <div style={{
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: '1px solid var(--color-border)',
          marginBottom: '6px'
        }}>
          {/* Farm selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={15} color="#06b6d4" />
            <select
              value={selectedFarmId}
              onChange={(e) => onFarmChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: '#141b29', color: '#22d3ee', fontWeight: 700 }}>
                🌾 Consolidado (Todas as Fazendas)
              </option>
              {farms.map(f => (
                <option key={f.id} value={f.id} style={{ background: '#141b29', color: '#fff' }}>
                  {f.name} ({f.totalAreaHa} ha)
                </option>
              ))}
            </select>
          </div>

          {/* Safra selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
            <Calendar size={15} color="#94a3b8" />
            <select
              value={currentSafra}
              onChange={(e) => onSafraChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <option value="2024/2025" style={{ background: '#141b29', color: '#fff' }}>Safra 2024/2025</option>
              <option value="2025/2026" style={{ background: '#141b29', color: '#fff' }}>Safra 2025/2026</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
        {navSections.map(section => (
          <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              color: 'var(--color-text-subtle)',
              letterSpacing: '0.06em',
              padding: '0 12px 6px',
              textTransform: 'uppercase'
            }}>
              {section.title}
            </span>

            {section.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    color: isActive ? '#f8fafc' : 'var(--color-text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    borderLeft: isActive ? '2px solid #06b6d4' : '2px solid transparent',
                    minHeight: '34px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isActive ? '#06b6d4' : 'var(--color-text-subtle)', display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`badge ${item.badgeColor || 'badge-cyan'}`} style={{ padding: '1px 6px', fontSize: '0.62rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Discreet Footer Note */}
      <div style={{
        padding: '10px 12px',
        fontSize: '0.7rem',
        color: 'var(--color-text-subtle)',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
        lineHeight: 1.3
      }}>
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>Gran Bernardo Agro</span>
        <span>Reestruturação & Finanças</span>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    return content;
  }

  return (
    <aside className="desktop-sidebar" style={{
      width: '240px',
      minWidth: '240px',
      borderRight: '1px solid var(--color-border)',
      background: 'var(--color-surface-1)',
      minHeight: 'calc(100vh - 60px)',
      userSelect: 'none'
    }}>
      {content}
    </aside>
  );
};
