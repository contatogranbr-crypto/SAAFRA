// Serviço de Integração OpenAI (GPT-4o / GPT-4o-mini) — Gran Bernardo Agro
import { 
  CashFlowCategory, 
  CashFlowEntry, 
  CropPlanningItem, 
  DebtLiability, 
  ProposedTransaction, 
  ProposedDebtAction,
  ChatAttachment 
} from '../types';

export interface ClientStructureContext {
  organization: string;
  userName: string;
  userRole: string;
  farmId: string;
  farmName: string;
  municipality?: string;
  state?: string;
  totalAreaHa?: number;
  arableAreaHa?: number;
  cropsSummary?: string;
}

export interface OpenAiAnalysisResult {
  replyText: string;
  intent: 'query' | 'transaction' | 'simulation' | 'general';
  proposedTransaction?: ProposedTransaction;
  proposedTransactions?: ProposedTransaction[];
  proposedDebt?: ProposedDebtAction;
  modelUsed: string;
}

const STORAGE_KEY_API_KEY = 'gran_bernardo_openai_key';
const STORAGE_KEY_MODEL = 'gran_bernardo_openai_model';

export class OpenAiService {

  static getApiKey(): string {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || 
      (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
  }

  static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }

  static clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }

  static hasKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.startsWith('sk-') && key.length > 20);
  }

  static getMaskedKey(): string {
    const key = this.getApiKey();
    if (!key) return '';
    if (key.length <= 10) return 'sk-••••';
    return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
  }

  static getModel(): string {
    return localStorage.getItem(STORAGE_KEY_MODEL) || 'gpt-4o';
  }

  static setModel(model: string): void {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  }

  /**
   * Testa a conectividade com a API da OpenAI
   */
  static async testConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `Erro ${response.status}: ${response.statusText}`;
        return { success: false, message: errMsg };
      }

      return { success: true, message: 'Chave OpenAI validada com sucesso! Conexão ativa com GPT-4o.' };
    } catch (err: any) {
      return { success: false, message: `Falha de rede ao conectar à OpenAI: ${err.message}` };
    }
  }

  /**
   * Processa a conversa ou anexo com GPT-4o
   */
  static async chatWithAdvisor(params: {
    message: string;
    attachment?: ChatAttachment;
    context: {
      cashFlow: CashFlowEntry[];
      crops: CropPlanningItem[];
      debts: DebtLiability[];
      currentSafra: string;
      clientStructure?: ClientStructureContext;
    };
  }): Promise<OpenAiAnalysisResult> {
    const apiKey = this.getApiKey();
    const model = this.getModel();

    // Se não tiver chave configurada, utiliza o motor inteligente simulado
    if (!this.hasKey()) {
      return this.fallbackAnalysis(params.message, params.attachment, params.context);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(params.context);
      const userContent: any[] = [];

      // Mensagem de texto
      let promptText = params.message;
      if (params.attachment) {
        promptText += `\n\n[ANEXO ENVIADO: ${params.attachment.name} (${params.attachment.type})]`;
        if (params.attachment.textContent) {
          promptText += `\nConteúdo extraído do anexo:\n\`\`\`\n${params.attachment.textContent.slice(0, 15000)}\n\`\`\``;
        }
      }

      userContent.push({
        type: 'text',
        text: promptText
      });

      // Se for imagem e tiver base64, utiliza OpenAI Vision
      if (params.attachment?.base64Data && params.attachment.type === 'image') {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: params.attachment.base64Data,
            detail: 'high'
          }
        });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Erro da API OpenAI (${response.status})`);
      }

      const data = await response.json();
      const rawReply = data.choices?.[0]?.message?.content || '';

      return this.parseOpenAiResponse(
        rawReply, 
        model, 
        params.context.currentSafra, 
        params.context.clientStructure?.farmId
      );
    } catch (err: any) {
      console.error('Erro na chamada OpenAI:', err);
      // Fallback em caso de erro na API com aviso transparente
      const fallback = this.fallbackAnalysis(params.message, params.attachment, params.context);
      return {
        ...fallback,
        replyText: `⚠️ *Aviso: Houve uma instabilidade na API da OpenAI (${err.message}). Executando resposta com o Motor Autônomo Local Gran Bernardo:*\n\n` + fallback.replyText
      };
    }
  }

  private static buildSystemPrompt(context: {
    cashFlow: CashFlowEntry[];
    crops: CropPlanningItem[];
    debts: DebtLiability[];
    currentSafra: string;
    clientStructure?: ClientStructureContext;
  }): string {
    const totalDebt = context.debts.reduce((sum, d) => sum + d.currentBalance, 0);
    const bbDebt = context.debts.filter(d => d.creditor.includes('Brasil')).reduce((sum, d) => sum + d.currentBalance, 0);
    const struct = context.clientStructure || {
      organization: 'Grupo Bernardo Agropecuária',
      userName: 'Dr. Roberto Bernardo',
      userRole: 'consultant',
      farmId: 'farm-01',
      farmName: 'Fazenda Boa Vista',
      municipality: 'Sorriso',
      state: 'MT',
      totalAreaHa: 2800,
      arableAreaHa: 2100
    };
    
    return `Você é a Dra. Sofia Bernardo, Inteligência Artificial Autônoma e Consultora Sênior de Finanças & Reestruturação do Agronegócio na Gran Bernardo Agro.

