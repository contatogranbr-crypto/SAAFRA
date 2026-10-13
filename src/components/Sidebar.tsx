// Sidebar Component - Gran Bernardo Agro (UI/UX Pro Max Responsive)
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
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Visão Executiva', icon: <LayoutDashboard size={18} /> },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: <TrendingUp size={18} /> },
    { id: 'crops', label: 'Planejamento Safra', icon: <Sprout size={18} /> },
    { id: 'debts', label: 'Endividamento & Passivos', icon: <Landmark size={18} /> },
    { 
      id: 'ai_advisor', 
      label: 'Assistente IA & Voz', 
      icon: <Bot size={18} />, 
      badge: 'IA', 
      badgeColor: 'badge-purple' 
    },
    { 
      id: 'agent_trainer', 
      label: 'Treinar Agente de IA', 
      icon: <Sparkles size={18} color="#00f2fe" />, 
      badge: 'PRO', 
      badgeColor: 'badge-ai' 
    },
    { id: 'import_center', label: 'Central de Importações', icon: <FileSpreadsheet size={18} /> },
    { 
      id: 'risks', 
      label: 'Riscos & Oportunidades', 
      icon: <AlertTriangle size={18} />, 
      badge: alertCount > 0 ? alertCount : undefined, 
      badgeColor: 'badge-red' 
    },
    { id: 'scenarios', label: 'Simulador de Cenários', icon: <Sliders size={18} /> },
    { 
      id: 'restructuring', 
      label: 'Plano de Reestruturação', 
      icon: <CheckSquare size={18} />, 
      badge: pendingActionsCount > 0 ? pendingActionsCount : undefined, 
      badgeColor: 'badge-amber' 
    },
    { id: 'reports', label: 'Relatórios & Auditoria', icon: <FileText size={18} /> },
    { id: 'farms', label: 'Clientes & Fazendas', icon: <Building size={18} /> }
  ];

  const handleItemClick = (id: NavTab) => {
    onTabChange(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
      {/* Drawer Header (Mobile Mode) */}
      {isMobileDrawer && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 4px 14px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>MENU</span>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
              GRAN BERNARDO
            </span>
          </div>
          <button
            onClick={onCloseMobileDrawer}
            className="btn btn-secondary"
            style={{ padding: '6px', minHeight: '34px', width: '34px', borderRadius: '50%' }}
            aria-label="Fechar menu"
          >
            <X size={16} />
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
          gap: '10px',
          border: '1px solid var(--color-border)',
          marginBottom: '6px'
        }}>
          {/* Farm selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#10b981" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Propriedade</span>
              <select
                value={selectedFarmId}
                onChange={(e) => onFarmChange(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id} style={{ background: '#0a110e', color: '#fff' }}>
                    {f.name} ({f.totalAreaHa} ha)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Safra selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
            <Calendar size={16} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Ano Safra</span>
              <select
                value={currentSafra}
                onChange={(e) => onSafraChange(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="2024/2025" style={{ background: '#0a110e', color: '#fff' }}>Safra 2024/2025 (Ativa)</option>
                <option value="2025/2026" style={{ background: '#0a110e', color: '#fff' }}>Safra 2025/2026 (Projetada)</option>
              </select>
            </div>
          </div>

          {/* User role selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
            <UserCheck size={16} color="var(--color-text-muted)" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-subtle)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Perfil de Acesso</span>
              <select
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="consultant" style={{ background: '#0a110e', color: '#fff' }}>Consultor Gran Bernardo</option>
                <option value="producer" style={{ background: '#0a110e', color: '#fff' }}>Produtor Rural</option>
                <option value="admin" style={{ background: '#0a110e', color: '#fff' }}>Administrador</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Card */}
      <div className={isMobileDrawer ? '' : 'glass-panel'} style={{
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
      }}>
        {!isMobileDrawer && (
          <div style={{
            padding: '8px 12px 10px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--color-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Navegação Principal</span>
            <Sparkles size={12} color="#00f2fe" />
          </div>
        )}

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive 
                  ? 'rgba(0, 242, 254, 0.08)' 
                  : 'transparent',
                color: isActive ? '#00f2fe' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid #00f2fe' : '3px solid transparent',
                minHeight: '38px'
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
                <span style={{ color: isActive ? '#00f2fe' : 'var(--color-text-subtle)', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`badge ${item.badgeColor || 'badge-cyan'}`} style={{ padding: '2px 7px', fontSize: '0.62rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Advisory Support Mini Card */}
      <div style={{
        padding: '12px 14px',
        fontSize: '0.74rem',
        borderLeft: '2px solid #00f2fe',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-sm)',
        marginTop: 'auto'
      }}>
        <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
          <span>Metodologia Gran Bernardo</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Consultoria & Reestruturação Rural
        </p>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    return content;
  }

  return (
    <aside className="desktop-sidebar" style={{
      width: '260px',
      minWidth: '260px',
      padding: '0 0 16px 16px',
      userSelect: 'none'
    }}>
      {content}
    </aside>
  );
};
