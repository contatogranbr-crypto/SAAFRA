// Dados Iniciais e Metodologia Gran Bernardo Agro
// Cenário Realista: Grupo Bernardo - Fazenda Santa Maria (Rio Verde / MT)

import { 
  UserProfile, 
  EconomicGroup, 
  FarmProperty, 
  CropPlanningItem, 
  CashFlowEntry, 
  DebtLiability, 
  RestructuringAction, 
  ScenarioSimulation,
  AuditLog,
  AgentConfig
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-bernardo-01',
  name: 'Dr. Roberto Bernardo',
  role: 'consultant',
  organization: 'Gran Bernardo Consultoria & Reestruturações',
  email: 'roberto@granbernardoagro.com.br'
};

export const INITIAL_GROUPS: EconomicGroup[] = [
  {
    id: 'grp-01',
    name: 'Grupo Agropecuário Santa Maria',
    cnpjCpf: '14.892.301/0001-44',
    consultantResponsible: 'Dr. Roberto Bernardo (Gran Bernardo)',
    farmsCount: 2
  },
  {
    id: 'grp-02',
    name: 'Agrícola Três Palmeiras',
    cnpjCpf: '08.451.982/0001-90',
    consultantResponsible: 'Eng. Agr. Mariana Dias (Gran Bernardo)',
    farmsCount: 1
  }
];

export const INITIAL_FARMS: FarmProperty[] = [
  {
    id: 'farm-01',
    groupId: 'grp-01',
    name: 'Fazenda Santa Maria (Sede)',
    municipality: 'Rio Verde',
    state: 'GO',
    totalAreaHa: 2450,
    arableAreaHa: 2100,
    crops: ['Soja', 'Milho 2ª Safra'],
    currentSafra: '2024/2025',
    responsiblePartners: ['Carlos Eduardo Bernardo', 'Henrique Bernardo']
  },
  {
    id: 'farm-02',
    groupId: 'grp-01',
    name: 'Fazenda Boa Vista (Expansão)',
    municipality: 'Jataí',
    state: 'GO',
    totalAreaHa: 950,
    arableAreaHa: 800,
    crops: ['Soja'],
    currentSafra: '2024/2025',
    responsiblePartners: ['Carlos Eduardo Bernardo']
  }
];

export const INITIAL_CROPS: CropPlanningItem[] = [
  {
    id: 'crop-soja-2425',
    safra: '2024/2025',
    crop: 'Soja',
    cycle: '1ª Safra (Verão)',
    plantedAreaHa: 1600,
    expectedYieldScHa: 64, // sc/ha
    realizedYieldScHa: 62,
    expectedPricePerSc: 136, // R$/sc
    realizedPricePerSc: 138,
    operatingCostPerHa: 4850, // R$/ha
    barterFinancedSc: 28000,
    totalProductionSc: 99200,
    grossRevenue: 13689600,
    totalOperatingCost: 7760000,
    grossMargin: 5929600,
    marginPercent: 43.3,
    breakEvenScHa: 35.14,
    breakEvenPrice: 78.22
  },
  {
    id: 'crop-milho-2425',
    safra: '2024/2025',
    crop: 'Milho 2ª Safra',
    cycle: '2ª Safra (Safrinha)',
    plantedAreaHa: 1200,
    expectedYieldScHa: 96,
    expectedPricePerSc: 58,
    operatingCostPerHa: 3420,
    barterFinancedSc: 15000,
    totalProductionSc: 115200,
    grossRevenue: 6681600,
    totalOperatingCost: 4104000,
    grossMargin: 2577600,
    marginPercent: 38.6,
    breakEvenScHa: 58.96,
    breakEvenPrice: 35.62
  }
];

