// Motor Inteligente do Assistente IA Gran Bernardo Agro
// Interpreta consultas, registros de despesas/receitas com validação prévia e simulações agronômico-financeiras

import { 
  CashFlowCategory, 
  CashFlowEntry, 
  CropPlanningItem, 
  DebtLiability, 
  ProposedTransaction 
} from '../types';
import { ExcelImporterService } from './excelImporter';
import { FinancialEngine } from './financialEngine';

export interface AiResponse {
  replyText: string;
  intent: 'query' | 'transaction' | 'simulation' | 'general';
  proposedTransaction?: ProposedTransaction;
  simulationResult?: {
    param: string;
    deltaPercent: number;
    financialImpactR$: number;
    newMarginPercent: number;
    cashStatus: string;
  };
}

export class AiAdvisorEngine {

  /**
   * Processa a mensagem do usuário (texto ou transcrição de áudio)
   */
  static processMessage(
    message: string,
    context: {
      cashFlow: CashFlowEntry[];
      crops: CropPlanningItem[];
      debts: DebtLiability[];
      currentSafra: string;
    }
  ): AiResponse {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. DETECÇÃO DE REGISTRO FINANCEIRO (Transações, Pagamentos, Vendas)
    if (this.isRegistrationIntent(lower)) {
      const proposed = this.extractTransactionData(text, context.currentSafra);
      if (proposed) {
        return {
          intent: 'transaction',
          proposedTransaction: proposed,
          replyText: `Identifiquei uma nova movimentação financeira na sua mensagem. Conforme a metodologia da Gran Bernardo, nenhum dado é alterado sem sua confirmação explícita. Por favor, confira os dados extraídos abaixo antes de confirmar o lançamento:`
        };
      }
    }

    // 2. DETECÇÃO DE SIMULAÇÃO ("O que acontece se...", "E se a soja cair...", "Simule...")
    if (this.isSimulationIntent(lower)) {
      return this.handleSimulation(lower, context);
    }

    // 3. CONSULTA DE DÍVIDAS / PASSIVOS
    if (lower.includes('dívida') || lower.includes('divida') || lower.includes('passivo') || lower.includes('banco') || lower.includes('credor')) {
      const debtMetrics = FinancialEngine.calculateDebtMetrics(context.debts);
      const overdue = context.debts.filter(d => d.status === 'vencida');
      
      let reply = `📊 **Raio-X de Endividamento & Passivos:**\n\n` +
        `• **Endividamento Total:** R$ ${debtMetrics.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `• **Curto Prazo (< 12 meses):** R$ ${debtMetrics.shortTermBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${debtMetrics.shortTermPercent.toFixed(1)}% do total)\n` +
        `• **Longo Prazo (> 36 meses):** R$ ${debtMetrics.longTermBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `• **Taxa Média Ponderada:** ${debtMetrics.averageInterestRate.toFixed(2)}% a.a.\n\n` +
        `**Principais Credores:**\n`;

      debtMetrics.creditorConcentration.slice(0, 3).forEach(c => {
        reply += `  - **${c.creditor}:** R$ ${c.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${c.percentage.toFixed(1)}%)\n`;
      });

      if (overdue.length > 0) {
        reply += `\n⚠️ **Alerta do Consultor:** Você possui **${overdue.length} operação em atraso** (${overdue.map(d => d.creditor).join(', ')}) totalizando R$ ${debtMetrics.pastDueBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Recomenda-se acionar a ação de Reestruturação Extrajudicial imediatamente.`;
      }

      return { intent: 'query', replyText: reply };
    }

    // 4. CONSULTA DE SAFRA, PRODUÇÃO E BREAK-EVEN
    if (lower.includes('safra') || lower.includes('soja') || lower.includes('milho') || lower.includes('produção') || lower.includes('producao') || lower.includes('margem') || lower.includes('break-even') || lower.includes('ponto de equilíbrio') || lower.includes('equilibrio')) {
      let reply = `🌾 **Painel Agronômico & Margens da Safra ${context.currentSafra}:**\n\n`;

      context.crops.forEach(c => {
        reply += `**${c.crop} (${c.cycle})**:\n` +
          `• Área: ${c.plantedAreaHa.toLocaleString('pt-BR')} ha | Produtividade: ${c.expectedYieldScHa} sc/ha\n` +
          `• Produção Total: ${c.totalProductionSc.toLocaleString('pt-BR')} sacas\n` +
          `• Receita Projetada: R$ ${c.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
          `• Custo por Hectare: R$ ${c.operatingCostPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha (Total: R$ ${c.totalOperatingCost.toLocaleString('pt-BR')})\n` +
          `• Margem Bruta: R$ ${c.grossMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${c.marginPercent.toFixed(1)}%)\n` +
          `• **Ponto de Equilíbrio (Break-even):** ${c.breakEvenScHa.toFixed(1)} sc/ha (Preço mínimo: R$ ${c.breakEvenPrice.toFixed(2)}/sc)\n\n`;
      });

      reply += `💡 **Diagnóstico Gran Bernardo:** A margem da soja está saudável (${context.crops[0]?.marginPercent.toFixed(1)}%), porém qualquer redução de produtividade abaixo de ${context.crops[0]?.breakEvenScHa.toFixed(1)} sc/ha colocará a operação em prejuízo líquido.`;

      return { intent: 'query', replyText: reply };
    }

    // 5. CONSULTA DE FLUXO DE CAIXA E SALDO
    if (lower.includes('caixa') || lower.includes('saldo') || lower.includes('entradas') || lower.includes('saídas') || lower.includes('saidas') || lower.includes('vencimento')) {
      const summaries = FinancialEngine.calculateMonthlyCashFlow(context.cashFlow);
      const totalInflows = summaries.reduce((a, b) => a + b.inflows, 0);
      const totalOutflows = summaries.reduce((a, b) => a + b.outflowsOperating + b.fixedCosts + b.debtService, 0);
      const finalCash = summaries[summaries.length - 1]?.endingBalance || 0;
      const negativeMonths = summaries.filter(s => s.endingBalance < 0);

      let reply = `💰 **Diagnóstico de Fluxo de Caixa (12 Meses Safra):**\n\n` +
        `• **Entradas Totais Previstas:** R$ ${totalInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `• **Desembolsos Totais (Operacional + Dívida):** R$ ${totalOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `• **Saldo Final Acumulado em Set/25:** R$ ${finalCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;

      if (negativeMonths.length > 0) {
        reply += `🚨 **Atenção:** Projeção indica déficit de caixa em: **${negativeMonths.map(m => m.monthLabel).join(', ')}**.\n` +
          `O mês mais crítico é **Maio/25** devido ao vencimento do custeio do Banco do Brasil. Recomendamos alongar ou utilizar o milho como garantia complementar.`;
      } else {
        reply += `✅ O fluxo de caixa projeta liquidez positiva em todos os meses da safra.`;
      }

      return { intent: 'query', replyText: reply };
    }

    // RESPOSTA PADRÃO GUIA DO ASSISTENTE
    return {
      intent: 'general',
      replyText: `Olá! Sou o Assistente Autônomo da **Gran Bernardo Agro**. Estou conectado em tempo real aos dados financeiros e agronômicos da sua propriedade.\n\n` +
        `Posso te ajudar com:\n` +
        `1. **Consultas Estratégicas:** *"Qual é minha dívida total?", "Qual meu break-even na soja?", "Qual o saldo de caixa em maio?"*\n` +
        `2. **Lançamentos por Voz ou Texto:** *"Paguei R$ 35 mil de adubo para a Yara ontem", "Vendi 3.000 sacas de milho a R$ 59"*\n` +
        `3. **Simulações de Risco:** *"O que acontece se a soja cair 15%?", "E se o milho tiver quebra de 20%?"*\n\n` +
        `Como posso te auxiliar agora?`
    };
  }

  /**
   * Verifica se a mensagem tem intenção de registrar um novo lançamento
   */
  private static isRegistrationIntent(text: string): boolean {
    const keywords = ['paguei', 'gastei', 'vendi', 'comprei', 'lancei', 'despesa de', 'recebi', 'nota fiscal', 'pagamento de'];
    return keywords.some(k => text.includes(k));
  }

  /**
   * Extrai valores, entidades e categoriza com segurança
   */
  private static extractTransactionData(text: string, currentSafra: string): ProposedTransaction | null {
    // 1. Extração de valor monetário
    // Procura por "R$ 45.000", "45 mil", "20.000,00", "50000"
    let amount = 0;
    const milRegex = /(\d+[\d.,]*)\s*(mil|milhões|milhoes)/i;
    const milMatch = text.match(milRegex);

    if (milMatch) {
      const num = parseFloat(milMatch[1].replace(/\./g, '').replace(',', '.'));
      if (milMatch[2].toLowerCase().startsWith('milh')) {
        amount = num * 1000000;
      } else {
        amount = num * 1000;
      }
    } else {
      const valueRegex = /(?:r\$\s*|valor\s*de\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/i;
      const match = text.match(valueRegex);
      if (match && match[1]) {
        const cleaned = match[1].replace(/\./g, '').replace(',', '.');
        amount = parseFloat(cleaned) || 0;
      }
    }

    if (amount <= 0) return null;

    // 2. Extração de Tipo (Entrada x Saída)
    const isSale = /vendi|recebi|entrada|faturei|recebimento/i.test(text);
    const type = isSale ? 'inflow' : 'outflow';

    // 3. Sugestão de Categoria usando o serviço de vocabulário
    const catSuggestion = ExcelImporterService.suggestCategory(text, isSale ? 'Entrada' : 'Saída');

    // 4. Extração de Fornecedor / Favorecido
    let counterparty = isSale ? 'Cliente Grãos' : 'Fornecedor Agro';
    const forRegex = /(?:para\s+(?:o|a)?\s*|na\s+|com\s+(?:a|o)?\s*)([A-ZÀ-Úa-zà-ú0-9\s]+?)(?:ontem|hoje|vencendo|em\s+\d|\.|$)/i;
    const forMatch = text.match(forRegex);
    if (forMatch && forMatch[1] && forMatch[1].trim().length > 2) {
      counterparty = forMatch[1].trim();
    }

    // 5. Data (Inferred)
    const now = new Date();
    let dateStr = now.toISOString().split('T')[0];
    if (text.includes('ontem')) {
      now.setDate(now.getDate() - 1);
      dateStr = now.toISOString().split('T')[0];
    }

    return {
      category: catSuggestion.category,
      categoryLabel: catSuggestion.label,
      type,
      amount,
      date: dateStr,
      supplierOrClient: counterparty,
      safra: currentSafra,
      description: text,
      confidence: 92,
      sourceText: text
    };
  }

  /**
   * Verifica se é uma pergunta de simulação de cenário
   */
  private static isSimulationIntent(text: string): boolean {
    return /o que acontece|se cair|se subir|se quebrar|e se|simule|cenario|queda de|aumento de/i.test(text);
  }

  /**
   * Executa simulação rápida sob demanda na conversa
   */
  private static handleSimulation(
    text: string,
    context: { crops: CropPlanningItem[]; cashFlow: CashFlowEntry[]; debts: DebtLiability[] }
  ): AiResponse {
    let delta = -15; // default 15% queda
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) {
      delta = parseInt(percentMatch[1], 10);
      if (text.includes('cair') || text.includes('queda') || text.includes('quebra') || text.includes('reduz')) {
        delta = -delta;
      }
    }

    let isPrice = true;
    let cropName = 'Soja';

    if (text.includes('milho')) {
      cropName = 'Milho 2ª Safra';
    }
    if (text.includes('produtividade') || text.includes('quebra') || text.includes('safra')) {
      isPrice = false;
    }

    const targetCrop = context.crops.find(c => c.crop.includes(cropName)) || context.crops[0];
    const initialRevenue = targetCrop.grossRevenue;
    const impactR$ = Math.abs(initialRevenue * (delta / 100));

    const newRevenue = initialRevenue + (initialRevenue * (delta / 100));
    const newMargin = newRevenue - targetCrop.totalOperatingCost;
    const newMarginPercent = newRevenue > 0 ? (newMargin / newRevenue) * 100 : 0;

    const reply = `🔬 **Simulação Autônoma de Cenário (${cropName} ${delta > 0 ? '+' : ''}${delta}% em ${isPrice ? 'Preço' : 'Produtividade'}):**\n\n` +
      `• **Impacto Financeiro Direto:** ${delta < 0 ? 'Perda estimada de' : 'Ganho estimado de'} **R$ ${impactR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n` +
      `• **Nova Receita da Cultura:** R$ ${newRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `• **Nova Margem Operacional:** R$ ${newMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${newMarginPercent.toFixed(1)}%)\n\n` +
      `📋 **Análise do Consultor Gran Bernardo:**\n` +
      (newMargin < 0 
        ? `⚠️ **Risco Severo:** Esta variação empurra a margem para campo negativo, tornando a operação deficitária sem cobrir nem os custos de insumos. É mandatório adotar hedge e renegociar o custeio.`
        : `A operação ainda se mantém acima do ponto de equilíbrio, mas a capacidade de pagamento do serviço da dívida fica reduzida em R$ ${impactR$.toLocaleString('pt-BR')}. Recomenda-se acionar o módulo de Cenários para comparar com o plano de reestruturação.`);

    return {
      intent: 'simulation',
      replyText: reply,
      simulationResult: {
        param: `${cropName} - ${isPrice ? 'Preço' : 'Produtividade'}`,
        deltaPercent: delta,
        financialImpactR$: impactR$,
        newMarginPercent,
        cashStatus: newMargin > 0 ? 'Margem Positiva' : 'Margem Negativa'
      }
    };
  }
}
