// Header Component - Gran Bernardo Agro (UI/UX Pro Max Responsive)
import React from 'react';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  ShieldAlert, 
  Mic, 
  FileSpreadsheet,
  Menu,
  X,
  Sprout
} from 'lucide-react';
import { FarmProperty, UserProfile, UserRole } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  farms: FarmProperty[];
  selectedFarmId: string;
  onFarmChange: (farmId: string) => void;
  currentSafra: string;
  onSafraChange: (safra: string) => void;
  alertCount: number;
  onOpenAiChat: () => void;
  onOpenImport: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  farms,
  selectedFarmId,
  onFarmChange,
  currentSafra,
  onSafraChange,
  alertCount,
  onOpenAiChat,
  onOpenImport,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    admin: { label: 'Administrador', badgeClass: 'badge-purple' },
    consultant: { label: 'Consultor Gran Bernardo', badgeClass: 'badge-green' },
    producer: { label: 'Produtor Rural', badgeClass: 'badge-amber' }
  };

  return (
    <header style={{
      margin: '12px 16px 14px',
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      position: 'sticky',
      top: '12px',
      zIndex: 50,
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)'
    }}>
      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary mobile-menu-btn"
          style={{
            padding: '8px',
            minHeight: '36px',
            width: '36px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        >
          {isMobileMenuOpen ? <X size={18} color="#00f2fe" /> : <Menu size={18} color="#00f2fe" />}
        </button>

        {/* Vector Logo Badge */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          background: 'rgba(0, 242, 254, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          flexShrink: 0
        }}>
          <Sprout size={18} color="#00f2fe" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
              GRAN BERNARDO
            </span>
            <span style={{ 
              color: '#00f2fe', 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              background: 'rgba(0, 242, 254, 0.1)',
              padding: '2px 5px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              letterSpacing: '0.05em'
            }}>
              AGRO
            </span>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
            Consultoria Financeira & Reestruturação
          </p>
        </div>
      </div>

      {/* Selectors: Farm & Safra (Desktop Only) */}
      <div className="desktop-selectors" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Farm Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px'
        }}>
          <Building2 size={15} color="#00f2fe" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Propriedade</span>
            <select
              value={selectedFarmId}
              onChange={(e) => onFarmChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {farms.map(f => (
                <option key={f.id} value={f.id} style={{ background: '#161922', color: '#fff' }}>
                  {f.name} ({f.totalAreaHa} ha)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Safra Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px'
        }}>
          <Calendar size={15} color="#3b82f6" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Ano Safra</span>
            <select
              value={currentSafra}
              onChange={(e) => onSafraChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="2024/2025" style={{ background: '#161922', color: '#fff' }}>Safra 2024/2025 (Ativa)</option>
              <option value="2025/2026" style={{ background: '#161922', color: '#fff' }}>Safra 2025/2026 (Projetada)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Quick Voice / AI button */}
        <button
          onClick={onOpenAiChat}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Falar ou digitar para o Assistente IA"
        >
          <Mic size={14} color="#00f2fe" />
          <span>Falar com IA</span>
        </button>

        {/* Desktop Controls (Import, Role) */}
        <div className="desktop-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenImport}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Enviar Planilha Excel ou PDF"
          >
            <FileSpreadsheet size={14} color="#00f2fe" />
            <span>Importar</span>
          </button>

          {/* Role Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px'
          }}>
            <UserCheck size={14} color="var(--color-text-muted)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-subtle)' }}>Perfil</span>
              <select
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="consultant" style={{ background: '#0a110e', color: '#fff' }}>Consultor Gran Bernardo</option>
                <option value="producer" style={{ background: '#0a110e', color: '#fff' }}>Produtor Rural</option>
                <option value="admin" style={{ background: '#0a110e', color: '#fff' }}>Administrador</option>
              </select>
            </div>
            <span className={`badge ${roleLabels[currentUser.role].badgeClass}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
              {currentUser.role === 'consultant' ? 'Consultor' : currentUser.role === 'producer' ? 'Produtor' : 'Admin'}
            </span>
          </div>
        </div>

        {/* Risk Alerts Counter */}
        {alertCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.76rem',
            fontWeight: 700
          }}>
            <ShieldAlert size={15} />
            <span>{alertCount}</span>
          </div>
        )}
      </div>
    </header>
  );
};