export const INITIAL_CASH_FLOW: CashFlowEntry[] = [
  // Out/24 - Plantio Soja
  {
    id: 'cf-01',
    date: '2024-10-15',
    month: '2024-10',
    description: 'Adubo Fosfatado e NPK de Plantio (1ª Parcela)',
    category: 'fertilizantes_adubos',
    categoryLabel: 'Fertilizantes e Adubos',
    type: 'outflow',
    expectedAmount: 920000,
    realizedAmount: 920000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Yara Fertilizantes',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-02',
    date: '2024-10-20',
    month: '2024-10',
    description: 'Sementes Soja Intacta 2 Xtend',
    category: 'sementes',
    categoryLabel: 'Sementes e Mudas',
    type: 'outflow',
    expectedAmount: 680000,
    realizedAmount: 680000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Sementes Goiás Agro',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-03',
    date: '2024-10-28',
    month: '2024-10',
    description: 'Óleo Diesel S10 Plantio Safra (45.000 L)',
    category: 'combustiveis_lubrificantes',
    categoryLabel: 'Combustíveis e Lubrificantes',
    type: 'outflow',
    expectedAmount: 279000,
    realizedAmount: 275000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Distribuidora Petrorural',
    confidence: 98,
    source: 'import_excel'
  },

  // Nov/24 - Tratos Culturais
  {
    id: 'cf-04',
    date: '2024-11-10',
    month: '2024-11',
    description: 'Herbicidas e Adjuvantes dessecação e pós-emergência',
    category: 'defensivos_quimicos',
    categoryLabel: 'Defensivos Químicos e Biológicos',
    type: 'outflow',
    expectedAmount: 540000,
    realizedAmount: 540000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Bayer CropScience',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-05',
    date: '2024-11-20',
    month: '2024-11',
    description: 'Folha de Pagamento Funcionários e Operadores',
    category: 'mao_de_obra_folha',
    categoryLabel: 'Mão de Obra e Encargos',
    type: 'outflow',
    expectedAmount: 145000,
    realizedAmount: 145000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Folha Operacional',
    confidence: 100,
    source: 'import_excel'
  },

  // Dez/24 - Aplicações Fungicidas Soja
  {
    id: 'cf-06',
    date: '2024-12-05',
    month: '2024-12',
    description: 'Fungicidas contra Ferrugem Asiática (2 aplicações)',
    category: 'defensivos_quimicos',
    categoryLabel: 'Defensivos Químicos e Biológicos',
    type: 'outflow',
    expectedAmount: 760000,
    realizedAmount: 760000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Syngenta Proteção de Cultivos',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-07',
    date: '2024-12-20',
    month: '2024-12',
    description: '13º Salário e Encargos Equipe Rural',
    category: 'mao_de_obra_folha',
    categoryLabel: 'Mão de Obra e Encargos',
    type: 'outflow',
    expectedAmount: 178000,
    realizedAmount: 178000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Equipe Campo',
    confidence: 100,
    source: 'import_excel'
  },

  // Jan/25 - Adiantamento Venda Soja e Preparo Colheita
  {
    id: 'cf-08',
    date: '2025-01-15',
    month: '2025-01',
    description: 'Adiantamento Contrato Futuro Soja (15.000 sacas)',
    category: 'receita_soja',
    categoryLabel: 'Receita da Venda de Soja',
    type: 'inflow',
    expectedAmount: 2040000,
    realizedAmount: 2040000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Bunge Alimentos',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-09',
    date: '2025-01-25',
    month: '2025-01',
    description: 'Revisão e Peças Colheitadeiras John Deere',
    category: 'manutencao_maquinas',
    categoryLabel: 'Manutenção de Máquinas e Implementos',
    type: 'outflow',
    expectedAmount: 185000,
    realizedAmount: 192000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Concessionária Maqcampo John Deere',
    confidence: 95,
    source: 'import_excel'
  },

  // Fev/25 - Início Colheita Soja + Plantio Milho Safrinha
  {
    id: 'cf-10',
    date: '2025-02-12',
    month: '2025-02',
    description: 'Venda de Soja Lote 01 (20.000 sacas spot)',
    category: 'receita_soja',
    categoryLabel: 'Receita da Venda de Soja',
    type: 'inflow',
    expectedAmount: 2760000,
    realizedAmount: 2760000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Cargill Agrícola',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-11',
    date: '2025-02-18',
    month: '2025-02',
    description: 'Sementes Híbridas Milho Safrinha Dekalb',
    category: 'sementes',
    categoryLabel: 'Sementes e Mudas',
    type: 'outflow',
    expectedAmount: 510000,
    realizedAmount: 510000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Bayer Dekalb',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-12',
    date: '2025-02-25',
    month: '2025-02',
    description: 'Frete Terceirizado Fazenda até Terminal Rodoferroviário',
    category: 'fretes_armazenagem',
    categoryLabel: 'Fretes e Logística Rural',
    type: 'outflow',
    expectedAmount: 230000,
    realizedAmount: 230000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Cooperativa de Transportes Transagro',
    confidence: 100,
    source: 'import_excel'
  },

  // Mar/25 - Colheita Plena Soja
  {
    id: 'cf-13',
    date: '2025-03-10',
    month: '2025-03',
    description: 'Recebimento Venda Soja Lote 02 (30.000 sacas)',
    category: 'receita_soja',
    categoryLabel: 'Receita da Venda de Soja',
    type: 'inflow',
    expectedAmount: 4140000,
    realizedAmount: 4140000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'LDC Louis Dreyfus Company',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-14',
    date: '2025-03-25',
    month: '2025-03',
    description: 'Parcela Finame John Deere Tratores 8R',
    category: 'financiamento_investimento',
    categoryLabel: 'Financiamento de Investimento / Máquinas',
    type: 'outflow',
    expectedAmount: 480000,
    realizedAmount: 480000,
    status: 'realizado',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Banco John Deere',
    confidence: 100,
    source: 'import_excel'
  },

  // Abr/25 - Fim Colheita Soja
  {
    id: 'cf-15',
    date: '2025-04-10',
    month: '2025-04',
    description: 'Saldo Venda Soja Armazenada (20.000 sacas)',
    category: 'receita_soja',
    categoryLabel: 'Receita da Venda de Soja',
    type: 'inflow',
    expectedAmount: 2760000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Bunge Alimentos',
    confidence: 90,
    source: 'import_excel'
  },
  {
    id: 'cf-16',
    date: '2025-04-25',
    month: '2025-04',
    description: 'Arrendamento de Terras Gleba Norte (1ª Parcela)',
    category: 'arrendamento_terras',
    categoryLabel: 'Arrendamentos de Terras',
    type: 'outflow',
    expectedAmount: 420000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Espólio Dr. Armando Vilela',
    confidence: 95,
    source: 'import_excel'
  },

  // Mai/25 - Vencimento Custeio Banco do Brasil (PONTO CRÍTICO)
  {
    id: 'cf-17',
    date: '2025-05-20',
    month: '2025-05',
    description: 'Amortização Principal Custeio BB Safra 24/25',
    category: 'financiamento_custeio',
    categoryLabel: 'Financiamento de Custeio Agrícola',
    type: 'outflow',
    expectedAmount: 3800000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Banco do Brasil S/A',
    confidence: 100,
    source: 'import_excel'
  },
  {
    id: 'cf-18',
    date: '2025-05-25',
    month: '2025-05',
    description: 'Imposto Funrural Retenção sobre Grãos',
    category: 'impostos_funrural_itr',
    categoryLabel: 'Impostos e Encargos (Funrural/ITR)',
    type: 'outflow',
    expectedAmount: 180000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Receita Federal',
    confidence: 90,
    source: 'import_excel'
  },

  // Jun/25 - Maturação Milho Safrinha
  {
    id: 'cf-19',
    date: '2025-06-15',
    month: '2025-06',
    description: 'Despesas Gerais e Manutenção Pré-Colheita Milho',
    category: 'manutencao_maquinas',
    categoryLabel: 'Manutenção de Máquinas e Implementos',
    type: 'outflow',
    expectedAmount: 135000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Oficinas e Peças Locais',
    confidence: 85,
    source: 'import_excel'
  },

  // Jul/25 - Colheita Milho Safrinha
  {
    id: 'cf-20',
    date: '2025-07-15',
    month: '2025-07',
    description: 'Venda Milho 1ª Fase (50.000 sacas a R$ 58/sc)',
    category: 'receita_milho',
    categoryLabel: 'Receita da Venda de Milho',
    type: 'inflow',
    expectedAmount: 2900000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'BRF Foods Alimentos',
    confidence: 90,
    source: 'import_excel'
  },
  {
    id: 'cf-21',
    date: '2025-07-28',
    month: '2025-07',
    description: 'Combustível Colheita Milho (30.000 L)',
    category: 'combustiveis_lubrificantes',
    categoryLabel: 'Combustíveis e Lubrificantes',
    type: 'outflow',
    expectedAmount: 186000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Distribuidora Petrorural',
    confidence: 95,
    source: 'import_excel'
  },

  // Ago/25 - Liquidação Milho e Custeio Sicredi
  {
    id: 'cf-22',
    date: '2025-08-10',
    month: '2025-08',
    description: 'Venda Milho 2ª Fase (50.000 sacas)',
    category: 'receita_milho',
    categoryLabel: 'Receita da Venda de Milho',
    type: 'inflow',
    expectedAmount: 2900000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Amaggi Grãos',
    confidence: 90,
    source: 'import_excel'
  },
  {
    id: 'cf-23',
    date: '2025-08-25',
    month: '2025-08',
    description: 'Liquidação Custeio Milho Sicredi',
    category: 'financiamento_custeio',
    categoryLabel: 'Financiamento de Custeio Agrícola',
    type: 'outflow',
    expectedAmount: 2200000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Cooperativa Sicredi Centro-Oeste',
    confidence: 100,
    source: 'import_excel'
  },

  // Set/25 - Fechamento do Ano Safra
  {
    id: 'cf-24',
    date: '2025-09-15',
    month: '2025-09',
    description: 'Saldo Venda Milho e Subprodutos',
    category: 'receita_milho',
    categoryLabel: 'Receita da Venda de Milho',
    type: 'inflow',
    expectedAmount: 881600,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Mercado Local e Granjas',
    confidence: 85,
    source: 'import_excel'
  },
  {
    id: 'cf-25',
    date: '2025-09-28',
    month: '2025-09',
    description: 'Arrendamento de Terras (2ª Parcela Final)',
    category: 'arrendamento_terras',
    categoryLabel: 'Arrendamentos de Terras',
    type: 'outflow',
    expectedAmount: 420000,
    status: 'previsto',
    safra: '2024/2025',
    farmId: 'farm-01',
    supplierOrClient: 'Espólio Dr. Armando Vilela',
    confidence: 95,
    source: 'import_excel'
  }
];

