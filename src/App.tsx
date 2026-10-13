// Master Application Component - Gran Bernardo Agro
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';

// Views
import { DashboardView } from './views/DashboardView';
import { CashFlowView } from './views/CashFlowView';
import { CropPlanningView } from './views/CropPlanningView';
import { DebtManagementView } from './views/DebtManagementView';
import { AiAdvisorView } from './views/AiAdvisorView';
import { ImportCenterView } from './views/ImportCenterView';
import { RiskMatrixView } from './views/RiskMatrixView';
import { ScenarioSimulatorView } from './views/ScenarioSimulatorView';
import { RestructuringPlanView } from './views/RestructuringPlanView';
import { ExecutiveReportsView } from './views/ExecutiveReportsView';
import { FarmsAndClientsView } from './views/FarmsAndClientsView';
import { AgentTrainerView } from './views/AgentTrainerView';

// Initial Data & Financial Engine
import { 
  INITIAL_USER, 
  INITIAL_GROUPS, 
  INITIAL_FARMS, 
  INITIAL_CROPS, 
  INITIAL_CASH_FLOW, 
  INITIAL_DEBTS, 
  INITIAL_ACTIONS, 
  INITIAL_SCENARIOS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_AGENT_CONFIG 
} from './data/initialData';
import { FinancialEngine } from './services/financialEngine';
import { 
  CashFlowEntry, 
  CropPlanningItem, 
  DebtLiability, 
  ImportBatch, 
  RestructuringAction, 
  RiskAlert, 
  ScenarioSimulation, 
  UserProfile, 
  UserRole, 
  AuditLog,
  FarmProperty,
  AgentConfig
} from './types';

