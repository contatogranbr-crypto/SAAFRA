// Assistente de IA Agro & Processamento de Voz - Gran Bernardo Agro
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
  Volume2, 
  Clock, 
  HelpCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { 
  CashFlowEntry, 
  CropPlanningItem, 
  DebtLiability, 
  ChatMessage, 
  ProposedTransaction, 
  AuditLog 
} from '../types';
import { AiAdvisorEngine } from '../services/aiAdvisorEngine';

interface AiAdvisorViewProps {
  cashFlow: CashFlowEntry[];
  crops: CropPlanningItem[];
  debts: DebtLiability[];
  currentSafra: string;
  onConfirmTransaction: (entry: CashFlowEntry, log: AuditLog) => void;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  cashFlow,
  crops,
  debts,
  currentSafra,
  onConfirmTransaction
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Hoje, 09:00',
      text: `Olá! Sou o **Assistente de Inteligência Financeira da Gran Bernardo Agro**.\n\nEstou conectado em tempo real aos números da **Fazenda Santa Maria** (Safra ${currentSafra}).\n\nVocê pode me fazer perguntas sobre seu endividamento e fluxo de caixa, pedir para simular cenários de preços ou registrar despesas e vendas por voz ou texto.`,
      intent: 'general'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      // Fallback para simulação de áudio se o navegador não suportar Web Speech API
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

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Processamento pelo Motor de IA Gran Bernardo
    setTimeout(() => {
      const response = AiAdvisorEngine.processMessage(text, {
        cashFlow,
        crops,
        debts,
        currentSafra
      });

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: response.replyText,
        intent: response.intent,
        proposedTransaction: response.proposedTransaction
      };

      setMessages(prev => [...prev, assistantMsg]);
    }, 400);
  };

  const handleConfirmProposal = (msgId: string, prop: ProposedTransaction) => {
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
      farmId: 'farm-01',
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
      currentValue: `R$ ${prop.amount.toLocaleString('pt-BR')} (${prop.categoryLabel})`,
      source: 'ai_assistant',
      user: 'Produtor / Consultor (via IA)',
      reason: `Transação confirmada via assistente inteligente: "${prop.sourceText}"`,
      canRollback: true
    };

    onConfirmTransaction(newEntry, auditLog);

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionConfirmed: true,
          text: m.text + `\n\n✅ **Lançamento gravado com sucesso!** O Fluxo de Caixa e os painéis de auditoria foram atualizados.`
        };
      }
      return m;
    }));
  };

  const handleDismissProposal = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          actionDismissed: true,
          text: m.text + `\n\n❌ **Lançamento cancelado pelo usuário.** Nenhuma alteração foi realizada na base de dados.`
        };
      }
      return m;
    }));
  };

  const quickPrompts = [
    'Qual é a minha dívida total com bancos?',
    'Qual meu break-even na soja?',
    'Paguei R$ 35 mil de adubo para a Yara ontem',
    'O que acontece se a soja cair 15%?',
    'Qual o saldo projetado de caixa para Maio/25?'
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
        background: 'linear-gradient(135deg, rgba(22, 25, 34, 0.95) 0%, rgba(16, 19, 25, 0.98) 100%)',
        borderLeft: '4px solid #a855f7',
        border: '1px solid rgba(0, 242, 254, 0.18)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.45)',
            border: '1px solid rgba(236, 72, 153, 0.4)'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem' }}>Assistente Autônomo Gran Bernardo</h2>
            <span style={{ fontSize: '0.74rem', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }} />
              Conectado ao Motor Financeiro e Safra {currentSafra}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Metodologia de Validação Transparente: <strong style={{ color: '#fff' }}>Sem alterações silenciosas</strong>
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
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="#c084fc" />
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
                  background: isUser ? 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)' : 'var(--color-surface-2)',
                  color: isUser ? '#06080c' : '#ffffff',
                  fontWeight: isUser ? 500 : 400,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  borderTopRightRadius: isUser ? '4px' : '14px',
                  borderTopLeftRadius: !isUser ? '4px' : '14px',
                  border: isUser ? 'none' : '1px solid rgba(0, 242, 254, 0.15)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}

                  {/* PROPOSTA DE TRANSAÇÃO (REQUER CONFIRMAÇÃO DO USUÁRIO) */}
                  {msg.proposedTransaction && !msg.actionConfirmed && !msg.actionDismissed && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(22, 25, 34, 0.95)',
                      border: '1px solid rgba(0, 242, 254, 0.35)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase' }}>
                          PRÉVIA DO LANÇAMENTO IDENTIFICADO
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                          Confiança: {msg.proposedTransaction.confidence}%
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Categoria Sugerida:</span>
                          <strong style={{ color: '#fff' }}>{msg.proposedTransaction.categoryLabel}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Valor Monetário:</span>
                          <strong style={{ color: msg.proposedTransaction.type === 'inflow' ? '#34d399' : '#f87171' }}>
                            {msg.proposedTransaction.type === 'inflow' ? '+' : '-'} R$ {msg.proposedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Favorecido / Fornecedor:</span>
                          <strong style={{ color: '#fff' }}>{msg.proposedTransaction.supplierOrClient}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Data do Movimento:</span>
                          <strong style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>{msg.proposedTransaction.date}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleConfirmProposal(msg.id, msg.proposedTransaction!)}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', flex: 1 }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirmar e Lançar no Caixa</span>
                        </button>
                        <button
                          onClick={() => handleDismissProposal(msg.id)}
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

                <span style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-subtle)',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  padding: '0 4px'
                }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
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
              border: '1px solid rgba(0, 242, 254, 0.18)',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={12} color="#00f2fe" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Box with Audio Recording */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: isRecording ? '1px solid #ef4444' : '1px solid var(--border-subtle)'
      }}>
        {/* Audio Wave Visualizer during recording */}
        {isRecording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px' }}>
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
              <div className="audio-wave-bar" />
            </div>
            <span style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>
              Gravando voz ({recordingSeconds}s)... Fale o lançamento ou pergunta
            </span>
          </div>
        ) : (
          <input
            type="text"
            placeholder="Digite ou clique no microfone (ex: 'Qual minha dívida total?' ou 'Paguei R$ 20 mil de adubo')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
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
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: isRecording ? '#ef4444' : 'var(--color-surface-3)',
            border: isRecording ? '2px solid #f87171' : '1px solid rgba(0, 242, 254, 0.3)',
            color: isRecording ? '#fff' : '#00f2fe',
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
          disabled={!inputText.trim() && !isRecording}
          className="btn btn-primary"
          style={{
            width: '38px',
            height: '38px',
            padding: 0,
            borderRadius: '50%',
            opacity: !inputText.trim() ? 0.4 : 1
          }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
};
