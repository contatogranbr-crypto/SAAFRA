// TypeScript Definitions for Gran Bernardo Agro Platform

export type UserRole = 'admin' | 'consultant' | 'producer';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  email: string;
}

export interface EconomicGroup {
  id: string;
  name: string;
  cnpjCpf: string;
  consultantResponsible: string;
  farmsCount: number;
}

export interface FarmProperty {
  id: string;
  groupId: string;
  name: string;
  municipality: string;
  state: string;
  totalAreaHa: number;
  arableAreaHa: number;
  crops: string[];
  currentSafra: string;
  responsiblePartners: string[];
}

export type CashFlowCategory = 
  // Entradas
  | 'receita_soja'
  | 'receita_milho'
  | 'receita_outras_culturas'
  | 'recebiveis_cpr'
  | 'outras_entradas'
  // Custos Operacionais Variáveis (Insumos e Produção)
  | 'sementes'
  | 'fertilizantes_adubos'
  | 'defensivos_quimicos'
  | 'combustiveis_lubrificantes'
  | 'mao_de_obra_folha'
  | 'manutencao_maquinas'
  | 'fretes_armazenagem'
  | 'servicos_terceiros'
  // Custos Fixos & Estruturais
  | 'arrendamento_terras'
  | 'pro_labore_socios'
  | 'energia_eletrica'
  | 'impostos_funrural_itr'
  | 'seguros_patrimoniais'
  // Serviço da Dívida (Bancos & Financiamentos)
  | 'financiamento_custeio'
  | 'financiamento_investimento'
  | 'juros_encargos_bancarios'
  | 'liquidacao_cpr_barter'
  | 'dividas_renegociadas';

export type EntryStatus = 'previsto' | 'realizado' | 'vencido' | 'renegociado' | 'projetado';
export type EntryType = 'inflow' | 'outflow';

export interface CashFlowEntry {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // '2025-01'
  description: string;
  category: CashFlowCategory;
  categoryLabel: string;
  type: EntryType;
  expectedAmount: number;
  realizedAmount?: number;
  status: EntryStatus;
  safra: string;
  farmId: string;
  supplierOrClient: string;
  documentRef?: string;
  notes?: string;
  confidence?: number; // 0 to 100%
  source: 'import_excel' | 'ai_assistant' | 'manual' | 'ocr_doc';
}

export interface CashFlowMonthlySummary {
  month: string;
  monthLabel: string;
  inflows: number;
  outflowsOperating: number;
  operatingResult: number; // Inflows - Operating Outflows
  fixedCosts: number;
  debtService: number; // Bancos e Financiamentos
  netCashFlow: number; // Operating - Fixed - Debt
  startingBalance: number;
  endingBalance: number;
  loanNeed: number; // Se o saldo for negativo
}

export interface CropPlanningItem {
  id: string;
  safra: string;
  crop: 'Soja' | 'Milho 2ª Safra' | 'Algodão' | 'Trigo';
  cycle: '1ª Safra (Verão)' | '2ª Safra (Safrinha)' | 'Inverno';
  plantedAreaHa: number;
  expectedYieldScHa: number; // sc/ha
  realizedYieldScHa?: number;
  expectedPricePerSc: number; // R$/sc
  realizedPricePerSc?: number;
  operatingCostPerHa: number; // R$/ha
  barterFinancedSc?: number; // Sacas travadas em barter/CPR
  // Fórmulas calculadas pelo motor financeiro:
  totalProductionSc: number;
  grossRevenue: number;
  totalOperatingCost: number;
  grossMargin: number;
  marginPercent: number;
  breakEvenScHa: number;
  breakEvenPrice: number;
}

export type DebtTerm = 'curto' | 'medio' | 'longo';
export type DebtStatus = 'normal' | 'vencida' | 'prorrogada' | 'renegociada';