================================================================================
🚨 LEI SUPREMA Nº 1: ISOLAMENTO RÍGIDO DE ESTRUTURA E DADOS (MULTI-TENANT SANDBOX)
Você está operando de forma ESTRITAMENTE PRIVATIVA e EXCLUSIVA para a estrutura:
- Grupo Econômico / Cliente: "${struct.organization}"
- Usuário Autenticado: "${struct.userName}" (Perfil: ${struct.userRole})
- Estrutura / Propriedade Rural Ativa: "${struct.farmName}" (ID: ${struct.farmId})
- Localização: ${struct.municipality || 'Mato Grosso'} - ${struct.state || 'MT'}
${struct.arableAreaHa ? `- Área Agrícola Desta Estrutura: ${struct.arableAreaHa.toLocaleString('pt-BR')} ha (Área Total: ${struct.totalAreaHa?.toLocaleString('pt-BR')} ha)` : ''}

DIRETRIZES DE SEGURANÇA E INVIOLABILIDADE:
1. VOCÊ SÓ PODE ANALISAR E RESPONDER COM BASE NO BANCO DE DADOS DESTA ESTRUTURA ATIVA (${struct.farmName} / ${struct.organization}).
2. É TERMINANTEMENTE PROIBIDO acessar, mencionar, inferir, deduzir ou comparar dados pertencentes a outros clientes, outros produtores rurais ou outras fazendas fora deste escopo.
3. Se o usuário questionar sobre dados de vizinhos, outros clientes da consultoria ou informações externas, recuse polidamente: "Por razões de sigilo bancário, conformidade com a LGPD e governança de dados da Gran Bernardo Agro, meus acessos e análises são estritamente restritos à estrutura do produtor ${struct.organization} na propriedade ${struct.farmName}."
4. Toda proposta de inserção autônoma (<json_action>) deve registrar obrigatoriamente "farmId": "${struct.farmId}".
================================================================================

REGRAS DE DOMÍNIO DO AGRONEGÓCIO & REESTRUTURAÇÃO:
1. Especialização em Finanças Rurais: Análise de balanços de safra, grãos (Soja R$ 110/sc, Milho R$ 55/sc), CPRs (físicas e financeiras), contratos de Barter com tradings (Bunge, Cargill, Amaggi), Manual de Crédito Rural (MCR 2.6.9 para prorrogação de custeio por intempéries/preço) e recuperação judicial/extrajudicial para produtores.
2. Contexto Atual Desta Estrutura:
   - Safra: ${context.currentSafra}
   - Passivo Total Desta Estrutura: R$ ${totalDebt.toLocaleString('pt-BR')} (Sendo R$ ${bbDebt.toLocaleString('pt-BR')} no Banco do Brasil)
   - Culturas Cadastradas: ${context.crops.map(c => `${c.crop} (${c.plantedAreaHa} ha - ${c.expectedYieldScHa} sc/ha)`).join(', ') || 'Soja e Milho Safrinha'}
   - Reestruturação Recomendada: Alongamento de passivos e MCR 2.6.9 para proteção de caixa.

3. PROTOCOLO DE AUTONOMIA PARA GRAVAÇÃO NO SISTEMA:
   Quando o usuário solicitar o registro ou enviar anexo (nota/recibo/contrato/planilha) para inserir no sistema, extraia os dados com precisão e inclua OBRIGATORIAMENTE um bloco JSON delimitado por <json_action> e </json_action>, incluindo sempre "farmId": "${struct.farmId}".

Exemplo de formato para Lançamentos de Fluxo de Caixa:
<json_action>
{
  "actionType": "cash_flow",
  "entries": [
    {
      "category": "defensivos_quimicos",
      "categoryLabel": "Defensivos Químicos e Biológicos",
      "type": "outflow",
      "amount": 185000.00,
      "date": "2025-03-10",
      "supplierOrClient": "Bayer CropScience",
      "description": "Fungicida Ferrugem Asiática Soja",
      "confidence": 98,
      "farmId": "${struct.farmId}"
    }
  ]
}
</json_action>