export function App() {
  // Navigation & User Profile State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [currentSafra, setCurrentSafra] = useState<string>('2024/2025');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-01');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data Collections
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [farms, setFarms] = useState<FarmProperty[]>(INITIAL_FARMS);
  const [crops, setCrops] = useState<CropPlanningItem[]>(INITIAL_CROPS);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>(INITIAL_CASH_FLOW);
  const [debts, setDebts] = useState<DebtLiability[]>(INITIAL_DEBTS);
  const [actions, setActions] = useState<RestructuringAction[]>(INITIAL_ACTIONS);
  const [scenarios, setScenarios] = useState<ScenarioSimulation[]>(INITIAL_SCENARIOS);
  const [importHistory, setImportHistory] = useState<ImportBatch[]>([
    {
      id: 'batch-init-01',
      filename: 'Planilha Fluxo de Caixa Gran Bernardo.xlsx',
      fileSize: 48900,
      uploadedAt: '2025-01-20 09:30:14',
      rowCount: 25,
      status: 'imported',
      totalInflows: 14681600,
      totalOutflows: 14271000,
      sourceType: 'XLSX'
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(INITIAL_AGENT_CONFIG);

  // Motor Financeiro Autônomo - Cálculos Reativos em Tempo Real
  const monthlySummaries = useMemo(() => {
    return FinancialEngine.calculateMonthlyCashFlow(cashFlow, 320000);
  }, [cashFlow]);

  const autonomousRisks = useMemo(() => {
    return FinancialEngine.generateAutonomousRiskMatrix(crops, monthlySummaries, debts);
  }, [crops, monthlySummaries, debts]);

  // Handlers
  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const handleAddEntry = (entry: CashFlowEntry) => {
    setCashFlow(prev => [entry, ...prev]);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      entityType: 'fluxo_caixa',
      entityId: entry.id,
      field: entry.description,
      originalValue: 'Novo Lançamento',
      currentValue: `R$ ${entry.expectedAmount.toLocaleString('pt-BR')} (${entry.categoryLabel})`,
      source: 'manual',
      user: currentUser.name,
      reason: 'Inclusão manual via painel do fluxo de caixa',
      canRollback: true
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleUpdateEntry = (entry: CashFlowEntry) => {
    setCashFlow(prev => prev.map(e => e.id === entry.id ? entry : e));
  };

  const handleConfirmAiTransaction = (entry: CashFlowEntry, log: AuditLog) => {
    setCashFlow(prev => [entry, ...prev]);
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleImportConfirmed = (newEntries: CashFlowEntry[], batch: ImportBatch, log: AuditLog) => {
    setCashFlow(prev => [...newEntries, ...prev]);
    setImportHistory(prev => [batch, ...prev]);
    setAuditLogs(prev => [log, ...prev]);
    setActiveTab('cashflow');
  };

  const handleRollbackBatch = (batchId: string) => {
    setCashFlow(prev => prev.filter(e => !e.id.startsWith('imp-')));
    setImportHistory(prev => prev.map(b => b.id === batchId ? { ...b, status: 'reverted' } : b));
    const log: AuditLog = {
      id: `log-roll-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      entityType: 'importacao',
      entityId: batchId,
      field: 'Rollback de Importação',
      originalValue: 'Importação Ativa',
      currentValue: 'Lançamentos Revertidos',
      source: 'manual',
      user: currentUser.name,
      reason: 'Solicitação de cancelamento da carga de planilha',
      canRollback: false
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleRollbackLog = (logId: string) => {
    setAuditLogs(prev => prev.filter(l => l.id !== logId));
  };

  const handleAddDebt = (newDebt: DebtLiability) => {
    setDebts(prev => [newDebt, ...prev]);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      entityType: 'divida',
      entityId: newDebt.id,
      field: `${newDebt.creditor} (${newDebt.operationType})`,
      originalValue: 'Novo Contrato',
      currentValue: `R$ ${newDebt.currentBalance.toLocaleString('pt-BR')}`,
      source: 'manual',
      user: currentUser.name,
      reason: 'Cadastro de nova operação de crédito',
      canRollback: true
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleUpdateDebt = (updatedDebt: DebtLiability) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };

  const handleAddCrop = (newCrop: CropPlanningItem) => {
    setCrops(prev => [...prev, newCrop]);
  };

  const handleUpdateCrop = (updatedCrop: CropPlanningItem) => {
    setCrops(prev => prev.map(c => c.id === updatedCrop.id ? updatedCrop : c));
  };

  const handleUpdateScenario = (updatedScenario: ScenarioSimulation) => {
    setScenarios(prev => prev.map(s => s.id === updatedScenario.id ? updatedScenario : s));
  };

  const handleAddAction = (newAction: RestructuringAction) => {
    setActions(prev => [newAction, ...prev]);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      entityType: 'acao_reestruturacao',
      entityId: newAction.id,
      field: newAction.action,
      originalValue: 'A Iniciar',
      currentValue: `Impacto: +R$ ${newAction.estimatedImpactR$.toLocaleString('pt-BR')}`,
      source: 'manual',
      user: currentUser.name,
      reason: 'Nova ação registrada no plano de reestruturação',
      canRollback: true
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleUpdateActionStatus = (actionId: string, newStatus: RestructuringAction['status']) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
  };

  const handleAddHistoryNote = (actionId: string, note: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          historyNotes: [...a.historyNotes, note]
        };
      }
      return a;
    }));
  };

  const handleConvertToRestructuringAction = (risk: RiskAlert) => {
    const newAct: RestructuringAction = {
      id: `act-conv-${Date.now()}`,
      problem: risk.problem,
      action: risk.recommendation,
      responsible: 'Dr. Roberto Bernardo (Consultor Gran Bernardo)',
      deadline: '2025-03-15',
      priority: risk.severity === 'critical' ? 'urgente' : 'alta',
      status: 'a_iniciar',
      estimatedImpactR$: risk.impactR$,
      documents: ['Analise_Risco_Gran_Bernardo.pdf'],
      historyNotes: [`${new Date().toLocaleDateString('pt-BR')}: Ação gerada automaticamente a partir do alerta: ${risk.title}`]
    };
    handleAddAction(newAct);
    setActiveTab('restructuring');
  };

  const handleAddFarm = (farm: FarmProperty) => {
    setFarms(prev => [...prev, farm]);
    setSelectedFarmId(farm.id);
  };

  const pendingActionsCount = actions.filter(a => a.status !== 'concluido').length;
  const criticalAlertsCount = autonomousRisks.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        farms={farms}
        selectedFarmId={selectedFarmId}
        onFarmChange={setSelectedFarmId}
        currentSafra={currentSafra}
        onSafraChange={setCurrentSafra}
        alertCount={criticalAlertsCount}
        onOpenAiChat={() => { setActiveTab('ai_advisor'); setIsMobileMenuOpen(false); }}
        onOpenImport={() => { setActiveTab('import_center'); setIsMobileMenuOpen(false); }}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* Mobile Drawer (When Open on Mobile / Tablet) */}
      {isMobileMenuOpen && (
        <div className="no-print">
          <div 
            className="mobile-drawer-backdrop" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-drawer animate-fade-in">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              alertCount={criticalAlertsCount}
              pendingActionsCount={pendingActionsCount}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
              farms={farms}
              selectedFarmId={selectedFarmId}
              onFarmChange={setSelectedFarmId}
              currentSafra={currentSafra}
              onSafraChange={setCurrentSafra}
              currentUser={currentUser}
              onRoleChange={handleRoleChange}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Sidebar (Desktop Mode) */}
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            alertCount={criticalAlertsCount}
            pendingActionsCount={pendingActionsCount}
          />
        </div>

        {/* View Port Content */}
        <main style={{
          flex: 1,
          padding: '0 20px 24px 8px',
          overflowX: 'hidden'
        }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              crops={crops}
              monthlySummaries={monthlySummaries}
              debts={debts}
              risks={autonomousRisks}
              actions={actions}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowView
              entries={cashFlow}
              monthlySummaries={monthlySummaries}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
            />
          )}

          {activeTab === 'crops' && (
            <CropPlanningView
              crops={crops}
              onAddCrop={handleAddCrop}
              onUpdateCrop={handleUpdateCrop}
              currentSafra={currentSafra}
            />
          )}

          {activeTab === 'debts' && (
            <DebtManagementView
              debts={debts}
              onAddDebt={handleAddDebt}
              onUpdateDebt={handleUpdateDebt}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
            />
          )}

          {activeTab === 'ai_advisor' && (
            <AiAdvisorView
              cashFlow={cashFlow}
              crops={crops}
              debts={debts}
              currentSafra={currentSafra}
              onConfirmTransaction={handleConfirmAiTransaction}
            />
          )}

          {activeTab === 'import_center' && (
            <ImportCenterView
              onImportConfirmed={handleImportConfirmed}
              onRollbackBatch={handleRollbackBatch}
              importHistory={importHistory}
              currentSafra={currentSafra}
            />
          )}

          {activeTab === 'risks' && (
            <RiskMatrixView
              risks={autonomousRisks}
              onConvertToRestructuringAction={handleConvertToRestructuringAction}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenarioSimulatorView
              scenarios={scenarios}
              crops={crops}
              debts={debts}
              monthlySummaries={monthlySummaries}
              onUpdateScenario={handleUpdateScenario}
            />
          )}

          {activeTab === 'restructuring' && (
            <RestructuringPlanView
              actions={actions}
              onAddAction={handleAddAction}
              onUpdateActionStatus={handleUpdateActionStatus}
              onAddHistoryNote={handleAddHistoryNote}
            />
          )}

          {activeTab === 'reports' && (
            <ExecutiveReportsView
              crops={crops}
              monthlySummaries={monthlySummaries}
              debts={debts}
              risks={autonomousRisks}
              actions={actions}
              scenarios={scenarios}
              auditLogs={auditLogs}
              onRollbackLog={handleRollbackLog}
              currentSafra={currentSafra}
            />
          )}

          {activeTab === 'farms' && (
            <FarmsAndClientsView
              groups={groups}
              farms={farms}
              onAddFarm={handleAddFarm}
            />
          )}

          {activeTab === 'agent_trainer' && (
            <AgentTrainerView
              agentConfig={agentConfig}
              onSaveAgentConfig={setAgentConfig}
              onResetAgentConfig={() => setAgentConfig(INITIAL_AGENT_CONFIG)}
            />
          )}
        </main>

      </div>

    </div>
  );
}

export default App;