export const INITIAL_DEBTS: DebtLiability[] = [
  {
    id: 'debt-01',
    creditor: 'Banco do Brasil',
    creditorType: 'Banco Comercial',
    operationType: 'Custeio Agrícola',
    contractNumber: 'BB-CUST-84920/24',
    originalAmount: 4200000,
    currentBalance: 3800000,
    annualInterestRate: 11.5,
    installmentsTotal: 1,
    installmentsRemaining: 1,
    nextDueDate: '2025-05-20',
    nextDueAmount: 3800000,
    term: 'curto',
    status: 'normal',
    guarantees: 'Penhor da Safra de Soja (35.000 sacas) e Aval dos Sócios',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  },
  {
    id: 'debt-02',
    creditor: 'Sicredi Centro-Oeste',
    creditorType: 'Cooperativa de Crédito',
    operationType: 'Custeio Agrícola',
    contractNumber: 'SIC-MILHO-2024-09',
    originalAmount: 2500000,
    currentBalance: 2200000,
    annualInterestRate: 12.0,
    installmentsTotal: 1,
    installmentsRemaining: 1,
    nextDueDate: '2025-08-25',
    nextDueAmount: 2200000,
    term: 'curto',
    status: 'normal',
    guarantees: 'Penhor Agrícola Safra de Milho Safrinha',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  },
  {
    id: 'debt-03',
    creditor: 'Banco John Deere',
    creditorType: 'Banco Comercial',
    operationType: 'Finame / Máquinas',
    contractNumber: 'JD-FINAME-77401',
    originalAmount: 3600000,
    currentBalance: 2650000,
    annualInterestRate: 8.5,
    installmentsTotal: 5,
    installmentsRemaining: 3,
    nextDueDate: '2025-03-25',
    nextDueAmount: 480000,
    term: 'longo',
    status: 'normal',
    guarantees: 'Alienação Fiduciária das 2 Colheitadeiras S780',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  },
  {
    id: 'debt-04',
    creditor: 'Syngenta Proteção de Cultivos',
    creditorType: 'Trading / Revenda',
    operationType: 'Barter Insumos',
    contractNumber: 'SYN-BARTER-2425',
    originalAmount: 2800000,
    currentBalance: 2400000,
    annualInterestRate: 9.8,
    installmentsTotal: 1,
    installmentsRemaining: 1,
    nextDueDate: '2025-04-30',
    nextDueAmount: 2400000,
    term: 'curto',
    status: 'normal',
    guarantees: 'CPR Física registrada na B3 (17.500 sacas de soja)',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  },
  {
    id: 'debt-05',
    creditor: 'Banco Bradesco',
    creditorType: 'Banco Comercial',
    operationType: 'Capital de Giro',
    contractNumber: 'BRAD-GIRO-102948',
    originalAmount: 2200000,
    currentBalance: 1900000,
    annualInterestRate: 15.5,
    installmentsTotal: 24,
    installmentsRemaining: 14,
    nextDueDate: '2024-12-20',
    nextDueAmount: 185000,
    term: 'curto',
    status: 'vencida',
    guarantees: 'Aval dos Sócios e Hipoteca de 200 ha Fazenda Santa Maria',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  },
  {
    id: 'debt-06',
    creditor: 'Yara Fertilizantes',
    creditorType: 'Fornecedor',
    operationType: 'Barter Insumos',
    contractNumber: 'YARA-FORN-2425',
    originalAmount: 1450000,
    currentBalance: 1450000,
    annualInterestRate: 10.5,
    installmentsTotal: 1,
    installmentsRemaining: 1,
    nextDueDate: '2025-05-15',
    nextDueAmount: 1450000,
    term: 'curto',
    status: 'normal',
    guarantees: 'Nota Promissória Rural e duplicatas mercantis',
    relatedSafra: '2024/2025',
    farmId: 'farm-01'
  }
];

