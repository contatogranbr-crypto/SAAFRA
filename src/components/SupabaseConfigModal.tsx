import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Copy, Check, Server, Key, ExternalLink, X } from 'lucide-react';
import { SupabaseService, SupabaseConnectionStatus, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../services/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

const SQL_SCHEMA = `-- SCHEMA GRAN BERNARDO AGRO — SISTEMA AUTÔNOMO DE ANÁLISE FINANCEIRA RURAL (SAAFRA)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Grupos Econômicos
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    document TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Propriedades Rurais (Fazendas)
CREATE TABLE IF NOT EXISTS public.farms (
    id TEXT PRIMARY KEY,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area NUMERIC DEFAULT 0,
    location TEXT,
    crops TEXT[],
    current_safra TEXT DEFAULT '2024/2025',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Usuários e Acessos
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'consultor',
    group_id TEXT REFERENCES public.groups(id) ON DELETE SET NULL,
    farm_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Planejamento de Safras
CREATE TABLE IF NOT EXISTS public.harvests (
    id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES public.farms(id) ON DELETE CASCADE,
    safra TEXT NOT NULL,
    culture TEXT NOT NULL,
    area_ha NUMERIC DEFAULT 0,
    expected_bags_per_ha NUMERIC DEFAULT 0,
    expected_price_per_bag NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'planejado',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Fluxo de Caixa / Entradas Financeiras
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id TEXT PRIMARY KEY,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
    farm_id TEXT REFERENCES public.farms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT,
    payment_date TEXT,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'pending',
    partner TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Passivos Bancários e Cédulas
CREATE TABLE IF NOT EXISTS public.debt_liabilities (
    id TEXT PRIMARY KEY,
    farm_id TEXT REFERENCES public.farms(id) ON DELETE CASCADE,
    creditor TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    principal NUMERIC NOT NULL,
    current_balance NUMERIC NOT NULL,
    annual_rate NUMERIC,
    indexer TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'normal',
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Desativar RLS para acesso anon
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_liabilities DISABLE ROW LEVEL SECURITY;

-- 8. Dados Iniciais
INSERT INTO public.groups (id, name, document) VALUES
('group-01', 'Grupo Agropecuário Bernardo', '12.345.678/0001-90')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.farms (id, group_id, name, area, location, crops, current_safra) VALUES
('farm-01', 'group-01', 'Fazenda Boa Vista', 2800, 'Sorriso - MT', ARRAY['Soja', 'Milho 2ª Safra'], '2024/2025'),
('farm-02', 'group-01', 'Fazenda Santa Maria', 1950, 'Nova Mutum - MT', ARRAY['Soja', 'Algodão'], '2024/2025'),
('farm-03', 'group-01', 'Fazenda Primavera', 1420, 'Lucas do Rio Verde - MT', ARRAY['Milho', 'Girassol'], '2024/2025')
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';`;

export function SupabaseConfigModal({ isOpen, onClose, onConnectionChange }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState(SupabaseService.getActiveUrl());
  const [key, setKey] = useState(SupabaseService.getActiveKey());
  const [status, setStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(SupabaseService.getActiveUrl());
      setKey(SupabaseService.getActiveKey());
      runTest();
    }
  }, [isOpen]);

  const runTest = async () => {
    setIsTesting(true);
    const res = await SupabaseService.testConnection();
    setStatus(res);
    setIsTesting(false);
    if (onConnectionChange) {
      onConnectionChange(res.success);
    }
  };

  const handleSave = async () => {
    SupabaseService.saveConfig(url, key);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    await runTest();
  };

  const handleReset = async () => {
    SupabaseService.resetConfig();
    setUrl(DEFAULT_SUPABASE_URL);
    setKey(DEFAULT_SUPABASE_ANON_KEY);
    await runTest();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Database size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Conexão Supabase
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Servidor de banco de dados e sincronização em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Box */}
          <div style={{
            background: status?.success 
              ? (status.tablesReady ? 'rgba(16, 185, 129, 0.08)' : 'rgba(234, 179, 8, 0.08)')
              : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${status?.success 
              ? (status.tablesReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)')
              : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            {status?.success ? (
              status.tablesReady ? (
                <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle size={22} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
              )
            ) : (
              <XCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: status?.success 
                    ? (status.tablesReady ? '#10b981' : '#eab308')
                    : '#ef4444' 
                }}>
                  {status?.success 
                    ? (status.tablesReady ? 'Conectado e Sincronizado' : 'Conectado ao Servidor (Tabelas Pendentes)')
                    : 'Desconectado'}
                </span>
                {status?.latencyMs && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    {status.latencyMs} ms
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                {status?.message || 'Avaliando conexão...'}
              </p>
              {status?.hint && (
                <p style={{ fontSize: '0.78rem', color: '#fbbf24', margin: '6px 0 0 0', fontWeight: 500 }}>
                  💡 {status.hint}
                </p>
              )}
            </div>

            <button
              onClick={runTest}
              disabled={isTesting}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', height: '32px' }}
              title="Testar novamente"
            >
              <RefreshCw size={14} className={isTesting ? 'spin' : ''} />
              <span>{isTesting ? 'Testando...' : 'Re-testar'}</span>
            </button>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
                <Server size={14} color="#06b6d4" />
                URL do Supabase (Cloud ou Host Local)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://wjbbprsbuhgfwqqldbnx.supabase.co"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
                <Key size={14} color="#06b6d4" />
                Chave Anon / Publishable Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sb_publishable_..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              Restaurar Padrão
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {saveSuccess && (
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Salvo com sucesso!
                </span>
              )}
              <button
                onClick={handleSave}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 18px', background: '#10b981', borderColor: '#10b981' }}
              >
                Salvar Configurações
              </button>
            </div>
          </div>

          {/* SQL Migration Accordion */}
          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-2)',
            overflow: 'hidden'
          }}>
            <div 
              onClick={() => setShowSql(!showSql)}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={15} color="#06b6d4" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  Script SQL de Inicialização das Tabelas
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
                {showSql ? 'Ocultar' : 'Visualizar SQL'}
              </span>
            </div>

            {showSql && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                    Execute este script no <strong>SQL Editor</strong> do Supabase para criar as tabelas do Gran Bernardo Agro.
                  </p>
                  {url.includes('.supabase.co') && (
                    <a
                      href={`https://supabase.com/dashboard/project/${url.replace('https://', '').split('.')[0]}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '4px 10px', color: '#06b6d4', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <ExternalLink size={12} />
                      <span>Abrir SQL Editor no Supabase ↗</span>
                    </a>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: '#090d16',
                    padding: '14px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {SQL_SCHEMA}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="btn btn-secondary"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      background: 'rgba(20, 27, 41, 0.9)'
                    }}
                  >
                    {isCopied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--color-surface-2)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '7px 16px' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
