// Cliente Supabase e Sincronização em Nuvem — Gran Bernardo Agro
import { createClient } from '@supabase/supabase-js';
import { CashFlowEntry, FarmProperty, CropPlanningItem, DebtLiability, AuditLog } from '../types';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://tcgypvyuqaqsdtcvoaum.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZ3lwdnl1cWFxc2R0Y3ZvYXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODI3NzksImV4cCI6MjA4OTI1ODc3OX0.QU4eO6i1OjJHsMWzLC2Bi0sAsf6lNlWVJZ8PMAxYFVg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export class SupabaseService {
  private static isConnected: boolean | null = null;

  /**
   * Testa a conectividade com o banco de dados Supabase
   */
  static async testConnection(): Promise<{ success: boolean; message: string; project?: string }> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, name')
        .limit(1);

      if (error) {
        // Tenta checar a tabela de usuários caso farms esteja vazia ou com RLS
        const { error: usersError } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (usersError && usersError.code !== 'PGRST116') {
          this.isConnected = false;
          return {
            success: false,
            message: `Falha na conexão: ${error.message || usersError.message}`
          };
        }
      }

      this.isConnected = true;
      return {
        success: true,
        message: 'Conectado com sucesso ao Supabase (appruralteste)',
        project: 'appruralteste'
      };
    } catch (err: any) {
      this.isConnected = false;
      return {
        success: false,
        message: err.message || 'Erro inesperado ao conectar ao Supabase'
      };
    }
  }

  static getIsConnected(): boolean | null {
    return this.isConnected;
  }

  static getProjectUrl(): string {
    return SUPABASE_URL;
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
        console.warn('Aviso ao sincronizar lançamento no Supabase:', error.message);
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
        crops: ['Soja', 'Milho 2ª Safra'],
        currentSafra: '2024/2025',
        responsiblePartners: ['Dr. Roberto Bernardo']
      }));
    } catch {
      return null;
    }
  }
}
