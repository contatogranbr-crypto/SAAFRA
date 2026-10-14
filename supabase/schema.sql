-- ==============================================================================
-- SCHEMA GRAN BERNARDO AGRO — SISTEMA AUTÔNOMO DE ANÁLISE FINANCEIRA RURAL (SAAFRA)
-- Compatível com Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela: Grupos Econômicos / Produtores
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    document TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela: Propriedades Rurais (Fazendas)
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

-- 4. Tabela: Usuários e Acessos
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'consultor',
    group_id TEXT REFERENCES public.groups(id) ON DELETE SET NULL,
    farm_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela: Planejamento de Safras e Culturas
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

-- 6. Tabela: Fluxo de Caixa e Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id TEXT PRIMARY KEY,
    group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
    farm_id TEXT REFERENCES public.farms(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'revenue' (inflow) ou 'expense' (outflow)
    date TEXT NOT NULL,
    due_date TEXT,
    payment_date TEXT,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'pending', -- 'pending' ou 'paid'
    partner TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela: Passivos e Endividamento Bancário (Cédulas BB, CPRs, Finame)
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

-- 8. Tabela: Auditoria e Logs de Decisão Autônoma
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    field TEXT,
    original_value TEXT,
    current_value TEXT,
    source TEXT,
    user_name TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- DESATIVAR RLS OU PERMITIR LEITURA/ESCRITA COM A ANON KEY
-- ==============================================================================
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_liabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- DADOS INICIAIS (SEED DATA) — GRUPO BERNARDO & FAZENDAS
-- ==============================================================================
INSERT INTO public.groups (id, name, document) VALUES
('group-01', 'Grupo Agropecuário Bernardo', '12.345.678/0001-90')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.farms (id, group_id, name, area, location, crops, current_safra) VALUES
('farm-01', 'group-01', 'Fazenda Boa Vista', 2800, 'Sorriso - MT', ARRAY['Soja', 'Milho 2ª Safra'], '2024/2025'),
('farm-02', 'group-01', 'Fazenda Santa Maria', 1950, 'Nova Mutum - MT', ARRAY['Soja', 'Algodão'], '2024/2025'),
('farm-03', 'group-01', 'Fazenda Primavera', 1420, 'Lucas do Rio Verde - MT', ARRAY['Milho', 'Girassol'], '2024/2025')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, group_id, farm_id) VALUES
('usr-001', 'Dr. Roberto Bernardo', 'roberto@granbernardo.com.br', 'produtor', 'group-01', 'farm-01'),
('usr-002', 'Juliana Rezende', 'juliana@granbernardo.com.br', 'consultor', 'group-01', NULL),
('usr-003', 'Carlos Eduardo Mendes', 'carlos@bancobrasil.com.br', 'credor', 'group-01', NULL)
ON CONFLICT (id) DO NOTHING;

-- Notificar PostgREST para recarregar o schema cache
NOTIFY pgrst, 'reload schema';