export const INITIAL_ACTIONS: RestructuringAction[] = [
  {
    id: 'act-01',
    problem: 'Parcela vencida e taxa punitiva no Bradesco Giro (15.5% a.a.) com risco de execução hipotecária',
    action: 'Negociação de Reestruturação Extrajudicial com o Bradesco: Unificação de passivo com carência de 12 meses e taxa negociada para CDI + 2.5%',
    responsible: 'Dr. Roberto Bernardo (Consultor Gran Bernardo)',
    deadline: '2025-02-28',
    priority: 'urgente',
    status: 'em_andamento',
    estimatedImpactR$: 420000,
    documents: ['Minuta_Alongamento_Bradesco.pdf', 'Demonstrativo_Capacidade_Pagamento.xlsx'],
    historyNotes: [
      '10/01/2025: Reunião inicial com Gerente Regional Agro Bradesco. Aceitaram proposta para análise com laudo agronômico.',
      '22/01/2025: Envio do fluxo de caixa projetado Gran Bernardo demonstrando viabilidade após colheita de milho.'
    ]
  },
  {
    id: 'act-02',
    problem: 'Concentração severa de R$ 3,8M em Maio/2025 no Banco do Brasil antes da liquidação final do milho',
    action: 'Solicitação de Prorrogação de Custeio (Manual de Crédito Rural MCR 2.6.9) por atraso de chuvas e escalonamento para 3 safras',
    responsible: 'Dr. Roberto Bernardo & Henrique Bernardo',
    deadline: '2025-03-30',
    priority: 'alta',
    status: 'em_andamento',
    estimatedImpactR$: 2200000,
    documents: ['Laudo_Pericial_Clima_Inmet.pdf', 'Comprovante_Plantio_Tardio.pdf'],
    historyNotes: [
      '15/01/2025: Levantamento dos índices pluviométricos do talhão 04 a 12 comprovando atraso de 22 dias no plantio.',
      '28/01/2025: Protocolado pedido prévio de conformidade no portal BB Agro.'
    ]
  },
  {
    id: 'act-03',
    problem: 'Exposição de 45% da produção de soja sem trava de preço frente à volatilidade de Chicago',
    action: 'Contratação de Trava de Preço Mínimo (Opção Put / Seguro de Preço) para 30.000 sacas com strike a R$ 135/sc',
    responsible: 'Carlos Eduardo Bernardo (Produtor)',
    deadline: '2025-02-15',
    priority: 'alta',
    status: 'a_iniciar',
    estimatedImpactR$: 650000,
    documents: ['Cotacao_Derivativos_B3.pdf'],
    historyNotes: [
      '18/01/2025: Recomendação emitida pela consultoria Gran Bernardo.'
    ]
  },
  {
    id: 'act-04',
    problem: 'Bitributação histórica de Funrural e saldo credor de PIS/COFINS sobre adubos não aproveitado',
    action: 'Auditoria tributária rural e pedido de compensação administrativa com DARF de ITR',
    responsible: 'Equipe Tributária Gran Bernardo',
    deadline: '2025-04-15',
    priority: 'media',
    status: 'a_iniciar',
    estimatedImpactR$: 380000,
    documents: ['Relatorio_Tributario_Preliminar.pdf'],
    historyNotes: [
      '20/01/2025: Diagnóstico apontou potencial de R$ 380 mil recuperáveis dos últimos 60 meses.'
    ]
  }
];

