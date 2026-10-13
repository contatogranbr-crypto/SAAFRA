// Central de Dados e Importações - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  FileText, 
  Eye, 
  Trash2, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  CashFlowCategory, 
  CashFlowEntry, 
  ImportBatch, 
  ImportPreviewRow, 
  AuditLog 
} from '../types';
import { ExcelImporterService } from '../services/excelImporter';

interface ImportCenterViewProps {
  onImportConfirmed: (entries: CashFlowEntry[], batch: ImportBatch, log: AuditLog) => void;
  onRollbackBatch: (batchId: string) => void;
  importHistory: ImportBatch[];
  currentSafra: string;
}

export const ImportCenterView: React.FC<ImportCenterViewProps> = ({
  onImportConfirmed,
  onRollbackBatch,
  importHistory,
  currentSafra
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1: Upload, 2: Review Staging
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSelectedFile(file);

    try {
      const result = await ExcelImporterService.parseSpreadsheet(file);
      setDetectedColumns(result.detectedColumns);
      setPreviewRows(result.previewRows);
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar arquivo. Verifique o formato enviado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSampleSpreadsheet = async () => {
    // Carregar conjunto de exemplo simulado diretamente
    setIsProcessing(true);
    setTimeout(() => {
      const sampleRows: ImportPreviewRow[] = [
        {
          id: 'row-sample-1',
          rawDate: '2025-01-18',
          rawDescription: 'Adubo NPK 04-30-16 YaraMila',
          rawCategory: 'Fertilizantes',
          rawAmount: 480000,
          rawType: 'Saída',
          rawCounterparty: 'Yara Brasil Fertilizantes',
          suggestedCategory: 'fertilizantes_adubos',
          suggestedCategoryLabel: 'Fertilizantes e Adubos',
          confidence: 96,
          status: 'valid',
          selected: true
        },
        {
          id: 'row-sample-2',
          rawDate: '2025-01-22',
          rawDescription: 'Contrato Venda Soja 10.000 sacas Bunge',
          rawCategory: 'Venda Grãos',
          rawAmount: 1380000,
          rawType: 'Entrada',
          rawCounterparty: 'Bunge Alimentos',
          suggestedCategory: 'receita_soja',
          suggestedCategoryLabel: 'Receita da Venda de Soja',
          confidence: 98,
          status: 'valid',
          selected: true
        },
        {
          id: 'row-sample-3',
          rawDate: '2025-02-05',
          rawDescription: 'Óleo Diesel S10 25.000 L Plantio',
          rawCategory: 'Combustível',
          rawAmount: 155000,
          rawType: 'Saída',
          rawCounterparty: 'Petrorural Distribuidora',
          suggestedCategory: 'combustiveis_lubrificantes',
          suggestedCategoryLabel: 'Combustíveis e Lubrificantes',
          confidence: 95,
          status: 'valid',
          selected: true
        },
        {
          id: 'row-sample-4',
          rawDate: '2025-02-15',
          rawDescription: 'Revisão Motor Trator Case Magnum 340',
          rawCategory: 'Manutenção',
          rawAmount: 84000,
          rawType: 'Saída',
          rawCounterparty: 'Concessionária Campo Forte',
          suggestedCategory: 'manutencao_maquinas',
          suggestedCategoryLabel: 'Manutenção de Máquinas e Implementos',
          confidence: 91,
          status: 'valid',
          selected: true
        },
        {
          id: 'row-sample-5',
          rawDate: '2025-03-20',
          rawDescription: 'Tarifa e Honorários Advocatícios Contratuais',
          rawCategory: 'Outros',
          rawAmount: 22000,
          rawType: 'Saída',
          rawCounterparty: 'Assessoria Jurídica',
          suggestedCategory: 'servicos_terceiros',
          suggestedCategoryLabel: 'Serviços de Terceiros e Operações',
          confidence: 72,
          status: 'ambiguous',
          selected: true
        }
      ];

      setDetectedColumns(['Data', 'Histórico', 'Categoria', 'Valor', 'Tipo', 'Favorecido']);
      setPreviewRows(sampleRows);
      setSelectedFile(new File(['sample'], 'Planilha_Referencia_Gran_Bernardo.xlsx'));
      setCurrentStep(2);
      setIsProcessing(false);
    }, 500);
  };

  const handleToggleRowSelection = (id: string) => {
    setPreviewRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleChangeRowCategory = (id: string, newCat: CashFlowCategory) => {
    const categoryLabels: Record<CashFlowCategory, string> = {
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
      dividas_renegociadas: 'Passivos e Dívidas Renegociadas'
    };

    setPreviewRows(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          suggestedCategory: newCat,
          suggestedCategoryLabel: categoryLabels[newCat] || 'Outros',
          confidence: 100,
          status: 'valid'
        };
      }
      return r;
    }));
  };

  const handleConfirmImport = () => {
    const selectedRows = previewRows.filter(r => r.selected);
    if (selectedRows.length === 0) return;

    const newEntries = ExcelImporterService.convertPreviewToCashFlowEntries(selectedRows, currentSafra, 'farm-01');

    const totalIn = selectedRows.filter(r => r.rawType === 'Entrada').reduce((a, b) => a + b.rawAmount, 0);
    const totalOut = selectedRows.filter(r => r.rawType === 'Saída').reduce((a, b) => a + b.rawAmount, 0);

    const batch: ImportBatch = {
      id: `batch-${Date.now()}`,
      filename: selectedFile?.name || 'Arquivo_Importado.xlsx',
      fileSize: selectedFile?.size || 45200,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      rowCount: newEntries.length,
      status: 'imported',
      totalInflows: totalIn,
      totalOutflows: totalOut,
      sourceType: selectedFile?.name.endsWith('.csv') ? 'CSV' : 'XLSX'
    };

    const auditLog: AuditLog = {
      id: `log-imp-${Date.now()}`,
      timestamp: batch.uploadedAt,
      entityType: 'importacao',
      entityId: batch.id,
      field: batch.filename,
      originalValue: 'Arquivo Staging (Não Confirmado)',
      currentValue: `${newEntries.length} lançamentos importados com sucesso`,
      source: 'import_excel',
      user: 'Dr. Roberto Bernardo (Consultor)',
      reason: `Carga e consolidação de arquivo de fluxo de caixa da safra ${currentSafra}`,
      canRollback: true
    };

    onImportConfirmed(newEntries, batch, auditLog);
    setCurrentStep(1);
    setSelectedFile(null);
    setPreviewRows([]);
  };

  const totalSelectedInflows = previewRows.filter(r => r.selected && r.rawType === 'Entrada').reduce((a, b) => a + b.rawAmount, 0);
  const totalSelectedOutflows = previewRows.filter(r => r.selected && r.rawType === 'Saída').reduce((a, b) => a + b.rawAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Central de Dados & Importação Automatizada</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Fluxo Obrigatório: Enviar Arquivo → Interpretar → Revisar Prévia → Confirmar Ingestão
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => ExcelImporterService.downloadOfficialTemplate()} className="btn btn-secondary">
            <Download size={15} color="#34d399" />
            <span>Baixar Planilha Modelo (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* STEP 1: UPLOAD & PREVIEW SELECTOR */}
      {currentStep === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          
          {/* Drag & Drop Upload Zone */}
          <div className="glass-panel" style={{
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed rgba(52, 211, 153, 0.3)',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Upload size={28} color="#34d399" />
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>
              Solte sua planilha ou documento aqui
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: '18px' }}>
              Suporta planilhas do Excel (<strong>.xlsx</strong>), <strong>.csv</strong>, extratos bancários, relatórios de ERP e demonstrativos em PDF.
            </p>

            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <span>Selecionar Arquivo no Computador</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>

            {isProcessing && (
              <div style={{ marginTop: '16px', color: '#fbbf24', fontSize: '0.82rem' }}>
                Processando dados e identificando colunas...
              </div>
            )}

            {errorMessage && (
              <div style={{ marginTop: '16px', color: '#f87171', fontSize: '0.82rem' }}>
                {errorMessage}
              </div>
            )}
          </div>

          {/* Quick Start / Template Sandbox Card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.1rem' }}>Testar com Modelo Pré-Configurado</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                Se você ainda não possui um arquivo preparado no seu computador, clique abaixo para testar instantaneamente o ciclo completo de auditoria e revisão com uma planilha real da <strong>Gran Bernardo Consultoria</strong>.
              </p>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  O que a IA analisa automaticamente:
                </span>
                <ul style={{ fontSize: '0.78rem', color: 'var(--text-main)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Identificação autônoma de abas e colunas (Data, Valor, Credor)</li>
                  <li>Classificação nas categorias oficiais de insumos e passivos</li>
                  <li>Destaque de lançamentos com baixa confiança (&lt; 75%)</li>
                  <li>Preservação do arquivo original para conformidade de auditoria</li>
                </ul>
              </div>
            </div>

            <button onClick={handleUseSampleSpreadsheet} className="btn btn-gold" style={{ width: '100%' }}>
              <FileSpreadsheet size={16} />
              <span>Carregar Planilha de Demonstração Gran Bernardo</span>
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: STAGING & REVIEW MATRIX (Obrigatório antes de importar) */}
      {currentStep === 2 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-amber">Revisão Prévia</span>
                <h3 style={{ fontSize: '1.15rem' }}>{selectedFile?.name || 'Arquivo'} ({previewRows.length} linhas detectadas)</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Colunas detectadas: <span style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>{detectedColumns.join(' • ')}</span>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                <span style={{ color: '#34d399', display: 'block' }}>
                  Entradas: +R$ {totalSelectedInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ color: '#f87171', display: 'block' }}>
                  Saídas: -R$ {totalSelectedOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                Voltar
              </button>

              <button onClick={handleConfirmImport} className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Confirmar e Importar no Caixa</span>
              </button>
            </div>
          </div>

          {/* Staging Rows Table */}
          <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-3)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '8px 12px', width: '30px' }}></th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Data</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Descrição Original</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Tipo</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Categoria Sugerida pela IA</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff' }}>Valor Extraído</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Favorecido / Fornecedor</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: '#fff' }}>Confiança</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map(row => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: !row.selected ? 'rgba(0,0,0,0.3)' : row.status === 'ambiguous' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      opacity: row.selected ? 1 : 0.5
                    }}
                  >
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => handleToggleRowSelection(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {row.rawDate}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 500 }}>
                      {row.rawDescription}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className={`badge ${row.rawType === 'Entrada' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {row.rawType}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        value={row.suggestedCategory}
                        onChange={(e) => handleChangeRowCategory(row.id, e.target.value as CashFlowCategory)}
                        style={{
                          background: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="receita_soja">Receita da Venda de Soja</option>
                        <option value="receita_milho">Receita da Venda de Milho</option>
                        <option value="fertilizantes_adubos">Fertilizantes e Adubos</option>
                        <option value="sementes">Sementes e Mudas</option>
                        <option value="defensivos_quimicos">Defensivos Químicos</option>
                        <option value="combustiveis_lubrificantes">Combustíveis e Diesel</option>
                        <option value="mao_de_obra_folha">Mão de Obra e Encargos</option>
                        <option value="manutencao_maquinas">Manutenção de Máquinas</option>
                        <option value="fretes_armazenagem">Fretes e Logística</option>
                        <option value="servicos_terceiros">Serviços de Terceiros</option>
                        <option value="financiamento_custeio">Custeio Agrícola Bancário</option>
                        <option value="financiamento_investimento">Finame / Máquinas</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: row.rawType === 'Entrada' ? '#34d399' : '#f87171' }}>
                      R$ {row.rawAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                      {row.rawCounterparty}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span className={`badge ${row.confidence >= 90 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {row.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMPORT HISTORY & ROLLBACK SECTION */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Histórico de Importações & Auditoria de Arquivos</h3>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Arquivos originais preservados. Permite desfazer importação (Rollback) sem apagar logs.
        </p>

        {importHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Nenhuma importação realizada nesta sessão.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {importHistory.map(batch => (
              <div
                key={batch.id}
                style={{
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="#34d399" />
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{batch.filename}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {batch.uploadedAt} • {batch.rowCount} linhas • {(batch.fileSize / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.78rem', textAlign: 'right' }}>
                    <span style={{ color: '#34d399', display: 'block' }}>
                      +R$ {(batch.totalInflows / 1000).toFixed(0)}k
                    </span>
                    <span style={{ color: '#f87171', display: 'block' }}>
                      -R$ {(batch.totalOutflows / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <span className={`badge ${batch.status === 'imported' ? 'badge-green' : 'badge-amber'}`}>
                    {batch.status === 'imported' ? 'Ativo' : 'Revertido'}
                  </span>

                  {batch.status === 'imported' && (
                    <button
                      onClick={() => onRollbackBatch(batch.id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                      title="Desfazer esta importação e remover os lançamentos do fluxo de caixa"
                    >
                      <RotateCcw size={13} />
                      <span>Desfazer Importação</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