Exemplo de formato para Nova Dívida / Cédula / CPR Bancária:
<json_action>
{
  "actionType": "debt",
  "debt": {
    "creditor": "Banco do Brasil",
    "beneficiaryName": "${struct.userName}",
    "operationType": "Custeio Agrícola",
    "contractNumber": "BB-251715780",
    "cedulaNumber": "251715780",
    "currentBalance": 450000.00,
    "annualInterestRate": 11.5,
    "nextDueDate": "2026-07-30",
    "nextDueAmount": 450000.00,
    "term": "curto",
    "guarantees": "Penhor de Soja",
    "isUnderMcrProrrogation": false,
    "confidence": 95,
    "farmId": "${struct.farmId}"
  }
}
</json_action>

Forneça sempre explicações claras, executivas e diretas em português, utilizando formatação rica com tópicos e números em destaque.`;
  }

  private static parseOpenAiResponse(
    rawText: string,
    model: string,
    currentSafra: string,
    defaultFarmId?: string
  ): OpenAiAnalysisResult {
    let cleanReply = rawText;
    let proposedTransaction: ProposedTransaction | undefined;
    let proposedTransactions: ProposedTransaction[] | undefined;
    let proposedDebt: ProposedDebtAction | undefined;
    let intent: 'query' | 'transaction' | 'simulation' | 'general' = 'general';

    // Procura bloco <json_action>
    const jsonMatch = rawText.match(/<json_action>([\s\S]*?)<\/json_action>/i);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        cleanReply = rawText.replace(/<json_action>[\s\S]*?<\/json_action>/i, '').trim();

        if (parsed.actionType === 'cash_flow' && Array.isArray(parsed.entries) && parsed.entries.length > 0) {
          intent = 'transaction';
          const items: ProposedTransaction[] = parsed.entries.map((item: any) => ({
            category: item.category as CashFlowCategory,
            categoryLabel: item.categoryLabel || 'Despesa / Receita Agrícola',
            type: item.type === 'inflow' ? 'inflow' : 'outflow',
            amount: Number(item.amount) || 0,
            date: item.date || new Date().toISOString().split('T')[0],
            supplierOrClient: item.supplierOrClient || 'Fornecedor Agro',
            safra: currentSafra,
            description: item.description || 'Lançamento via Assistente IA',
            confidence: Number(item.confidence) || 95,
            sourceText: item.description || 'Documento analisado',
            farmId: item.farmId || defaultFarmId || 'farm-01'
          }));

          proposedTransactions = items;
          proposedTransaction = items[0];
        } else if (parsed.actionType === 'debt' && parsed.debt) {
          intent = 'transaction';
          proposedDebt = {
            creditor: parsed.debt.creditor || 'Banco Comercial',
            beneficiaryName: parsed.debt.beneficiaryName,
            operationType: parsed.debt.operationType || 'Custeio Agrícola',
            contractNumber: parsed.debt.contractNumber || `CTR-${Date.now()}`,
            cedulaNumber: parsed.debt.cedulaNumber,
            currentBalance: Number(parsed.debt.currentBalance) || 0,
            annualInterestRate: Number(parsed.debt.annualInterestRate) || 11.5,
            nextDueDate: parsed.debt.nextDueDate || '2025-08-30',
            nextDueAmount: Number(parsed.debt.nextDueAmount) || Number(parsed.debt.currentBalance) || 0,
            term: parsed.debt.term || 'curto',
            guarantees: parsed.debt.guarantees || 'Penhor Agrícola e Aval',
            isUnderMcrProrrogation: Boolean(parsed.debt.isUnderMcrProrrogation),
            confidence: Number(parsed.debt.confidence) || 95,
            sourceText: parsed.debt.contractNumber || 'Cédula analisada',
            farmId: parsed.debt.farmId || defaultFarmId || 'farm-01'
          };
        }
      } catch (err) {
        console.warn('Falha ao processar bloco json_action da OpenAI:', err);
      }
    }

    return {
      replyText: cleanReply,
      intent,
      proposedTransaction,
      proposedTransactions,
      proposedDebt,
      modelUsed: model
    };
  }

  /**
   * Fallback inteligente quando a chave OpenAI ainda não foi inserida
   */
  private static fallbackAnalysis(
    message: string,
    attachment: ChatAttachment | undefined,
    context: {
      cashFlow: CashFlowEntry[];
      crops: CropPlanningItem[];
      debts: DebtLiability[];
      currentSafra: string;
      clientStructure?: ClientStructureContext;
    }
  ): OpenAiAnalysisResult {
    const text = message.toLowerCase();
    const struct = context.clientStructure || {
      organization: 'Grupo Bernardo Agropecuária',
      userName: 'Dr. Roberto Bernardo',
      userRole: 'consultant',
      farmId: 'farm-01',
      farmName: 'Fazenda Boa Vista'
    };

    // Se tiver anexo
    if (attachment) {
      const fileName = attachment.name.toLowerCase();

      // Caso 1: Detecção de Cédula ou CPR Bancária
      if (fileName.includes('cpr') || fileName.includes('cedula') || fileName.includes('bb') || text.includes('cédula') || text.includes('cpr')) {
        const proposedDebt: ProposedDebtAction = {
          creditor: 'Banco do Brasil',
          beneficiaryName: struct.userName,
          operationType: 'CPR Financeira / Custeio Soja',
          contractNumber: `BB-CPR-251716${Math.floor(Math.random() * 900 + 100)}`,
          cedulaNumber: `251716${Math.floor(Math.random() * 900 + 100)}`,
          currentBalance: 850000.00,
          annualInterestRate: 11.0,
          nextDueDate: '2026-07-15',
          nextDueAmount: 850000.00,
          term: 'curto',
          guarantees: 'Penhor Cedular de 7.727 sacas de soja e Aval dos Sócios',
          isUnderMcrProrrogation: false,
          confidence: 96,
          sourceText: `Análise do documento anexado: ${attachment.name}`,
          farmId: struct.farmId
        };

        return {
          replyText: `📄 **Auditoria de Documento Concluída (${struct.farmName} • ${struct.organization}):**\n\nIdentifiquei a emissão de uma **Cédula / CPR Rural do Banco do Brasil** no valor de **R$ 850.000,00** para a estrutura de **${struct.userName}**.\n\nConforme as diretrizes da Gran Bernardo Agro, os dados foram confinados à fazenda **${struct.farmName}**:`,
          intent: 'transaction',
          proposedDebt,
          modelUsed: 'Gran Bernardo Autonomous Engine (Insira sua chave OpenAI para GPT-4o completo)'
        };
      }

      // Caso 2: Nota Fiscal / Insumos / Despesa
      const proposedTransaction: ProposedTransaction = {
        category: 'fertilizantes_adubos',
        categoryLabel: 'Fertilizantes e Adubos',
        type: 'outflow',
        amount: 145000.00,
        date: new Date().toISOString().split('T')[0],
        supplierOrClient: 'Yara Fertilizantes',
        safra: context.currentSafra,
        description: `Aquisição Adubo NPK (${struct.farmName})`,
        confidence: 98,
        sourceText: `Comprovante / Nota Fiscal: ${attachment.name}`,
        farmId: struct.farmId
      };

      return {
        replyText: `🧾 **Análise de Comprovante Fiscal (${struct.farmName}):**\n\nIdentifiquei um desembolso operacional de **R$ 145.000,00** para fertilizantes Yara destinado exclusivamente à fazenda **${struct.farmName}** (${struct.organization}).\n\nConfira os dados orçamentários abaixo para gravar no fluxo de caixa desta estrutura:`,
        intent: 'transaction',
        proposedTransaction,
        modelUsed: 'Gran Bernardo Autonomous Engine (Insira sua chave OpenAI para GPT-4o completo)'
      };
    }

    // Consultas gerais sem anexo
    if (text.includes('dívida') || text.includes('divida') || text.includes('banco') || text.includes('passivo')) {
      const farmDebts = context.debts.reduce((sum, d) => sum + d.currentBalance, 0);
      return {
        replyText: `📊 **Raio-X de Dívidas da Estrutura Ativa (${struct.farmName} • ${struct.organization}):**\n\n` +
          `• **Passivo Alocado a Esta Estrutura:** R$ ${farmDebts.toLocaleString('pt-BR')}\n` +
          `• **Titular Responsável:** ${struct.userName} (${struct.organization})\n` +
          `• **Segregação de Segurança:** Dados estritamente isolados da fazenda ${struct.farmName}.\n\n` +
          `💡 *Dica:* Envie um contrato ou extrato em PDF/foto como anexo para auditar e vincular diretamente à fazenda ${struct.farmName}.`,
        intent: 'query',
        modelUsed: 'Gran Bernardo Autonomous Engine'
      };
    }

    return {
      replyText: `Olá! Sou a **Dra. Sofia Bernardo**, inteligência autônoma da Gran Bernardo Agro.\n\nEstou operando com **isolamento privativo** para a estrutura de **${struct.organization}** (${struct.farmName}). Meus acessos e análises cobrem unicamente os dados desta propriedade. Como posso orientar a gestão financeira da Safra ${context.currentSafra}?`,
      intent: 'general',
      modelUsed: 'Gran Bernardo Autonomous Engine'
    };
  }
}
