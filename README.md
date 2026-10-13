# Gran Bernardo Agro — Sistema Autônomo de Análise Financeira & Reestruturação Rural

> Plataforma web de consultoria financeira, análise de riscos agronômicos e reestruturação de passivos especializada em produtores rurais e empresas do agronegócio.

Desenvolvida com a metodologia e referências da **Gran Bernardo Consultoria e Reestruturações**, integrando análise determinística de fluxo de safra e inteligência artificial autônoma (Dra. Sofia Bernardo).

---

## 🌾 Módulos da Plataforma

1. **Visão Executiva (Dashboard Bento Grid):**
   - Receita bruta da safra, custos totais, margem operacional bruta, saldo de caixa final e passivo bancário.
   - Gráfico de barras e linhas responsivo com metodologia de 12 meses (ano-safra).
   - Diagnóstico de Ponto de Equilíbrio (*Break-Even Point*) em sacas/ha e R$/saca para Soja e Milho.

2. **Fluxo de Caixa Agropecuário:**
   - Visualização em Matriz Safra (12 meses) no modelo Gran Bernardo e visão em lista de lançamentos.
   - Categorização agronômica: Receita de grãos, sementes, defensivos, fertilizantes, máquinas, fretes e serviço da dívida.
   - Adição manual e filtros avançados com indicadores de liquidez.

3. **Planejamento de Safras & Culturas:**
   - Gestão de áreas plantadas (ha), produtividade esperada (sc/ha), custos por hectare e margem operacional.
   - Cálculo automático de produção total de sacas e margem de segurança.

4. **Gestão de Endividamento & Passivos Bancários:**
   - Controle de CPRs, Custeios, Finame, Empréstimos de Giro e Barter.
   - Monitoramento do Serviço da Dívida sobre a receita bruta (alerta para > 35%).
   - Concentração de passivos por credor e separação entre curto e longo prazo.

5. **Assistente de IA & Voz (Dra. Sofia Bernardo):**
   - Processamento de linguagem natural (texto e áudio via Web Speech API) para dúvidas financeiras e simulações.
   - Interpretação de despesas e receitas com **geração de prévia estruturada para confirmação obrigatória** (sem alterações silenciosas).

6. **Central de Treinamento da Agente de IA (Cockpit PRO):**
   - Customização de Persona, Tom de Voz, Limiar de Confiança e System Prompt.
   - Toggles de Guardrails: Confirmação obrigatória, alerta de serviço da dívida, prorrogação MCR 2.6.9 e validação de break-even.
   - Gestão da Base de Conhecimento Rural e Exemplos Práticos (Few-Shot Q&A).
   - Laboratório interativo de testes em tempo real (Sandbox).

7. **Central de Importações & Auditoria (Excel/PDF):**
   - Importador determinístico de arquivos XLSX/CSV com parser de planilhas de safra.
   - Validação prévia de inconsistências e suporte a rollback de importação com um clique.

8. **Matriz de Riscos & Oportunidades:**
   - Identificação autônoma de quebra de safra, descasamento de liquidez e concentração bancária.
   - Conversão de alertas em ações prioritárias no plano de reestruturação.

9. **Simulador de Cenários & Sensibilidade (What-If):**
   - Sliders de estresse para oscilação de preços de grãos, quebra de produtividade, inflação de insumos e parâmetros de recuperação (carência, deságio e alongamento).

10. **Plano de Reestruturação Extrajudicial (Kanban):**
    - Fluxo Kanban (A Iniciar, Em Andamento e Concluído) para renegociação com tradings, alongamento bancário e auditoria fiscal.

11. **Relatórios Executivos & Trilha de Auditoria (LGPD):**
    - Geração de Dossiê Executivo formatado para impressão/PDF de alta resolução.
    - Trilha de auditoria completa com histórico de usuário, motivo da alteração e reversão.

12. **Gestão de Propriedades & Grupos:**
    - Cadastro e alternância dinâmica de fazendas, grupos agropecuários e perfis de acesso (Consultor, Produtor e Administrador).

---

## 🎨 Identidade Visual (Design System)

- **Fundo**: Preto grafite profundo (`#0b0d11`).
- **Cards**: Cinza escuro com bordas finas e cantos arredondados (`#161922` / `rgba(22, 25, 34, 0.85)`).
- **Tipografia**: Textos brancos de alto contraste e informações secundárias em cinza médio slate (`#94a3b8`).
- **Destaque Principal**: Ciano neon brilhante (`#00f2fe`).
- **Gráficos**: Azul elétrico (`#2563eb`).
- **Resultados Positivos**: Verde esmeralda (`#10b981`).
- **Alertas**: Laranja vivo (`#f97316`).
- **Erros / Passivos**: Vermelho (`#ef4444`).
- **Elementos de IA**: Acentos em roxo (`#a855f7`), magenta (`#ec4899`) e degradês de assinatura roxo-para-ciano.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)
- npm ou pnpm

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:5173/`

### Build para Produção
```bash
npm run build
```

---

## 📂 Estrutura do Projeto

```
├── .agents/                    # Regras e Skills nativas do workspace Antigravity
│   ├── rules/                  # Regras de conformidade da Dra. Sofia Bernardo
│   └── skills/                 # Skills especializadas (finanças rurais, MCR 2.6.9)
├── public/                     # Arquivos estáticos
├── src/
│   ├── components/             # Componentes de topo (Header, Sidebar)
│   ├── data/                   # Base inicial de safras, dívidas e lançamentos
│   ├── services/               # Motores determinísticos (FinancialEngine, Excel, IA)
│   ├── types/                  # Definições completas TypeScript
│   ├── views/                  # Páginas e módulos da plataforma
│   ├── App.tsx                 # Componente mestre e orquestrador de estado
│   ├── index.css               # Design System com tokens e temas
│   └── main.tsx                # Ponto de entrada React
├── index.html                  # HTML principal
├── package.json
└── vite.config.ts
```

---

## ⚖️ Conformidade e Metodologia

- **Manual de Crédito Rural (MCR 2.6.9):** Suporte normativo à prorrogação de dívidas por frustração de safra ou comercialização.
- **Transparência Determinística:** Cálculos financeiros realizados exclusivamente pelo motor determinístico [`FinancialEngine`], sem alucinações de valores pela IA.
- **Controle de Dados:** Toda operação proposta requer aprovação prévia e armazena log auditável.