export interface DebtLiability {
  id: string;
  creditor: string; // Banco do Brasil, Sicredi, Bayer, Syngenta, etc.
  creditorType: 'Banco Comercial' | 'Cooperativa de Crédito' | 'Trading / Revenda' | 'Fornecedor' | 'Outro';
  operationType: 'Custeio Agrícola' | 'Finame / Máquinas' | 'CPR Financeira' | 'Barter Insumos' | 'Capital de Giro';
  contractNumber: string;
  originalAmount: number;
  currentBalance: number;
  annualInterestRate: number; // % a.a.
  installmentsTotal: number;
  installmentsRemaining: number;
  nextDueDate: string;
  nextDueAmount: number;
  term: DebtTerm;
  status: DebtStatus;
  guarantees: string; // Penhor de Grãos, Hipoteca da Fazenda, Aval dos Sócios
  relatedSafra: string;
  farmId: string;
}

export interface RiskAlert {
  id: string;
  type: 'risk' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  dataUsed: string;
  impactR$: number;
  recommendation: string;
  assumptions: string;
  createdAt: string;
  resolved: boolean;
}

export interface ScenarioSimulation {
  id: string;
  name: string;
  type: 'base' | 'optimistic' | 'pessimistic' | 'extrajudicial' | 'judicial';
  description: string;
  // Multiplicadores paramétricos:
  priceDeltaPercent: number; // ex: -15%
  yieldDeltaPercent: number; // ex: -20%
  costDeltaPercent: number;  // ex: +10%
  debtHaircutPercent: number; // Deságio em negociação (ex: 25%)
  gracePeriodYears: number;   // Carência (ex: 1 ano)
  termExtensionYears: number; // Alongamento (ex: 4 anos)
  // Resultados calculados pelo motor:
  projectedRevenue: number;
  projectedCosts: number;
  projectedMargin: number;
  projectedEndingCash: number;
  capitalNeed: number;
  debtServiceAnnual: number;
}

export interface RestructuringAction {
  id: string;
  problem: string;
  action: string;
  responsible: string;
  deadline: string;
  priority: 'urgente' | 'alta' | 'media' | 'baixa';
  status: 'a_iniciar' | 'em_andamento' | 'concluido';
  estimatedImpactR$: number;
  documents?: string[];
  historyNotes: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entityType: 'fluxo_caixa' | 'safra' | 'divida' | 'acao_reestruturacao' | 'importacao';
  entityId: string;
  field: string;
  originalValue: string;
  currentValue: string;
  source: 'import_excel' | 'ai_assistant' | 'manual' | 'ocr_doc';
  user: string;
  reason: string;
  canRollback: boolean;
}

export interface ProposedTransaction {
  category: CashFlowCategory;
  categoryLabel: string;
  type: EntryType;
  amount: number;
  date: string;
  supplierOrClient: string;
  safra: string;
  description: string;
  confidence: number;
  sourceText: string;
}

export interface KnowledgeTopic {
  id: string;
  title: string;
  category: 'credito_rural' | 'barter_cpr' | 'reestruturacao' | 'tributario';
  summary: string;
  active: boolean;
}

export interface AgentTrainingExample {
  id: string;
  userPrompt: string;
  agentResponse: string;
}

export interface AgentConfig {
  name: string;
  title: string;
  tone: 'executivo' | 'orientativo' | 'formal' | 'direto';
  minConfidencePercent: number;
  systemPrompt: string;
  requireExplicitConfirmation: boolean;
  alertDebtServiceOver35: boolean;
  recommendMcrExtension: boolean;
  checkBreakEvenOnPurchases: boolean;
  knowledgeTopics: KnowledgeTopic[];
  trainingExamples: AgentTrainingExample[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  audioDurationSec?: number;
  intent?: 'query' | 'transaction' | 'simulation' | 'general';
  proposedTransaction?: ProposedTransaction;
  actionConfirmed?: boolean;
  actionDismissed?: boolean;
}

export interface ImportPreviewRow {
  id: string;
  rawDate: string;
  rawDescription: string;
  rawCategory: string;
  rawAmount: number;
  rawType: 'Entrada' | 'Saída';
  rawCounterparty: string;
  suggestedCategory: CashFlowCategory;
  suggestedCategoryLabel: string;
  confidence: number;
  status: 'valid' | 'ambiguous' | 'duplicate';
  selected: boolean;
}

export interface ImportBatch {
  id: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  rowCount: number;
  status: 'preview' | 'imported' | 'reverted';
  totalInflows: number;
  totalOutflows: number;
  sourceType: 'XLSX' | 'CSV' | 'PDF' | 'Extrato';
}
