// Serviço de Importação de Planilhas e Documentos - Gran Bernardo Agro
// Suporta arquivos XLSX, CSV, detecção inteligente de colunas, categorização e exportação de templates

import * as XLSX from 'xlsx';
import { CashFlowCategory, CashFlowEntry, ImportPreviewRow } from '../types';

export class ExcelImporterService {

  /**
   * Mapeamento de categorias e palavras-chave do agronegócio
   */
  private static categoryKeywords: Record<CashFlowCategory, string[]> = {
    // Entradas
    receita_soja: ['soja', 'venda soja', 'grãos soja', 'entrega soja', 'cargill soja', 'bunge soja', 'ldc'],
    receita_milho: ['milho', 'venda milho', 'safrinha', 'grãos milho', 'brf milho', 'amaggi milho'],
    receita_outras_culturas: ['sorgo', 'trigo', 'girassol', 'gado', 'bezerro', 'boi gordo', 'algodão'],
    recebiveis_cpr: ['cpr', 'recebivel', 'adiantamento contrato', 'trava de preco'],
    outras_entradas: ['reembolso', 'rendimento', 'venda ativo', 'aluguel pasto'],

    // Custos Operacionais
    sementes: ['semente', 'mudas', 'germinação', 'dekalb', 'pioneer', 'intacta', 'xtend'],
    fertilizantes_adubos: ['adubo', 'fertilizante', 'npk', 'cloreto', 'fosfato', 'calcario', 'gesso', 'yara', 'mosaic'],
    defensivos_quimicos: ['defensivo', 'herbicida', 'fungicida', 'inseticida', 'glifosato', 'bayer', 'syngenta', 'basf', 'corteva'],
    combustiveis_lubrificantes: ['diesel', 'oleo', 'combustivel', 's10', 'gasolina', 'graxa', 'lubrificante', 'abastecimento'],
    mao_de_obra_folha: ['folha', 'salario', 'rescisao', 'ferias', '13o', 'diaria', 'operador', 'tratorista', 'campeiro'],
    manutencao_maquinas: ['manutencao', 'pecas', 'trator', 'colheitadeira', 'revisao', 'john deere', 'case', 'valtra', 'oficina'],
    fretes_armazenagem: ['frete', 'transporte', 'transagro', 'armazenagem', 'secagem', 'padronizacao', 'estadia'],
    servicos_terceiros: ['pulverizacao', 'aviacao agricola', 'plantio terceirizado', 'topografia', 'analise de solo'],

    // Custos Fixos & Estruturais
    arrendamento_terras: ['arrendamento', 'aluguel de terra', 'renda da terra', 'gleba'],
    pro_labore_socios: ['pro labore', 'retirada', 'distribuicao lucros', 'socio'],
    energia_eletrica: ['energia', 'energisa', 'cemig', 'enel', 'luz fazenda', 'pivo'],
    impostos_funrural_itr: ['funrural', 'itr', 'darf', 'imposto', 'icms rural', 'tributo', 'receita federal'],
    seguros_patrimoniais: ['seguro', 'apolice', 'seguro agricola', 'protecao lavoura'],

    // Dívidas & Financiamentos
    financiamento_custeio: ['custeio', 'banco do brasil', 'sicredi', 'sicoob', 'pronamp', 'pronaf'],
    financiamento_investimento: ['finame', 'investimento', 'banco john deere', 'moderfrota', 'trator parcelamento'],
    juros_encargos_bancarios: ['juros', 'tarifa bancaria', 'iof', 'encargo', 'comissao'],
    liquidacao_cpr_barter: ['liquidacao cpr', 'barter', 'troca de graos', 'entrega fisica'],
    dividas_renegociadas: ['renegociacao', 'acordo', 'parcelamento passivo', 'recuperacao'],
    silo_armazenagem: ['silo', 'klepper', 'secador', 'estrutura metalica', 'moega'],
    emprestimo_terceiros: ['mutuo', 'emprestimo pessoal', 'terceiros', 'juros 1.5'],
    cessao_credito_bunge: ['cessao', 'bunge', 'credito trading']
  };