export const INITIAL_SCENARIOS: ScenarioSimulation[] = [
  {
    id: 'scen-base',
    name: 'Cenário Base (Oficial)',
    type: 'base',
    description: 'Projeção orçada da safra 2024/2025 com custos e preços atuais de contrato.',
    priceDeltaPercent: 0,
    yieldDeltaPercent: 0,
    costDeltaPercent: 0,
    debtHaircutPercent: 0,
    gracePeriodYears: 0,
    termExtensionYears: 0,
    projectedRevenue: 20371200,
    projectedCosts: 11864000,
    projectedMargin: 8507200,
    projectedEndingCash: 410600,
    capitalNeed: 0,
    debtServiceAnnual: 8880000
  },
  {
    id: 'scen-optimistic',
    name: 'Cenário Otimista (+10% Preço, +8% Produtividade)',
    type: 'optimistic',
    description: 'Recuperação dos preços globais da soja e safra recorde de milho.',
    priceDeltaPercent: 10,
    yieldDeltaPercent: 8,
    costDeltaPercent: -3,
    debtHaircutPercent: 0,
    gracePeriodYears: 0,
    termExtensionYears: 0,
    projectedRevenue: 24200985,
    projectedCosts: 11508080,
    projectedMargin: 12692905,
    projectedEndingCash: 4596305,
    capitalNeed: 0,
    debtServiceAnnual: 8880000
  },
  {
    id: 'scen-pessimistic',
    name: 'Cenário Estressado / Quebra (-15% Preço, -20% Quebra, +8% Insumos)',
    type: 'pessimistic',
    description: 'Veranico severo em janeiro/fevereiro e queda nas cotações internacionais.',
    priceDeltaPercent: -15,
    yieldDeltaPercent: -20,
    costDeltaPercent: 8,
    debtHaircutPercent: 0,
    gracePeriodYears: 0,
    termExtensionYears: 0,
    projectedRevenue: 13852416,
    projectedCosts: 12813120,
    projectedMargin: 1039296,
    projectedEndingCash: -7057304,
    capitalNeed: 7057304,
    debtServiceAnnual: 8880000
  },
  {
    id: 'scen-extrajudicial',
    name: 'Reestruturação Extrajudicial Gran Bernardo',
    type: 'extrajudicial',
    description: 'Alongamento bancário para 5 anos, carência de 12 meses e redução do serviço da dívida em 65%.',
    priceDeltaPercent: 0,
    yieldDeltaPercent: 0,
    costDeltaPercent: -4,
    debtHaircutPercent: 10,
    gracePeriodYears: 1,
    termExtensionYears: 4,
    projectedRevenue: 20371200,
    projectedCosts: 11389440,
    projectedMargin: 8981760,
    projectedEndingCash: 4210360,
    capitalNeed: 0,
    debtServiceAnnual: 2664000
  },
  {
    id: 'scen-judicial',
    name: 'Plano de Recuperação Judicial / Especial',
    type: 'judicial',
    description: 'Stay period judicial, deságio de 30% em fornecedores quirografários e carência de 24 meses.',
    priceDeltaPercent: -5,
    yieldDeltaPercent: -5,
    costDeltaPercent: 0,
    debtHaircutPercent: 30,
    gracePeriodYears: 2,
    termExtensionYears: 8,
    projectedRevenue: 18384000,
    projectedCosts: 11864000,
    projectedMargin: 6520000,
    projectedEndingCash: 3120000,
    capitalNeed: 0,
    debtServiceAnnual: 1864800
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2025-01-20 09:30:14',
    entityType: 'importacao',
    entityId: 'batch-01',
    field: 'Planilha Fluxo de Caixa Gran Bernardo.xlsx',
    originalValue: 'Arquivo recebido (25 linhas)',
    currentValue: 'Importação validada e confirmada',
    source: 'import_excel',
    user: 'Dr. Roberto Bernardo',
    reason: 'Carga inicial do fluxo de caixa e safras 2024/2025',
    canRollback: true
  },
  {
    id: 'log-02',
    timestamp: '2025-01-22 14:15:02',
    entityType: 'divida',
    entityId: 'debt-05',
    field: 'status',
    originalValue: 'normal',
    currentValue: 'vencida',
    source: 'manual',
    user: 'Dr. Roberto Bernardo',
    reason: 'Identificado atraso superior a 30 dias na parcela de giro Bradesco',
    canRollback: true
  },
  {
    id: 'log-03',
    timestamp: '2025-01-25 11:04:45',
    entityType: 'fluxo_caixa',
    entityId: 'cf-09',
    field: 'realizedAmount',
    originalValue: 'R$ 185.000,00',
    currentValue: 'R$ 192.000,00',
    source: 'ai_assistant',
    user: 'Dr. Roberto Bernardo (via Assistente IA)',
    reason: 'Comprovante fiscal de revisão e peças John Deere confirmado pelo consultor',
    canRollback: true
  }
];

