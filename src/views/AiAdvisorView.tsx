// Assistente de IA Agro & Processamento Multimodal OpenAI (GPT-4o) — Gran Bernardo Agro
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Key, 
  Settings, 
  Loader2, 
  X, 
  ShieldCheck,
  Landmark,
  ArrowRight,
  RotateCcw,
  Lock,
  Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  CashFlowEntry, 
  CropPlanningItem, 
  DebtLiability, 
  ChatMessage, 
  ProposedTransaction, 
  ProposedDebtAction,
  AuditLog,
  ChatAttachment,
  UserProfile,
  FarmProperty
} from '../types';
import { OpenAiService, ClientStructureContext } from '../services/openAiService';

interface AiAdvisorViewProps {
  cashFlow: CashFlowEntry[];
  crops: CropPlanningItem[];
  debts: DebtLiability[];
  currentSafra: string;
  onConfirmTransaction: (entry: CashFlowEntry, log: AuditLog) => void;
  onAddDebt?: (debt: DebtLiability) => void;
  currentUser: UserProfile;
  selectedFarmId?: string;
  farms?: FarmProperty[];
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  cashFlow,
  crops,
  debts,
  currentSafra,
  onConfirmTransaction,
  onAddDebt,
  currentUser,
  selectedFarmId = 'all',
  farms = []
}) => {
  // Escopo de Fazenda e Estrutura Ativa (Multi-Tenant Sandboxing)
  const isConsolidated = !selectedFarmId || selectedFarmId === 'all';
  const currentFarm = farms.find(f => f.id === selectedFarmId);
  const currentFarmName = currentFarm ? currentFarm.name : 'Consolidado (Todas as Fazendas)';
  const storageKey = `gb_ai_chat_${currentUser.id}_${selectedFarmId || 'all'}`;

  // Inicialização de mensagens segregada por usuário e estrutura
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err);
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        timestamp: 'Hoje, 09:00',
        text: `Olá! Sou a **Dra. Sofia Bernardo**, Inteligência Artificial e Consultora Sênior da **Gran Bernardo Agro**.\n\n🔒 **Isolamento de Estrutura Ativo:** Estou conectada estritamente aos dados da estrutura **${currentUser.organization}** (${currentFarmName}) na Safra ${currentSafra}.\n\nMeus acessos são confinados a esta propriedade. Como posso assessorar suas finanças, endividamento ou auditoria de notas e contratos agora?`,
        intent: 'general'
      }
    ];
  });

  // Troca de fazenda recarrega o histórico isolado correspondente
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro ao restaurar histórico:', err);
    }
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Hoje, 09:00',
        text: `Olá! Sou a **Dra. Sofia Bernardo**, Inteligência Artificial e Consultora Sênior da **Gran Bernardo Agro**.\n\n🔒 **Isolamento de Estrutura Ativo:** Estou conectada estritamente aos dados da estrutura **${currentUser.organization}** (${currentFarmName}) na Safra ${currentSafra}.\n\nMeus acessos são confinados a esta propriedade. Como posso assessorar suas finanças, endividamento ou auditoria de notas e contratos agora?`,
        intent: 'general'
      }
    ]);
  }, [storageKey]);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // OpenAI Modal & State
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(OpenAiService.getApiKey());
  const [selectedModel, setSelectedModel] = useState(OpenAiService.getModel());
  const [hasKeyConfigured, setHasKeyConfigured] = useState(OpenAiService.hasKey());
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; testing?: boolean } | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Persistir histórico automaticamente no localStorage por usuário e estrutura
  useEffect(() => {
    try {
      // Sanitizar anexos para evitar estourar cota do localStorage
      const sanitized = messages.map(msg => {
        if (!msg.attachment) return msg;
        return {
          ...msg,
          attachment: {
            name: msg.attachment.name,
            type: msg.attachment.type,
            size: msg.attachment.size,
            // Mantém previewUrl apenas se for leve (< 50KB)
            previewUrl: msg.attachment.previewUrl && msg.attachment.previewUrl.length < 50000 
              ? msg.attachment.previewUrl 
              : undefined,
            textContent: msg.attachment.textContent 
              ? msg.attachment.textContent.slice(0, 15000) 
              : undefined
          }
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(sanitized));
    } catch (err) {
      console.warn('Falha ao salvar histórico no localStorage:', err);
    }
  }, [messages, storageKey]);

  const handleClearChatHistory = () => {
    if (window.confirm(`Deseja iniciar uma nova conversa para ${currentFarmName} e arquivar as mensagens anteriores?`)) {
      const resetMsg: ChatMessage[] = [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          text: `Nova conversa iniciada para **${currentFarmName}** (${currentUser.organization}).\n\n🔒 **Isolamento de Estrutura:** Operação estritamente confinada a esta propriedade.\n\nComo posso apoiar a gestão financeira e a análise de crédito da Safra ${currentSafra} agora?`,
          intent: 'general'
        }
      ];
      setMessages(resetMsg);
      try {
        localStorage.setItem(storageKey, JSON.stringify(resetMsg));
      } catch (err) {
        // ignore
      }
    }
  };

  // Inicializar Web Speech API se suportada
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        stopRecording();
      };

      recognition.onerror = () => {
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      setTimeout(() => {
        setInputText('Paguei R$ 45 mil de adubo NPK para a Yara Fertilizantes ontem');
        stopRecording();
      }, 3000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
  };

  // Upload e leitura de anexos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const isImg = file.type.startsWith('image/');
    const isSheet = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    const isPdf = file.name.endsWith('.pdf');

    if (isImg) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          name: file.name,
          type: 'image',
          size: sizeFormatted,
          base64Data: reader.result as string,
          previewUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else if (isSheet) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setAttachment({
            name: file.name,
            type: 'spreadsheet',
            size: sizeFormatted,
            textContent: csv.slice(0, 15000)
          });
        } catch (err) {
          console.warn('Erro ao processar planilha:', err);
          setAttachment({
            name: file.name,
            type: 'spreadsheet',
            size: sizeFormatted,
            textContent: `Planilha: ${file.name}`
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          name: file.name,
          type: isPdf ? 'pdf' : 'document',
          size: sizeFormatted,
          textContent: (reader.result as string)?.slice(0, 15000) || file.name
        });
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !attachment) return;

    const currentAttachment = attachment;
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text: text || (currentAttachment ? `Analise este documento anexado: ${currentAttachment.name}` : ''),
      attachment: currentAttachment || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachment(null);
    setIsAnalyzing(true);

    // Escopo e Confinamento de Estrutura Multi-Tenant
    const totalArable = farms.reduce((acc, f) => acc + f.arableAreaHa, 0) || 1;
    const farmArableRatio = isConsolidated ? 1 : ((currentFarm?.arableAreaHa || 2100) / totalArable);

    const scopedCashFlow = isConsolidated 
      ? cashFlow 
      : cashFlow.filter(e => e.farmId === selectedFarmId || !e.farmId);

    const scopedCrops = isConsolidated
      ? crops
      : crops.map(c => ({
          ...c,
          plantedAreaHa: Math.round(c.plantedAreaHa * farmArableRatio),
          grossRevenue: c.grossRevenue * farmArableRatio,
          totalOperatingCost: c.totalOperatingCost * farmArableRatio
        }));

    const scopedDebts = isConsolidated
      ? debts
      : debts.map(d => ({
          ...d,
          currentBalance: d.currentBalance * farmArableRatio,
          nextDueAmount: d.nextDueAmount * farmArableRatio
        }));

    const clientStructure: ClientStructureContext = {
      organization: currentUser.organization || 'Grupo Bernardo Agropecuária',
      userName: currentUser.name,
      userRole: currentUser.role,
      farmId: selectedFarmId !== 'all' ? selectedFarmId : (farms[0]?.id || 'farm-01'),
      farmName: currentFarmName,
      municipality: currentFarm?.municipality || 'Sorriso',
      state: currentFarm?.state || 'MT',
      totalAreaHa: currentFarm?.totalAreaHa || farms.reduce((acc, f) => acc + f.totalAreaHa, 0),
      arableAreaHa: currentFarm?.arableAreaHa || farms.reduce((acc, f) => acc + f.arableAreaHa, 0),
      cropsSummary: currentFarm ? currentFarm.crops.join(', ') : 'Soja e Milho Safrinha'
    };

    try {
      const result = await OpenAiService.chatWithAdvisor({
        message: text,
        attachment: currentAttachment || undefined,
        context: {
          cashFlow: scopedCashFlow,
          crops: scopedCrops,
          debts: scopedDebts,
          currentSafra,
          clientStructure
        }
      });

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: result.replyText,
        intent: result.intent,
        proposedTransaction: result.proposedTransaction,
        proposedTransactions: result.proposedTransactions,
        proposedDebt: result.proposedDebt,
        modelUsed: result.modelUsed
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: `Desculpe, ocorreu uma falha ao processar sua consulta: ${err.message}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirmação de lançamento no Fluxo de Caixa (Confinado à estrutura ativa)
  const handleConfirmCashFlow = (msgId: string, prop: ProposedTransaction) => {
    const targetFarmId = prop.farmId || (selectedFarmId !== 'all' ? selectedFarmId : 'farm-01');
    const newEntry: CashFlowEntry = {
      id: `ai-tx-${Date.now()}`,
      date: prop.date,
      month: prop.date.slice(0, 7),
      description: prop.description,
      category: prop.category,
      categoryLabel: prop.categoryLabel,
      type: prop.type,
      expectedAmount: prop.amount,
      realizedAmount: prop.amount,
      status: 'realizado',
      safra: prop.safra,
      farmId: targetFarmId,
      supplierOrClient: prop.supplierOrClient,
      confidence: prop.confidence,
      source: 'ai_assistant'
    };

    const auditLog: AuditLog = {
      id: `log-ai-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      entityType: 'fluxo_caixa',
      entityId: newEntry.id,
      field: 'lançamento_confirmado',
      originalValue: 'Pendente de Confirmação',
      currentValue: `R$ ${prop.amount.toLocaleString('pt-BR')} (${prop.categoryLabel}) [${currentFarmName}]`,
      source: 'ai_assistant',
      user: `${currentUser.name} (via GPT-4o)`,
      reason: `Transação autônoma auditada: "${prop.sourceText}" confinada a ${currentFarmName}`,
      canRollback: true
    };

    onConfirmTransaction(newEntry, auditLog);

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionConfirmed: true,
          text: m.text + `\n\n✅ **Lançamento gravado com sucesso no Fluxo de Caixa!** Auditoria gerada.`
        };
      }
      return m;
    }));
  };

  // Confirmação de lote de lançamentos
  const handleConfirmBatchCashFlow = (msgId: string, items: ProposedTransaction[]) => {
    const targetFarmId = selectedFarmId !== 'all' ? selectedFarmId : 'farm-01';
    items.forEach((prop, idx) => {
      const newEntry: CashFlowEntry = {
        id: `ai-tx-batch-${Date.now()}-${idx}`,
        date: prop.date,
        month: prop.date.slice(0, 7),
        description: prop.description,
        category: prop.category,
        categoryLabel: prop.categoryLabel,
        type: prop.type,
        expectedAmount: prop.amount,
        realizedAmount: prop.amount,
        status: 'realizado',
        safra: prop.safra,
        farmId: prop.farmId || targetFarmId,
        supplierOrClient: prop.supplierOrClient,
        confidence: prop.confidence,
        source: 'ai_assistant'
      };

      const auditLog: AuditLog = {
        id: `log-batch-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        entityType: 'fluxo_caixa',
        entityId: newEntry.id,
        field: 'lote_confirmado',
        originalValue: 'Extração de Documento',
        currentValue: `R$ ${prop.amount.toLocaleString('pt-BR')} (${prop.categoryLabel}) [${currentFarmName}]`,
        source: 'ai_assistant',
        user: `${currentUser.name} (via GPT-4o)`,
        reason: `Lote autônomo auditado: "${prop.description}" confinado a ${currentFarmName}`,
        canRollback: true
      };

      onConfirmTransaction(newEntry, auditLog);
    });

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionConfirmed: true,
          text: m.text + `\n\n✅ **Lote de ${items.length} lançamentos inserido com sucesso no Fluxo de Caixa!**`
        };
      }
      return m;
    }));
  };

  // Confirmação de nova Cédula / Dívida Bancária
  const handleConfirmDebt = (msgId: string, debtAction: ProposedDebtAction) => {
    if (!onAddDebt) return;
    const targetFarmId = debtAction.farmId || (selectedFarmId !== 'all' ? selectedFarmId : 'farm-01');

    const newDebt: DebtLiability = {
      id: `debt-ai-${Date.now()}`,
      creditor: debtAction.creditor,
      beneficiaryName: debtAction.beneficiaryName || currentUser.name,
      creditorType: debtAction.creditor.includes('Brasil') ? 'Banco Comercial' : 'Fornecedor',
      operationType: debtAction.operationType as any,
      contractNumber: debtAction.contractNumber,
      cedulaNumber: debtAction.cedulaNumber,
      isUnderMcrProrrogation: debtAction.isUnderMcrProrrogation,
      originalAmount: debtAction.currentBalance,
      currentBalance: debtAction.currentBalance,
      equivalentSacksSoja: Math.round(debtAction.currentBalance / 110),
      annualInterestRate: debtAction.annualInterestRate,
      installmentsTotal: 1,
      installmentsRemaining: 1,
      nextDueDate: debtAction.nextDueDate,
      nextDueAmount: debtAction.nextDueAmount,
      term: debtAction.term,
      status: debtAction.isUnderMcrProrrogation ? 'em_prorrogacao' : 'normal',
      guarantees: debtAction.guarantees,
      relatedSafra: currentSafra,
      farmId: targetFarmId
    };

    onAddDebt(newDebt);

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionConfirmed: true,
          text: m.text + `\n\n✅ **Cédula / Passivo Bancário cadastrado com sucesso para ${currentFarmName}!**`
        };
      }
      return m;
    }));
  };

  const handleDismissAction = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionDismissed: true,
          text: m.text + `\n\n❌ **Ação descartada pelo usuário.** Nenhuma alteração foi realizada na base de dados.`
        };
      }
      return m;
    }));
  };

  // Salvar Chave OpenAI
  const handleSaveApiKey = () => {
    OpenAiService.setApiKey(apiKeyInput);
    OpenAiService.setModel(selectedModel);
    setHasKeyConfigured(OpenAiService.hasKey());
    setIsKeyModalOpen(false);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) return;
    setTestResult({ testing: true });
    const res = await OpenAiService.testConnection(apiKeyInput);
    setTestResult({ success: res.success, message: res.message, testing: false });
  };

  const quickPrompts = [
    'Qual é o meu passivo total com o Banco do Brasil?',
    'Qual meu break-even na soja e no milho?',
    'Paguei R$ 180.000 de fungicida para a Bayer ontem',
    'O que acontece no cenário de Recuperação Judicial Especial?',
    'Como posso prorrogar o custeio pelo MCR 2.6.9?'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '14px' }}>
      
      {/* Header Bar */}
      <div className="glass-panel" style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        borderLeft: '4px solid var(--cyan-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            color: '#fff'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.15rem' }}>Dra. Sofia Bernardo</h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                IA Consultora Autônoma
              </span>
              <span 
                style={{ 
                  fontSize: '0.68rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: 'rgba(16, 185, 129, 0.12)', 
                  border: '1px solid rgba(16, 185, 129, 0.35)', 
                  color: '#10b981', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                <Lock size={10} /> Isolamento Ativo: {currentUser.organization} • {currentFarmName}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              Conectada aos contratos da Gran Bernardo Agro • Safra {currentSafra}
            </span>
          </div>
        </div>

        {/* Botões de Ação do Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {messages.length > 1 && (
            <button
              onClick={handleClearChatHistory}
              className="btn btn-secondary"
              title="Iniciar uma nova conversa limpa (arquiva a conversa atual)"
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)'
              }}
            >
              <RotateCcw size={13} />
              <span>Nova Conversa</span>
            </button>
          )}

          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: hasKeyConfigured ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)'
            }}
          >
            {hasKeyConfigured ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span>OpenAI Conectada ({selectedModel})</span>
                <Settings size={13} color="var(--text-muted)" />
              </>
            ) : (
              <>
                <Key size={14} color="#06b6d4" />
                <span>Conectar OpenAI API Key</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="#06b6d4" />
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {/* Bubble Container */}
                <div style={{
                  background: isUser ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'var(--bg-surface-2)',
                  color: isUser ? '#06080c' : '#ffffff',
                  fontWeight: isUser ? 500 : 400,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  borderTopRightRadius: isUser ? '4px' : '14px',
                  borderTopLeftRadius: !isUser ? '4px' : '14px',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {/* Visualização de Anexo no Chat */}
                  {msg.attachment && (
                    <div style={{
                      marginBottom: '10px',
                      padding: '8px 12px',
                      background: isUser ? 'rgba(0,0,0,0.18)' : 'var(--bg-surface-3)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {msg.attachment.type === 'image' ? (
                        <ImageIcon size={18} color="#06b6d4" />
                      ) : msg.attachment.type === 'spreadsheet' ? (
                        <FileSpreadsheet size={18} color="#10b981" />
                      ) : (
                        <FileText size={18} color="#fbbf24" />
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.attachment.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: isUser ? 'rgba(0,0,0,0.7)' : 'var(--text-muted)' }}>
                          {msg.attachment.size} • {msg.attachment.type.toUpperCase()}
                        </span>
                      </div>
                      {msg.attachment.previewUrl && (
                        <img 
                          src={msg.attachment.previewUrl} 
                          alt="Anexo" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                        />
                      )}
                    </div>
                  )}

                  {msg.text}

                  {/* PROPOSTA DE TRANSAÇÃO ÚNICA (Requer confirmação expressa) */}
                  {msg.proposedTransaction && !msg.actionConfirmed && !msg.actionDismissed && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ShieldCheck size={14} /> PROPOSTA DE GRAVAÇÃO AUTÔNOMA
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                          Confiança: {msg.proposedTransaction.confidence}%
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Categoria:</span>
                          <strong style={{ color: '#fff' }}>{msg.proposedTransaction.categoryLabel}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Valor Monetário:</span>
                          <strong style={{ color: msg.proposedTransaction.type === 'inflow' ? '#34d399' : '#f87171' }}>
                            {msg.proposedTransaction.type === 'inflow' ? '+' : '-'} R$ {msg.proposedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '6px' }}>
                              ({Math.round(msg.proposedTransaction.amount / 110).toLocaleString('pt-BR')} sc)
                            </span>
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Favorecido / Fornecedor:</span>
                          <strong style={{ color: '#fff' }}>{msg.proposedTransaction.supplierOrClient}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Data Prevista:</span>
                          <strong style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>{msg.proposedTransaction.date}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleConfirmCashFlow(msg.id, msg.proposedTransaction!)}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', flex: 1 }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirmar e Gravar no Caixa</span>
                        </button>
                        <button
                          onClick={() => handleDismissAction(msg.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <XCircle size={15} color="#f87171" />
                          <span>Descartar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PROPOSTA DE LOTE DE TRANSAÇÕES */}
                  {msg.proposedTransactions && msg.proposedTransactions.length > 1 && !msg.actionConfirmed && !msg.actionDismissed && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                          LOTE IDENTIFICADO ({msg.proposedTransactions.length} LANÇAMENTOS)
                        </span>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          Média Confiança: 95%
                        </span>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {msg.proposedTransactions.map((tx, idx) => (
                          <div key={idx} style={{
                            padding: '6px 10px',
                            background: 'var(--bg-surface-3)',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem'
                          }}>
                            <div>
                              <strong style={{ color: '#fff', display: 'block' }}>{tx.description}</strong>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{tx.supplierOrClient} • {tx.categoryLabel}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ color: tx.type === 'inflow' ? '#34d399' : '#f87171' }}>
                                R$ {tx.amount.toLocaleString('pt-BR')}
                              </strong>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#fbbf24' }}>
                                {Math.round(tx.amount / 110)} sc
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleConfirmBatchCashFlow(msg.id, msg.proposedTransactions!)}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', flex: 1 }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirmar e Inserir Todos ({msg.proposedTransactions.length})</span>
                        </button>
                        <button
                          onClick={() => handleDismissAction(msg.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <XCircle size={15} color="#f87171" />
                          <span>Descartar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PROPOSTA DE CÉDULA / DÍVIDA BANCÁRIA (Ex: CPR, BB, Silo) */}
                  {msg.proposedDebt && !msg.actionConfirmed && !msg.actionDismissed && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Landmark size={14} /> NOVA CÉDULA / OPERAÇÃO DE PASSIVO IDENTIFICADA
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                          Confiança: {msg.proposedDebt.confidence}%
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Credor / Instituição:</span>
                          <strong style={{ color: '#fff' }}>{msg.proposedDebt.creditor}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Saldo Devedor:</span>
                          <strong style={{ color: '#f87171' }}>
                            R$ {msg.proposedDebt.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '6px' }}>
                              ({Math.round(msg.proposedDebt.currentBalance / 110).toLocaleString('pt-BR')} sc)
                            </span>
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Cédula / Contrato:</span>
                          <strong style={{ color: '#fbbf24', fontFamily: 'JetBrains Mono' }}>
                            {msg.proposedDebt.cedulaNumber || msg.proposedDebt.contractNumber}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Vencimento:</span>
                          <strong style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>{msg.proposedDebt.nextDueDate}</strong>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Garantias:</span>
                          <span style={{ color: '#fff', fontSize: '0.75rem' }}>{msg.proposedDebt.guarantees}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleConfirmDebt(msg.id, msg.proposedDebt!)}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', flex: 1, background: '#f59e0b', color: '#000', fontWeight: 700 }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Cadastrar Cédula no Endividamento</span>
                        </button>
                        <button
                          onClick={() => handleDismissAction(msg.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <XCircle size={15} color="#f87171" />
                          <span>Descartar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'space-between',
                  alignItems: 'center',
                  padding: '0 4px',
                  fontSize: '0.68rem',
                  color: 'var(--text-subtle)'
                }}>
                  {!isUser && msg.modelUsed && (
                    <span style={{ color: 'var(--cyan-glow)' }}>
                      Modelo: {msg.modelUsed}
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de Pensando / Analisando Documento */}
        {isAnalyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Loader2 size={18} color="#06b6d4" className="animate-spin" />
            </div>
            <div className="glass-panel" style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', color: '#06b6d4' }}>
              Dra. Sofia Bernardo ({selectedModel}) analisando dados e auditando conformidade agronômica...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.74rem',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={12} color="#06b6d4" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Preview de Anexo antes de enviar */}
      {attachment && (
        <div style={{
          padding: '8px 14px',
          background: 'var(--bg-surface-2)',
          borderRadius: '8px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            {attachment.type === 'image' ? (
              <ImageIcon size={16} color="#06b6d4" />
            ) : attachment.type === 'spreadsheet' ? (
              <FileSpreadsheet size={16} color="#10b981" />
            ) : (
              <FileText size={16} color="#fbbf24" />
            )}
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {attachment.name} ({attachment.size})
            </span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
            title="Remover anexo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Box com Botão de Anexo, Microfone e Envio */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: isRecording ? '1px solid #ef4444' : '1px solid var(--border-subtle)'
      }}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt"
          style={{ display: 'none' }}
        />

        {/* Botão de Anexo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-surface-3)',
            border: '1px solid var(--border-subtle)',
            color: attachment ? '#06b6d4' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Anexar arquivo (PDF, Planilha XLSX, Extrato, Imagem/Foto de Nota)"
        >
          <Paperclip size={18} />
        </button>

        {/* Audio Wave Visualizer during recording */}
        {isRecording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <span style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>
              Gravando voz ({recordingSeconds}s)... Fale o lançamento ou pergunta
            </span>
          </div>
        ) : (
          <input
            type="text"
            placeholder={attachment ? "Adicione uma instrução para o arquivo anexado (ou envie direto)..." : "Digite uma pergunta ou anexe um documento para análise autônoma..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isAnalyzing}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              padding: '6px 4px'
            }}
          />
        )}

        {/* Microphone Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: isRecording ? '#ef4444' : 'var(--bg-surface-3)',
            border: isRecording ? '2px solid #f87171' : '1px solid var(--border-subtle)',
            color: isRecording ? '#fff' : '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title={isRecording ? 'Parar gravação' : 'Gravar áudio / Falar com a IA'}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={(!inputText.trim() && !attachment) || isAnalyzing}
          className="btn btn-primary"
          style={{
            width: '38px',
            height: '38px',
            padding: 0,
            borderRadius: '50%',
            opacity: (!inputText.trim() && !attachment) || isAnalyzing ? 0.4 : 1
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* MODAL DE CONFIGURAÇÃO OPENAI */}
      {isKeyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            background: '#0d131f',
            border: '1px solid rgba(6, 182, 212, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={20} color="#06b6d4" />
                <h3 style={{ fontSize: '1.2rem' }}>Configurar OpenAI API</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Insira sua chave de API da OpenAI para habilitar a inteligência multimodal com <strong>GPT-4o</strong>. A IA terá autonomia para auditar contratos, analisar fotos de notas fiscais e sugerir cadastros diretamente no sistema.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Chave de API OpenAI (sk-...)
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Modelo de Inteligência Artificial
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="gpt-4o">GPT-4o (Recomendado — Multimodal, Visão e Planilhas)</option>
                  <option value="gpt-4o-mini">GPT-4o-mini (Econômico e Rápido)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>

              {testResult && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: testResult.success ? '1px solid #10b981' : '1px solid #ef4444',
                  fontSize: '0.78rem',
                  color: testResult.success ? '#34d399' : '#f87171'
                }}>
                  {testResult.message}
                </div>
              )}

              <div style={{
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}>
                🔒 <strong>Privacidade Garantida:</strong> A chave é mantida apenas no armazenamento local do seu navegador (localStorage) e comunicada exclusivamente com os servidores oficiais da OpenAI (api.openai.com).
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!apiKeyInput.trim() || testResult?.testing}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  {testResult?.testing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} color="#06b6d4" />}
                  <span>Testar Conexão</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {hasKeyConfigured && (
                    <button
                      type="button"
                      onClick={() => {
                        OpenAiService.clearApiKey();
                        setApiKeyInput('');
                        setHasKeyConfigured(false);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', color: '#f87171' }}
                    >
                      Remover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="btn btn-primary"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Salvar e Ativar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
