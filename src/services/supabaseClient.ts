// Cliente Supabase e Sincronização em Nuvem — Gran Bernardo Agro
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CashFlowEntry, FarmProperty, CropPlanningItem, DebtLiability, AuditLog } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://wjbbprsbuhgfwqqldbnx.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_29YNbNgkChnDZF2ylkVfRA_BMeX9ZCc';

function getInitialUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gb_supabase_url');
    if (saved && !saved.includes('192.168.0.126') && !saved.includes('tcgypvyuqaqsdtcvoaum')) {
      return saved.trim();
    }
  }
  return (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

function getInitialKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gb_supabase_key');
    if (saved && !saved.includes('xaOHK2GK5R36cemKfD') && !saved.includes('QU4eO6i1OjJHsMWzLC2Bi0sAsf6lNlWVJZ8PMAxYFVg')) {
      return saved.trim();
    }
  }
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

let activeUrl = getInitialUrl();
let activeKey = getInitialKey();

export let supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface SupabaseConnectionStatus {
  success: boolean;
  message: string;
  url: string;
  latencyMs?: number;
  tablesReady: boolean;
  missingTables?: string[];
  hint?: string;
}

export class SupabaseService {
  private static isConnected: boolean | null = null;
  private static lastStatus: SupabaseConnectionStatus | null = null;

  static getActiveUrl(): string {
    return activeUrl;
  }

  static getActiveKey(): string {
    return activeKey;
  }

  static saveConfig(url: string, key: string): void {
    activeUrl = url.trim();
    activeKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('gb_supabase_url', activeUrl);
      localStorage.setItem('gb_supabase_key', activeKey);
    }
    supabase = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  static resetConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gb_supabase_url');
      localStorage.removeItem('gb_supabase_key');
    }
    activeUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    activeKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    supabase = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  /**
   * Testa a conectividade com o banco de dados Supabase e verifica o schema
   */
  static async testConnection(): Promise<SupabaseConnectionStatus> {
    const startTime = performance.now();
    try {
      // 1. Testa a query na tabela de fazendas ou fluxo de caixa
      const { data, error } = await supabase
        .from('farms')
        .select('id, name')
        .limit(1);

      const latencyMs = Math.round(performance.now() - startTime);

      if (error) {
        // PGRST205 significa que o PostgREST conectou com sucesso, validou a chave, mas a tabela ainda não foi criada no banco
        if (error.code === 'PGRST205') {
          this.isConnected = true;
          const status: SupabaseConnectionStatus = {
            success: true,
            tablesReady: false,
            url: activeUrl,
            latencyMs,
            message: `Servidor Supabase conectado com sucesso (${activeUrl}).`,
            hint: 'As tabelas ainda não foram criadas no banco de dados. Use o script SQL abaixo para inicializar as tabelas.'
          };
          this.lastStatus = status;
          return status;
        }

        // PGRST116 ou PGRST301
        if (error.code === 'PGRST116' || error.code === 'PGRST301') {
          this.isConnected = true;
          const status: SupabaseConnectionStatus = {
            success: true,
            tablesReady: true,
            url: activeUrl,
            latencyMs,
            message: `Conectado ao Supabase (${activeUrl}) — ${latencyMs}ms`
          };
          this.lastStatus = status;
          return status;
        }

        // Outros erros (ex: chave inválida ou 401)
        this.isConnected = false;
        const status: SupabaseConnectionStatus = {
          success: false,
          tablesReady: false,
          url: activeUrl,
          latencyMs,
          message: `Erro de autenticação ou resposta do Supabase: ${error.message} (Código ${error.code})`
        };
        this.lastStatus = status;
        return status;
      }

      // Conexão e tabela respondendo com sucesso
      this.isConnected = true;
      const status: SupabaseConnectionStatus = {
        success: true,
        tablesReady: true,
        url: activeUrl,
        latencyMs,
        message: `Conectado com sucesso ao Supabase (${activeUrl}) — ${latencyMs}ms`
      };
      this.lastStatus = status;
      return status;
    } catch (err: any) {
      this.isConnected = false;
      const status: SupabaseConnectionStatus = {
        success: false,
        tablesReady: false,
        url: activeUrl,
        message: err.message || 'Não foi possível alcançar o servidor Supabase. Verifique o IP e a porta.'
      };
      this.lastStatus = status;
      return status;
    }
  }

  static getIsConnected(): boolean | null {
    return this.isConnected;
  }

  static getLastStatus(): SupabaseConnectionStatus | null {
    return this.lastStatus;
  }

  static getProjectUrl(): string {
    return activeUrl;
  }

  /**
   * Sincroniza um lançamento de fluxo de caixa para a tabela financial_entries do Supabase
   */
  static async syncCashFlowEntry(entry: CashFlowEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('financial_entries')
        .upsert({
          id: entry.id,
          type: entry.type === 'inflow' ? 'revenue' : 'expense',
          date: entry.date,
          due_date: entry.date,
          payment_date: entry.status === 'realizado' ? entry.date : null,
          description: entry.description,
          amount: entry.expectedAmount,
          category: entry.category,
          farm_id: entry.farmId || 'farm-01',
          status: entry.status === 'realizado' ? 'paid' : 'pending',
          partner: entry.supplierOrClient,
          observations: entry.notes || `Safra: ${entry.safra} | Fonte: ${entry.source}`,
          group_id: 'group-01'
        });

      if (error) {
        if (error.code !== 'PGRST205') {
          console.warn('Aviso ao sincronizar lançamento no Supabase:', error.message);
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Falha de rede ao sincronizar com Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Carrega fazendas do Supabase
   */
  static async fetchFarms(): Promise<FarmProperty[] | null> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*');

      if (error || !data || data.length === 0) {
        return null;
      }

      return data.map((f: any) => ({
        id: f.id,
        groupId: f.group_id || 'group-01',
        name: f.name,
        municipality: f.location?.split('-')?.[0]?.trim() || 'Sorriso',
        state: f.location?.split('-')?.[1]?.trim() || 'MT',
        totalAreaHa: Number(f.area) || 2800,
        arableAreaHa: Math.round((Number(f.area) || 2800) * 0.75),
        crops: f.crops || ['Soja', 'Milho 2ª Safra'],
        currentSafra: f.current_safra || '2024/2025',
        responsiblePartners: ['Dr. Roberto Bernardo']
      }));
    } catch {
      return null;
    }
  }
}
