// Header Component - Gran Bernardo Agro (Clean Executive Design)
import React from 'react';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  Bell,
  Mic, 
  UploadCloud,
  Menu,
  X,
  Sprout,
  LogOut
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
  onLogout?: () => void;
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
  onToggleMobileMenu,
  onLogout
}) => {
  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    admin: { label: 'Administrador', badgeClass: 'badge-purple' },
    consultant: { label: 'Consultor Gran Bernardo', badgeClass: 'badge-cyan' },
    producer: { label: 'Produtor Rural', badgeClass: 'badge-amber' }
  };

  return (
    <header style={{
      width: '100%',
      height: '60px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--color-surface-1)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)'
    }}>
      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary mobile-menu-btn"
          style={{
            padding: '6px',
            minHeight: '34px',
            width: '34px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        >
          {isMobileMenuOpen ? <X size={18} color="#06b6d4" /> : <Menu size={18} color="#06b6d4" />}
        </button>

        {/* Minimal Vector Logo */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(6, 182, 212, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          flexShrink: 0
        }}>
          <Sprout size={17} color="#06b6d4" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.02rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            GRAN BERNARDO
          </span>
          <span style={{ 
            color: '#22d3ee', 
            fontSize: '0.62rem', 
            fontWeight: 700, 
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            AGRO
          </span>
        </div>
      </div>

      {/* Selectors: Farm & Safra (Desktop Only) */}
      <div className="desktop-selectors" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Farm Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 12px',
          height: '34px'
        }}>
          <Building2 size={14} color="#06b6d4" />
          <select
            value={selectedFarmId}
            onChange={(e) => onFarmChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all" style={{ background: '#141b29', color: '#22d3ee', fontWeight: 700 }}>
              🌾 Consolidado (Todas as Fazendas - {farms.reduce((a, b) => a + b.totalAreaHa, 0).toLocaleString('pt-BR')} ha)
            </option>
            <optgroup label="Propriedades Individuais" style={{ background: '#141b29', color: '#94a3b8' }}>
              {farms.map(f => (
                <option key={f.id} value={f.id} style={{ background: '#141b29', color: '#fff' }}>
                  {f.name} ({f.totalAreaHa.toLocaleString('pt-BR')} ha - {f.municipality}/{f.state})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Safra Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 12px',
          height: '34px'
        }}>
          <Calendar size={14} color="#94a3b8" />
          <select
            value={currentSafra}
            onChange={(e) => onSafraChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="2024/2025" style={{ background: '#141b29', color: '#fff' }}>Safra 2024/2025</option>
            <option value="2025/2026" style={{ background: '#141b29', color: '#fff' }}>Safra 2025/2026</option>
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Quick Voice / AI button */}
        <button
          onClick={onOpenAiChat}
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.78rem', height: '34px' }}
          title="Falar ou digitar para o Consultor IA"
        >
          <Mic size={14} color="#06b6d4" />
          <span>Falar com IA</span>
        </button>

        {/* Desktop Controls (Import, Role) */}
        <div className="desktop-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenImport}
            className="btn btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.78rem', height: '34px' }}
            title="Importar Planilha Excel ou Balanço"
          >
            <UploadCloud size={14} color="#94a3b8" />
            <span>Importar</span>
          </button>

          {/* Role Selector Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            height: '34px'
          }}>
            <UserCheck size={14} color="var(--color-text-subtle)" />
            <select
              value={currentUser.role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="consultant" style={{ background: '#141b29', color: '#fff' }}>Dr. Roberto (Consultor)</option>
              <option value="producer" style={{ background: '#141b29', color: '#fff' }}>Produtor Rural</option>
              <option value="admin" style={{ background: '#141b29', color: '#fff' }}>Administrador</option>
            </select>
          </div>

          {/* Sair / Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', height: '34px', color: 'var(--color-text-muted)' }}
              title="Encerrar Sessão / Trocar de Conta"
            >
              <LogOut size={13} />
              <span style={{ fontSize: '0.74rem' }}>Sair</span>
            </button>
          )}
        </div>

        {/* Minimal Risk Alerts Bell */}
        {alertCount > 0 ? (
          <div 
            title={`${alertCount} alertas críticos de caixa e passivo`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              cursor: 'pointer'
            }}
          >
            <Bell size={15} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ef4444'
            }} />
          </div>
        ) : (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-subtle)'
            }}
          >
            <Bell size={15} />
          </div>
        )}
      </div>
    </header>
  );
};
