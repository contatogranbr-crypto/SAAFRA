// Motor Financeiro Autônomo - Plataforma Gran Bernardo Agro
// Realiza todos os cálculos determinísticos de safra, fluxo de caixa, endividamento, riscos e cenários

import { 
  CashFlowEntry, 
  CashFlowMonthlySummary, 
  CropPlanningItem, 
  DebtLiability, 
  RiskAlert, 
  ScenarioSimulation 
} from '../types';

export class FinancialEngine {

  /**
   * Calcula as métricas agronômicas e financeiras de uma cultura
   */
  static calculateCropMetrics(item: {
    id: string;
    safra: string;
    crop: 'Soja' | 'Milho 2ª Safra' | 'Algodão' | 'Trigo';
    cycle: '1ª Safra (Verão)' | '2ª Safra (Safrinha)' | 'Inverno';
    plantedAreaHa: number;
    expectedYieldScHa: number;
    expectedPricePerSc: number;
    operatingCostPerHa: number;
    barterFinancedSc?: number;
    realizedYieldScHa?: number;
    realizedPricePerSc?: number;
  }): CropPlanningItem {
    const yieldToUse = item.realizedYieldScHa ?? item.expectedYieldScHa;
    const priceToUse = item.realizedPricePerSc ?? item.expectedPricePerSc;

    const totalProductionSc = item.plantedAreaHa * yieldToUse;
    const grossRevenue = totalProductionSc * priceToUse;
    const totalOperatingCost = item.operatingCostPerHa * item.plantedAreaHa;
    const grossMargin = grossRevenue - totalOperatingCost;
    const marginPercent = grossRevenue > 0 ? (grossMargin / grossRevenue) * 100 : 0;

    // Ponto de equilíbrio: sacas/ha necessárias para cobrir o custo por hectare
    const breakEvenScHa = priceToUse > 0 ? item.operatingCostPerHa / priceToUse : 0;
    // Ponto de equilíbrio: preço por saca mínimo para cobrir o custo total
    const breakEvenPrice = totalProductionSc > 0 ? totalOperatingCost / totalProductionSc : 0;

    return {
      ...item,
      totalProductionSc,
      grossRevenue,
      totalOperatingCost,
      grossMargin,
      marginPercent,
      breakEvenScHa,
      breakEvenPrice
    };
  }

  /**
   * Consolida o Fluxo de Caixa Mensal (Metodologia Gran Bernardo)
   * Agrupa e calcula entradas, custos operacionais, despesas fixas, serviço da dívida e saldos
   */
  static calculateMonthlyCashFlow(
    entries: CashFlowEntry[],
    initialCashReserve: number = 320000
  ): CashFlowMonthlySummary[] {
    // Meses padrão do ano safra agropecuário (Outubro a Setembro)
    const monthKeys = [
      '2024-10', '2024-11', '2024-12',
      '2025-01', '2025-02', '2025-03',
      '2025-04', '2025-05', '2025-06',
      '2025-07', '2025-08', '2025-09'
    ];

    const monthLabels: Record<string, string> = {
      '2024-10': 'Out/24',
      '2024-11': 'Nov/24',
      '2024-12': 'Dez/24',
      '2025-01': 'Jan/25',
      '2025-02': 'Fev/25',
      '2025-03': 'Mar/25',
      '2025-04': 'Abr/25',
      '2025-05': 'Mai/25',
      '2025-06': 'Jun/25',
      '2025-07': 'Jul/25',
      '2025-08': 'Ago/25',
      '2025-09': 'Set/25'
    };

    let currentBalance = initialCashReserve;
    const summaries: CashFlowMonthlySummary[] = [];

    for (const mKey of monthKeys) {
      const monthEntries = entries.filter(e => e.month === mKey || e.date.startsWith(mKey));

      let inflows = 0;
      let outflowsOperating = 0;
      let fixedCosts = 0;
      let debtService = 0;

      for (const entry of monthEntries) {
        const val = entry.realizedAmount ?? entry.expectedAmount;

        if (entry.type === 'inflow') {
          inflows += val;
        } else {
          // Classificação metodológica Gran Bernardo
          if (
            entry.category === 'financiamento_custeio' ||
            entry.category === 'financiamento_investimento' ||
            entry.category === 'juros_encargos_bancarios' ||
            entry.category === 'liquidacao_cpr_barter' ||
            entry.category === 'dividas_renegociadas'
          ) {
            debtService += val;
          } else if (
            entry.category === 'arrendamento_terras' ||
            entry.category === 'pro_labore_socios' ||
            entry.category === 'energia_eletrica' ||
            entry.category === 'impostos_funrural_itr' ||
            entry.category === 'seguros_patrimoniais'
          ) {
            fixedCosts += val;
          } else {
            outflowsOperating += val;
          }
        }
      }

      const operatingResult = inflows - outflowsOperating;
      const netCashFlow = operatingResult - fixedCosts - debtService;
      const startingBalance = currentBalance;
      const endingBalance = startingBalance + netCashFlow;
      const loanNeed = endingBalance < 0 ? Math.abs(endingBalance) : 0;

      summaries.push({
        month: mKey,
        monthLabel: monthLabels[mKey] || mKey,
        inflows,
        outflowsOperating,
        operatingResult,
        fixedCosts,
        debtService,
        netCashFlow,
        startingBalance,
        endingBalance,
        loanNeed
      });

      // Saldo final passa para o próximo mês
      currentBalance = endingBalance;
    }

    return summaries;
  }

