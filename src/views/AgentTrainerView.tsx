// Central de Treinamento & Customização da Agente de IA - Gran Bernardo Agro
import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Save, 
  RotateCcw, 
  BookOpen, 
  ShieldCheck, 
  MessageSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Send,
  HelpCircle,
  Sliders,
  Award
} from 'lucide-react';
import { AgentConfig, KnowledgeTopic, AgentTrainingExample } from '../types';
import { INITIAL_AGENT_CONFIG } from '../data/initialData';

interface AgentTrainerViewProps {
  agentConfig: AgentConfig;
  onSaveAgentConfig: (updated: AgentConfig) => void;
  onResetAgentConfig: () => void;
}

export const AgentTrainerView: React.FC<AgentTrainerViewProps> = ({
  agentConfig,
  onSaveAgentConfig,
  onResetAgentConfig
}) => {
  const [config, setConfig] = useState<AgentConfig>(agentConfig);
  const [isSaved, setIsSaved] = useState(false);

  // Playground / Sandbox State
  const [testQuestion, setTestQuestion] = useState('O que acontece se eu atrasar o pagamento do custeio no Banco do Brasil?');
  const [sandboxReply, setSandboxReply] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // New Knowledge Topic Modal/Input
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<KnowledgeTopic['category']>('credito_rural');
  const [newTopicSummary, setNewTopicSummary] = useState('');

  // New Few-shot Example Input
  const [showAddExample, setShowAddExample] = useState(false);
  const [newExPrompt, setNewExPrompt] = useState('');
  const [newExResponse, setNewExResponse] = useState('');

  const handleSave = () => {
    onSaveAgentConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleTopic = (topicId: string) => {
    setConfig(prev => ({
      ...prev,
      knowledgeTopics: prev.knowledgeTopics.map(t => 
        t.id === topicId ? { ...t, active: !t.active } : t
      )
    }));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: KnowledgeTopic = {
      id: `kn-${Date.now()}`,
      title: newTopicTitle.trim(),
      category: newTopicCategory,
      summary: newTopicSummary.trim(),
      active: true
    };

    setConfig(prev => ({
      ...prev,
      knowledgeTopics: [...prev.knowledgeTopics, newTopic]
    }));

    setNewTopicTitle('');
    setNewTopicSummary('');
    setShowAddTopic(false);
  };

  const handleDeleteTopic = (topicId: string) => {
    setConfig(prev => ({
      ...prev,
      knowledgeTopics: prev.knowledgeTopics.filter(t => t.id !== topicId)
    }));
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExPrompt.trim() || !newExResponse.trim()) return;

    const newEx: AgentTrainingExample = {
      id: `ex-${Date.now()}`,
      userPrompt: newExPrompt.trim(),
      agentResponse: newExResponse.trim()
    };

    setConfig(prev => ({
      ...prev,
      trainingExamples: [...prev.trainingExamples, newEx]
    }));

    setNewExPrompt('');
    setNewExResponse('');
    setShowAddExample(false);
  };

  const handleDeleteExample = (exId: string) => {
    setConfig(prev => ({
      ...prev,
      trainingExamples: prev.trainingExamples.filter(e => e.id !== exId)
    }));
  };

  const handleRunSandboxTest = () => {
    if (!testQuestion.trim()) return;
    setIsSimulating(true);

    setTimeout(() => {
      // Gera simulação considerando os parâmetros treinados
      let response = `Olá! Sou a **${config.name}** (${config.title}).\n\n`;

      if (testQuestion.toLowerCase().includes('custeio') || testQuestion.toLowerCase().includes('banco')) {
        response += `Com base nas diretrizes do **Manual de Crédito Rural (MCR 2.6.9)** ativas na minha base de conhecimento:\n\n` +
          `1. **Direito à Prorrogação:** Se o atraso decorre de fatores climáticos ou frustração de comercialização, você tem o direito legal de prorrogar o custeio mantendo as taxas pactuadas originais.\n` +
          `2. **Procedimento Técnico:** Devemos protocolar a notificação formal antes do vencimento com laudo pericial agronômico comprovando o atraso de plantio ou colheita.\n` +
          `3. **Proteção:** Isso impede que a agência aplique taxas punitivas de inadimplência ou execute o penhor de safra.`;
      } else if (testQuestion.toLowerCase().includes('soja') || testQuestion.toLowerCase().includes('milho') || testQuestion.toLowerCase().includes('preço')) {
        response += `Analisando seu **Ponto de Equilíbrio (Break-Even)**:\n\n` +
          `• Custo por Hectare: R$ 4.850,00/ha\n` +
          `• Produtividade Média: 64 sc/ha\n` +
          `• Break-even em Preço: R$ 78,22/sc\n\n` +
          `Recomendo aproveitar janelas de alta para travar contratos a termo (NDF/CPR) cobrindo pelo menos 100% dos custos fixos e de insumos.`;
      } else {
        response += `Conforme o treinamento configurado, minhas respostas priorizam a preservação da liquidez da fazenda, transparência em cada movimentação e aplicação rigorosa da metodologia Gran Bernardo de reestruturação rural.`;
      }

      setSandboxReply(response);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="bento-card" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16) 0%, rgba(22, 25, 34, 0.95) 100%)',
        borderLeft: '4px solid #a855f7',
        border: '1px solid rgba(0, 242, 254, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(168, 85, 247, 0.45)'
          }}>
            <Bot size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff' }}>Treinamento da Agente de IA</h2>
              <span className="badge badge-ai">Módulo de Customização</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
              Defina a Persona, Tom de Voz, Regras de Negócio Rural, Guardrails e Teses de Reestruturação
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isSaved && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} />
              <span>Salvo com sucesso!</span>
            </span>
          )}

          <button onClick={onResetAgentConfig} className="btn btn-secondary" title="Restaurar parâmetros padrão">
            <RotateCcw size={15} />
            <span>Restaurar Padrão</span>
          </button>

          <button onClick={handleSave} className="btn btn-primary">
            <Save size={16} />
            <span>Salvar Treinamento</span>
          </button>
        </div>
      </div>

      {/* Grid: Persona / Guardrails / Base de Conhecimento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Identidade e Persona */}
        <div className="bento-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Persona & Identidade da Agente</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nome da Agente</label>
              <input
                type="text"
                className="form-input"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cargo / Especialidade</label>
              <input
                type="text"
                className="form-input"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Tom de Voz</label>
                <select
                  className="form-select"
                  value={config.tone}
                  onChange={(e) => setConfig({ ...config, tone: e.target.value as any })}
                >
                  <option value="executivo">Executivo & Técnico</option>
                  <option value="orientativo">Empático & Orientativo</option>
                  <option value="formal">Formal & Conservador</option>
                  <option value="direto">Direto & Objetivo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Confiança Mínima ({config.minConfidencePercent}%)</label>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="5"
                  value={config.minConfidencePercent}
                  onChange={(e) => setConfig({ ...config, minConfidencePercent: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#00f2fe', cursor: 'pointer', marginTop: '8px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instrução Central do Sistema (System Prompt)</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                style={{ fontSize: '0.8rem', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Guardrails & Regras de Segurança */}
        <div className="bento-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Guardrails & Regras Inegociáveis</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'var(--color-surface-2)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={config.requireExplicitConfirmation}
                onChange={(e) => setConfig({ ...config, requireExplicitConfirmation: e.target.checked })}
                style={{ marginTop: '3px', accentColor: '#00f2fe' }}
              />
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#fff', display: 'block' }}>
                  Confirmação Obrigatória para Lançamentos
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  A IA nunca altera saldos ou cria transações de forma silenciosa. Sempre exibe prévia estruturada para aceite do usuário.
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'var(--color-surface-2)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={config.alertDebtServiceOver35}
                onChange={(e) => setConfig({ ...config, alertDebtServiceOver35: e.target.checked })}
                style={{ marginTop: '3px', accentColor: '#00f2fe' }}
              />
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#fff', display: 'block' }}>
                  Alerta de Risco para Serviço da Dívida &gt; 35%
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  Emite recomendação de reestruturação preventiva caso as parcelas bancárias anuais superem 35% do faturamento da safra.
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'var(--color-surface-2)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={config.recommendMcrExtension}
                onChange={(e) => setConfig({ ...config, recommendMcrExtension: e.target.checked })}
                style={{ marginTop: '3px', accentColor: '#00f2fe' }}
              />
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#fff', display: 'block' }}>
                  Recomendação Ativa de Prorrogação MCR 2.6.9
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  Ao identificar frustração de colheita ou atraso de receitas, sugere formalização prévia de prorrogação junto ao banco credor.
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'var(--color-surface-2)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={config.checkBreakEvenOnPurchases}
                onChange={(e) => setConfig({ ...config, checkBreakEvenOnPurchases: e.target.checked })}
                style={{ marginTop: '3px', accentColor: '#00f2fe' }}
              />
              <div>
                <strong style={{ fontSize: '0.84rem', color: '#fff', display: 'block' }}>
                  Validação Automática de Break-Even
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  Compara compras volumosas de insumos com o preço de equilíbrio em sacas para alertar sobre esmagamento de margem.
                </span>
              </div>
            </label>
          </div>
        </div>

      </div>

      {/* Base de Conhecimento Rural Integrada */}
      <div className="bento-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Base de Conhecimento & Teses de Reestruturação</h3>
          </div>

          <button onClick={() => setShowAddTopic(!showAddTopic)} className="btn btn-secondary" style={{ fontSize: '0.76rem', padding: '5px 12px' }}>
            <Plus size={14} />
            <span>Adicionar Conhecimento</span>
          </button>
        </div>

        {/* Form para adicionar conhecimento */}
        {showAddTopic && (
          <form onSubmit={handleAddTopic} style={{
            background: 'var(--color-surface-2)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Título da Tese ou Documento</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Jurisprudência sobre Trava de CPR Financeira"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select
                  className="form-select"
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                >
                  <option value="credito_rural">Crédito Rural</option>
                  <option value="barter_cpr">Barter & CPR</option>
                  <option value="reestruturacao">Reestruturação</option>
                  <option value="tributario">Tributário</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Resumo do Conhecimento que a IA deve utilizar</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Descreva as premissas que a IA deve seguir..."
                value={newTopicSummary}
                onChange={(e) => setNewTopicSummary(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddTopic(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Tópico
              </button>
            </div>
          </form>
        )}

        {/* Lista de tópicos de conhecimento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {config.knowledgeTopics.map(topic => (
            <div key={topic.id} style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.84rem', color: '#fff' }}>{topic.title}</strong>
                  <span className={`badge ${topic.active ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>
                    {topic.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {topic.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => handleToggleTopic(topic.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: topic.active ? '#fbbf24' : '#34d399',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {topic.active ? 'Pausar Uso' : 'Ativar na IA'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTopic(topic.id)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                  title="Excluir tópico"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplos de Treinamento (Few-Shot Prompts) */}
      <div className="bento-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#c084fc" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Exemplos de Treinamento Prático (Few-Shot Q&A)</h3>
          </div>

          <button onClick={() => setShowAddExample(!showAddExample)} className="btn btn-secondary" style={{ fontSize: '0.76rem', padding: '5px 12px' }}>
            <Plus size={14} />
            <span>Adicionar Exemplo</span>
          </button>
        </div>

        {/* Form novo exemplo */}
        {showAddExample && (
          <form onSubmit={handleAddExample} style={{
            background: 'var(--color-surface-2)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div className="form-group">
              <label className="form-label">Pergunta Típica do Produtor</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Como renegociar minha dívida de fertilizante com a trading?"
                value={newExPrompt}
                onChange={(e) => setNewExPrompt(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resposta Padrão Esperada da Gran Bernardo</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Escreva a resposta com a abordagem recomendada..."
                value={newExResponse}
                onChange={(e) => setNewExResponse(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddExample(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Exemplo
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {config.trainingExamples.map(ex => (
            <div key={ex.id} style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                  💬 Pergunta: "{ex.userPrompt}"
                </strong>
                <button
                  onClick={() => handleDeleteExample(ex.id)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', lineHeight: 1.4, background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '6px' }}>
                🎯 <strong>Resposta Gran Bernardo:</strong> {ex.agentResponse}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Laboratório de Testes em Tempo Real (Sandbox) */}
      <div className="bento-card" style={{ borderLeft: '4px solid #00f2fe', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#00f2fe" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Laboratório de Teste em Tempo Real (Sandbox)</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
          Teste como a agente treinada responde às dúvidas com a persona e diretrizes configuradas antes de disponibilizar para os produtores:
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <input
            type="text"
            className="form-input"
            value={testQuestion}
            onChange={(e) => setTestQuestion(e.target.value)}
            placeholder="Digite uma pergunta de teste..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunSandboxTest();
            }}
          />
          <button onClick={handleRunSandboxTest} className="btn btn-primary" style={{ padding: '8px 18px' }}>
            <Send size={15} />
            <span>Testar</span>
          </button>
        </div>

        {isSimulating && (
          <div style={{ padding: '16px', color: '#00f2fe', fontSize: '0.8rem', textAlign: 'center' }}>
            Processando resposta com base na persona e regras ativas...
          </div>
        )}

        {sandboxReply && !isSimulating && (
          <div style={{
            background: 'var(--color-surface-2)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            color: '#fff',
            whiteSpace: 'pre-line'
          }}>
            {sandboxReply}
          </div>
        )}
      </div>

    </div>
  );
};