export const INITIAL_AGENT_CONFIG: AgentConfig = {
  name: 'Dra. Sofia Bernardo',
  title: 'Consultora Sênior de Finanças & Reestruturação Rural',
  tone: 'executivo',
  minConfidencePercent: 80,
  systemPrompt: `Você é a Dra. Sofia Bernardo, Inteligência Autônoma e Consultora Sênior da Gran Bernardo Agro.
Sua missão é assessorar produtores rurais e consultores na análise de liquidez de safra, endividamento bancário, renegociação de dívidas com fornecedores e tradings, e mitigação de riscos de mercado.
Diretrizes fundamentais:
1. Nunca altere dados ou cadastre despesas/receitas sem aprovação expressa do usuário.
2. Analise o fluxo de caixa sempre na visão de ano-safra (12 meses).
3. Avalie o Ponto de Equilíbrio (Break-Even) em sacas/ha e R$/saca antes de opinar sobre custos.
4. Conheça e aplique as prerrogativas do Manual de Crédito Rural (MCR 2.6.9) e CPRs.`,
  requireExplicitConfirmation: true,
  alertDebtServiceOver35: true,
  recommendMcrExtension: true,
  checkBreakEvenOnPurchases: true,
  knowledgeTopics: [
    {
      id: 'kn-01',
      title: 'Manual de Crédito Rural — MCR 2.6.9 (Prorrogação de Custeio)',
      category: 'credito_rural',
      summary: 'Garante a prorrogação das dívidas rurais com as mesmas taxas contratuais em casos de frustração de safra por intempéries ou queda atípica de preços.',
      active: true
    },
    {
      id: 'kn-02',
      title: 'CPRs & Contratos de Barter na B3',
      category: 'barter_cpr',
      summary: 'Estruturação de Cédulas de Produto Rural físicas e financeiras com tradings para mitigar riscos de descasamento cambial e variação de insumos.',
      active: true
    },
    {
      id: 'kn-03',
      title: 'Metodologia Gran Bernardo de Reestruturação Extrajudicial',
      category: 'reestruturacao',
      summary: 'Unificação de passivos de curto prazo, negociação de carência de 12 a 24 meses e alongamento para 5 a 7 safras com garantia fiduciária equilibrada.',
      active: true
    },
    {
      id: 'kn-04',
      title: 'Recuperação Tributária de Funrural & Créditos de PIS/COFINS',
      category: 'tributario',
      summary: 'Auditoria de recolhimentos indevidos dos últimos 60 meses para compensação direta com ITR e redução de desembolsos em anos de quebra.',
      active: true
    }
  ],
  trainingExamples: [
    {
      id: 'ex-01',
      userPrompt: 'O Banco do Brasil está cobrando o custeio da soja em maio, mas atrasei a colheita. O que fazer?',
      agentResponse: 'Recomendo protocolar imediatamente o pedido formal de prorrogação com base no MCR 2.6.9 antes do vencimento, instruído com o laudo agronômico de plantio tardio. Isso impede a negativação e preserva as condições de financiamento.'
    },
    {
      id: 'ex-02',
      userPrompt: 'Vale a pena travar 40% da soja a R$ 138/sc?',
      agentResponse: 'Sim. Seu ponto de equilíbrio na soja é de R$ 78,22/sc (35,1 sc/ha). A R$ 138/sc, você assegura uma margem bruta de 43,3%, cobrindo todos os custos de fertilizantes e sementes sem exposição à oscilação de Chicago.'
    }
  ]
};