  /**
   * Consolida métricas de Endividamento e Passivos
   */
  static calculateDebtMetrics(debts: DebtLiability[]) {
    const totalBalance = debts.reduce((acc, d) => acc + d.currentBalance, 0);
    const shortTermBalance = debts
      .filter(d => d.term === 'curto')
      .reduce((acc, d) => acc + d.currentBalance, 0);
    const mediumTermBalance = debts
      .filter(d => d.term === 'medio')
      .reduce((acc, d) => acc + d.currentBalance, 0);
    const longTermBalance = debts
      .filter(d => d.term === 'longo')
      .reduce((acc, d) => acc + d.currentBalance, 0);

    const pastDueBalance = debts
      .filter(d => d.status === 'vencida')
      .reduce((acc, d) => acc + d.currentBalance, 0);

    // Concentração por credor
    const creditorMap: Record<string, number> = {};
    debts.forEach(d => {
      creditorMap[d.creditor] = (creditorMap[d.creditor] || 0) + d.currentBalance;
    });

    const creditorConcentration = Object.entries(creditorMap)
      .map(([creditor, amount]) => ({
        creditor,
        amount,
        percentage: totalBalance > 0 ? (amount / totalBalance) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Média ponderada de juros anuais
    let weightedInterestSum = 0;
    debts.forEach(d => {
      weightedInterestSum += d.currentBalance * d.annualInterestRate;
    });
    const averageInterestRate = totalBalance > 0 ? weightedInterestSum / totalBalance : 0;

    return {
      totalBalance,
      shortTermBalance,
      mediumTermBalance,
      longTermBalance,
      pastDueBalance,
      shortTermPercent: totalBalance > 0 ? (shortTermBalance / totalBalance) * 100 : 0,
      creditorConcentration,
      averageInterestRate
    };
  }

  /**
   * Motor de Avaliação Autônoma de Riscos e Oportunidades
   * Identifica anomalias, descasamentos e potenciais ganhos
   */
  static generateAutonomousRiskMatrix(
    crops: CropPlanningItem[],
    cashFlow: CashFlowMonthlySummary[],
    debts: DebtLiability[]
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const totalDebt = debts.reduce((a, b) => a + b.currentBalance, 0);
    const totalGrossRevenue = crops.reduce((a, b) => a + b.grossRevenue, 0);

    // 1. Verificar Meses com Saldo Negativo (Risco Crítico de Liquidez)
    const negativeMonths = cashFlow.filter(m => m.endingBalance < 0);
    if (negativeMonths.length > 0) {
      const maxDeficit = Math.max(...negativeMonths.map(m => m.loanNeed));
      const monthsList = negativeMonths.map(m => m.monthLabel).join(', ');
      alerts.push({
        id: 'risk-liquidity-deficit',
        type: 'risk',
        severity: 'critical',
        title: 'Descasamento de Fluxo e Déficit de Caixa Previsto',
        problem: `Caixa projeta saldo negativo nos meses: ${monthsList}, atingindo necessidade máxima de R$ ${maxDeficit.toLocaleString('pt-BR')}.`,
        dataUsed: 'Projeção mensal de entradas vs vencimentos de insumos e bancos.',
        impactR$: maxDeficit,
        recommendation: 'Antecipar negociação de CPR Financeira para fechar a lacuna pré-colheita ou alongar parcelas de custeio com vencimento anterior à liquidação dos grãos.',
        assumptions: 'Premissa de recebimento de safra conforme cronograma de entrega acordado.',
        createdAt: '2025-01-15',
        resolved: false
      });
    }

    // 2. Verificar Concentração de Credores
    const debtMetrics = this.calculateDebtMetrics(debts);
    const topCreditor = debtMetrics.creditorConcentration[0];
    if (topCreditor && topCreditor.percentage > 40) {
      alerts.push({
        id: 'risk-creditor-concentration',
        type: 'risk',
        severity: 'high',
        title: `Alta Concentração de Endividamento em ${topCreditor.creditor}`,
        problem: `${topCreditor.percentage.toFixed(1)}% do passivo total (R$ ${topCreditor.amount.toLocaleString('pt-BR')}) está concentrado em um único credor.`,
        dataUsed: `Saldo por credor extraído dos contratos vigentes. Total: R$ ${totalDebt.toLocaleString('pt-BR')}.`,
        impactR$: topCreditor.amount,
        recommendation: `Diversificar linhas de crédito via Cooperativas de Crédito (Sicredi/Sicoob) ou emissão de CRA com taxa indexada ao CDI para reduzir poder de bloqueio de garantias.`,
        assumptions: 'Risco de execução de garantias cruzadas em caso de estresse pontual de liquidez.',
        createdAt: '2025-01-10',
        resolved: false
      });
    }

    // 3. Verificar Comprometimento de Receita com Serviço da Dívida
    const annualDebtService = cashFlow.reduce((acc, m) => acc + m.debtService, 0);
    const debtBurdenRatio = totalGrossRevenue > 0 ? (annualDebtService / totalGrossRevenue) * 100 : 0;
    if (debtBurdenRatio > 35) {
      alerts.push({
        id: 'risk-debt-burden',
        type: 'risk',
        severity: 'high',
        title: 'Serviço da Dívida Comprometendo Margem Operacional',
        problem: `As amortizações e juros bancários consom ${debtBurdenRatio.toFixed(1)}% da receita bruta da safra (R$ ${annualDebtService.toLocaleString('pt-BR')}).`,
        dataUsed: 'Soma do serviço da dívida em 12 meses comparada à receita bruta projetada.',
        impactR$: annualDebtService * 0.35,
        recommendation: 'Reestruturação com carência de 12 a 24 meses para amortizações principais e alongamento de prazo para 5 a 7 anos.',
        assumptions: 'Preços de soja e milho mantidos estáveis nos contratos a termo.',
        createdAt: '2025-01-08',
        resolved: false
      });
    }

    // 4. Oportunidade: Alongamento de Dívidas de Curto Prazo
    if (debtMetrics.shortTermBalance > 3000000) {
      const cashFlowRelief = debtMetrics.shortTermBalance * 0.65;
      alerts.push({
        id: 'opp-debt-lengthening',
        type: 'opportunity',
        severity: 'medium',
        title: 'Oportunidade: Alongamento de Dívida de Curto Prazo para 5 Anos',
        problem: 'Volume elevado de passivo vencendo nos próximos 12 meses restringe capital de giro para compra de fertilizantes à vista.',
        dataUsed: `Passivo de curto prazo atual: R$ ${debtMetrics.shortTermBalance.toLocaleString('pt-BR')}.`,
        impactR$: cashFlowRelief,
        recommendation: 'Substituição de dívidas de curto prazo por linha de reestruturação rural com carência de 1 ano, liberando imediatamente até R$ 2,5M no caixa.',
        assumptions: 'Adesão bancária com taxa de CDI + 3.5% a.a. e alienação fiduciária de área produtiva.',
        createdAt: '2025-01-12',
        resolved: false
      });
    }

    // 5. Oportunidade: Fixação de Hedge / Barter na Soja
    const soyCrop = crops.find(c => c.crop === 'Soja');
    if (soyCrop && soyCrop.expectedYieldScHa > 0) {
      const unhedgedBags = soyCrop.totalProductionSc * 0.45;
      const hedgeValue = unhedgedBags * soyCrop.expectedPricePerSc;
      alerts.push({
        id: 'opp-hedge-locking',
        type: 'opportunity',
        severity: 'low',
        title: 'Oportunidade: Travamento de Preço Futuro (Hedge 45% Soja)',
        problem: 'Exposição total à oscilação das cotações em Chicago (CBOT) e prêmio do porto de Paranaguá.',
        dataUsed: `Produção desprotegida: ${unhedgedBags.toLocaleString('pt-BR')} sacas de soja.`,
        impactR$: hedgeValue * 0.08,
        recommendation: 'Fechar contratos a termo (NDF / CPR física) com trading parceira a R$ 138/sc garantindo margem líquida positiva e cobrindo os custos de sementes e adubo.',
        assumptions: 'Preço mínimo garantido acima do break-even de R$ 108/sc.',
        createdAt: '2025-01-14',
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Simula um cenário estressado ou otimista
   */
  static runScenarioSimulation(
    scenario: ScenarioSimulation,
    baseCrops: CropPlanningItem[],
    baseDebts: DebtLiability[],
    baseCashFlow: CashFlowMonthlySummary[]
  ): ScenarioSimulation {
    // 1. Ajustar Receita
    let projectedRevenue = 0;
    let projectedCosts = 0;

    baseCrops.forEach(crop => {
      const adjustedPrice = crop.expectedPricePerSc * (1 + scenario.priceDeltaPercent / 100);
      const adjustedYield = crop.expectedYieldScHa * (1 + scenario.yieldDeltaPercent / 100);
      const adjustedCostHa = crop.operatingCostPerHa * (1 + scenario.costDeltaPercent / 100);

      const prod = crop.plantedAreaHa * adjustedYield;
      projectedRevenue += prod * adjustedPrice;
      projectedCosts += adjustedCostHa * crop.plantedAreaHa;
    });

    const projectedMargin = projectedRevenue - projectedCosts;

    // 2. Ajustar Serviço da Dívida com base em Deságio e Alongamento
    const baseDebtService = baseCashFlow.reduce((a, m) => a + m.debtService, 0);
    let debtServiceAnnual = baseDebtService;

    if (scenario.debtHaircutPercent > 0) {
      debtServiceAnnual *= (1 - scenario.debtHaircutPercent / 100);
    }
    if (scenario.gracePeriodYears > 0) {
      debtServiceAnnual *= 0.3; // Durante carência, paga apenas juros reduzidos
    } else if (scenario.termExtensionYears > 0) {
      debtServiceAnnual /= (1 + scenario.termExtensionYears / 2);
    }

    // 3. Projeção de Caixa Final e Necessidade de Capital
    const baseFixedCosts = baseCashFlow.reduce((a, m) => a + m.fixedCosts, 0);
    const netProjectedCash = projectedMargin - baseFixedCosts - debtServiceAnnual;
    const projectedEndingCash = 320000 + netProjectedCash;
    const capitalNeed = projectedEndingCash < 0 ? Math.abs(projectedEndingCash) : 0;

    return {
      ...scenario,
      projectedRevenue,
      projectedCosts,
      projectedMargin,
      projectedEndingCash,
      capitalNeed,
      debtServiceAnnual
    };
  }
}