  private static categoryLabels: Record<CashFlowCategory, string> = {
    receita_soja: 'Receita da Venda de Soja',
    receita_milho: 'Receita da Venda de Milho',
    receita_outras_culturas: 'Receita de Outras Culturas / Pecuária',
    recebiveis_cpr: 'Recebíveis Futuros (CPR / Contratos)',
    outras_entradas: 'Outras Entradas Operacionais',

    sementes: 'Sementes e Mudas',
    fertilizantes_adubos: 'Fertilizantes e Adubos',
    defensivos_quimicos: 'Defensivos Químicos e Biológicos',
    combustiveis_lubrificantes: 'Combustíveis e Lubrificantes',
    mao_de_obra_folha: 'Mão de Obra e Encargos',
    manutencao_maquinas: 'Manutenção de Máquinas e Implementos',
    fretes_armazenagem: 'Fretes e Logística Rural',
    servicos_terceiros: 'Serviços de Terceiros e Operações',

    arrendamento_terras: 'Arrendamentos de Terras',
    pro_labore_socios: 'Pró-labore e Retiradas de Sócios',
    energia_eletrica: 'Energia Elétrica e Pivôs',
    impostos_funrural_itr: 'Impostos e Encargos (Funrural/ITR)',
    seguros_patrimoniais: 'Seguros Rurais e Patrimoniais',

    financiamento_custeio: 'Financiamento de Custeio Agrícola',
    financiamento_investimento: 'Financiamento de Investimento / Máquinas',
    juros_encargos_bancarios: 'Juros e Encargos Bancários',
    liquidacao_cpr_barter: 'Liquidação de Barter / CPR',
    dividas_renegociadas: 'Passivos e Dívidas Renegociadas',
    silo_armazenagem: 'Silos e Armazenagem (Klepper)',
    emprestimo_terceiros: 'Empréstimos de Terceiros / Mútuo',
    cessao_credito_bunge: 'Cessão de Crédito / Barter Bunge'
  };

  /**
   * Analisa texto e sugere a categoria com base em vocabulário agro
   */
  static suggestCategory(text: string, type: 'Entrada' | 'Saída'): { category: CashFlowCategory; label: string; confidence: number } {
    const cleanText = text.toLowerCase();

    if (type === 'Entrada') {
      if (cleanText.includes('milho')) return { category: 'receita_milho', label: this.categoryLabels['receita_milho'], confidence: 96 };
      if (cleanText.includes('soja')) return { category: 'receita_soja', label: this.categoryLabels['receita_soja'], confidence: 96 };
      if (cleanText.includes('cpr') || cleanText.includes('contrato')) return { category: 'recebiveis_cpr', label: this.categoryLabels['recebiveis_cpr'], confidence: 90 };
      return { category: 'outras_entradas', label: this.categoryLabels['outras_entradas'], confidence: 75 };
    }

    // Busca nas categorias de saída
    for (const [catKey, keywords] of Object.entries(this.categoryKeywords)) {
      for (const kw of keywords) {
        if (cleanText.includes(kw)) {
          const category = catKey as CashFlowCategory;
          return {
            category,
            label: this.categoryLabels[category],
            confidence: 94
          };
        }
      }
    }

    // Fallback inteligente
    return {
      category: 'servicos_terceiros',
      label: this.categoryLabels['servicos_terceiros'],
      confidence: 60
    };
  }

  /**
   * Lê um arquivo Excel (XLSX ou CSV) e gera prévia detalhada com colunas identificadas
   */
  static async parseSpreadsheet(file: File): Promise<{
    sheets: string[];
    previewRows: ImportPreviewRow[];
    detectedColumns: string[];
  }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const sheetNames = workbook.SheetNames;
    const firstSheetName = sheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Converte para JSON
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      throw new Error('A planilha enviada está vazia ou não contém linhas de dados.');
    }

    const detectedColumns = Object.keys(rawData[0]);

    // Localizar nomes de colunas flexíveis
    const dateCol = detectedColumns.find(c => /data|vencimento|periodo|dia/i.test(c)) || detectedColumns[0];
    const descCol = detectedColumns.find(c => /descricao|historico|detalhe|item|produto/i.test(c)) || detectedColumns[1];
    const valCol = detectedColumns.find(c => /valor|quantia|total|preco|montante/i.test(c)) || detectedColumns[2];
    const typeCol = detectedColumns.find(c => /tipo|fluxo|d\/c|natureza|e\/s/i.test(c));
    const catCol = detectedColumns.find(c => /categoria|conta|grupo|classificacao/i.test(c));
    const counterpartyCol = detectedColumns.find(c => /fornecedor|cliente|favorecido|sacado|banco|credor/i.test(c));

    const previewRows: ImportPreviewRow[] = [];

    rawData.forEach((row, idx) => {
      let rawDate = String(row[dateCol] || '');
      // Normalizar datas
      if (rawDate.includes('T')) {
        rawDate = rawDate.split('T')[0];
      } else if (!rawDate || rawDate.length < 5) {
        rawDate = new Date().toISOString().split('T')[0];
      }

      const rawDescription = String(row[descCol] || `Lançamento ${idx + 1}`);
      let rawAmount = 0;
      const valRaw = row[valCol];
      if (typeof valRaw === 'number') {
        rawAmount = Math.abs(valRaw);
      } else if (typeof valRaw === 'string') {
        const cleaned = valRaw.replace(/[R$\s.]/g, '').replace(',', '.');
        rawAmount = Math.abs(parseFloat(cleaned) || 0);
      }

      // Detectar se é entrada ou saída
      let rawType: 'Entrada' | 'Saída' = 'Saída';
      if (typeCol && row[typeCol]) {
        const tStr = String(row[typeCol]).toLowerCase();
        if (tStr.includes('ent') || tStr.includes('c') || tStr.includes('rec') || tStr.includes('venda')) {
          rawType = 'Entrada';
        }
      } else {
        // Inferir pelo texto da descrição
        if (/venda|recebimento|faturamento|cpr|adiantamento/i.test(rawDescription)) {
          rawType = 'Entrada';
        }
      }

      const rawCategory = catCol && row[catCol] ? String(row[catCol]) : '';
      const rawCounterparty = counterpartyCol && row[counterpartyCol] ? String(row[counterpartyCol]) : 'Geral';

      const suggestion = this.suggestCategory(`${rawDescription} ${rawCategory}`, rawType);

      previewRows.push({
        id: `row-${Date.now()}-${idx}`,
        rawDate,
        rawDescription,
        rawCategory: rawCategory || suggestion.label,
        rawAmount: rawAmount || 15000,
        rawType,
        rawCounterparty,
        suggestedCategory: suggestion.category,
        suggestedCategoryLabel: suggestion.label,
        confidence: suggestion.confidence,
        status: rawAmount > 0 ? (suggestion.confidence < 75 ? 'ambiguous' : 'valid') : 'ambiguous',
        selected: true
      });
    });

    return {
      sheets: sheetNames,
      previewRows,
      detectedColumns
    };
  }

  /**
   * Converte as linhas revisadas e aprovadas para entradas definitivas de Fluxo de Caixa
   */
  static convertPreviewToCashFlowEntries(
    rows: ImportPreviewRow[],
    safra: string = '2024/2025',
    farmId: string = 'farm-01'
  ): CashFlowEntry[] {
    return rows
      .filter(r => r.selected)
      .map(r => {
        const month = r.rawDate.slice(0, 7) || '2025-01';
        return {
          id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          date: r.rawDate,
          month,
          description: r.rawDescription,
          category: r.suggestedCategory,
          categoryLabel: r.suggestedCategoryLabel,
          type: r.rawType === 'Entrada' ? 'inflow' : 'outflow',
          expectedAmount: r.rawAmount,
          realizedAmount: r.rawAmount,
          status: 'realizado',
          safra,
          farmId,
          supplierOrClient: r.rawCounterparty || 'Fornecedor',
          confidence: r.confidence,
          source: 'import_excel'
        };
      });
  }

  /**
   * Gera e baixa a planilha oficial modelo da Gran Bernardo Agro
   */
  static downloadOfficialTemplate() {
    const templateRows = [
      ['Data', 'Histórico / Descrição', 'Tipo', 'Categoria Sugerida', 'Valor (R$)', 'Fornecedor / Cliente', 'Safra', 'Observações'],
      ['2025-01-15', 'Venda Soja 15.000 sacas Bunge', 'Entrada', 'Receita da Venda de Soja', 2040000, 'Bunge Alimentos', '2024/2025', 'Contrato a termo fixado'],
      ['2025-01-20', 'Adubo Cloreto de Potássio KCL', 'Saída', 'Fertilizantes e Adubos', 450000, 'Mosaic Fertilizantes', '2024/2025', 'Entrega Fazenda Santa Maria'],
      ['2025-02-10', 'Óleo Diesel S10 Colheita Soja', 'Saída', 'Combustíveis e Lubrificantes', 275000, 'Distribuidora Petrorural', '2024/2025', '45.000 litros'],
      ['2025-03-25', 'Parcela Finame John Deere Colheitadeira', 'Saída', 'Financiamento de Investimento / Máquinas', 480000, 'Banco John Deere', '2024/2025', 'Contrato JD-FINAME-77401'],
      ['2025-05-20', 'Amortização Custeio Agrícola Pronamp', 'Saída', 'Financiamento de Custeio Agrícola', 3800000, 'Banco do Brasil', '2024/2025', 'Vencimento principal safra'],
      ['2025-07-15', 'Venda Milho 50.000 sacas BRF', 'Entrada', 'Receita da Venda de Milho', 2900000, 'BRF Foods', '2024/2025', 'Entrega FOB Fazenda']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateRows);

    // Ajustar larguras das colunas
    worksheet['!cols'] = [
      { wch: 12 }, // Data
      { wch: 40 }, // Histórico
      { wch: 10 }, // Tipo
      { wch: 35 }, // Categoria
      { wch: 15 }, // Valor
      { wch: 25 }, // Fornecedor/Cliente
      { wch: 12 }, // Safra
      { wch: 30 }  // Observações
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fluxo_Caixa_Gran_Bernardo');

    // Salvar e acionar download no navegador
    XLSX.writeFile(workbook, 'Gran_Bernardo_Agro_Modelo_Fluxo_Caixa.xlsx');
  }

  /**
   * Exporta todo o fluxo de caixa consolidado para Excel
   */
  static exportCurrentCashFlowToExcel(entries: CashFlowEntry[]) {
    const data = entries.map(e => ({
      'ID': e.id,
      'Data': e.date,
      'Mês': e.month,
      'Descrição': e.description,
      'Tipo': e.type === 'inflow' ? 'Entrada' : 'Saída',
      'Categoria': e.categoryLabel,
      'Valor Previsto (R$)': e.expectedAmount,
      'Valor Realizado (R$)': e.realizedAmount ?? e.expectedAmount,
      'Status': e.status,
      'Favorecido / Fornecedor': e.supplierOrClient,
      'Safra': e.safra,
      'Origem': e.source
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fluxo_Caixa_Consolidado');
    XLSX.writeFile(workbook, 'Gran_Bernardo_Fluxo_Caixa_Relatorio.xlsx');
  }
}
