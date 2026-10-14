// AuthView Component - Gran Bernardo Agro
// Tela de Login, Criação de Conta e Recuperação de Senha
import React, { useState } from 'react';
import { 
  Sprout, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  MapPin, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Landmark, 
  Bot,
  HelpCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('roberto@granbernardoagro.com.br');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('consultant');
  const [regOrg, setRegOrg] = useState('');
  const [regState, setRegState] = useState('MT');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Feedback & Loading
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Vazia', color: 'transparent' };
    if (pass.length < 6) return { score: 1, label: 'Fraca', color: '#ef4444' };
    if (pass.length < 10 || !/\d/.test(pass)) return { score: 2, label: 'Média', color: '#f59e0b' };
    return { score: 3, label: 'Forte & Segura', color: '#10b981' };
  };

  const regStrength = getPasswordStrength(regPassword);

  // Quick Demo Logins
  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      let demoUser: UserProfile;
      if (role === 'consultant') {
        demoUser = {
          id: 'usr-bernardo-01',
          name: 'Dr. Roberto Bernardo',
          role: 'consultant',
          organization: 'Gran Bernardo Consultoria & Reestruturações',
          email: 'roberto@granbernardoagro.com.br'
        };
      } else if (role === 'producer') {
        demoUser = {
          id: 'usr-prod-02',
          name: 'Carlos Alberto Santa Maria',
          role: 'producer',
          organization: 'Grupo Agropecuário Santa Maria (Sede MT)',
          email: 'carlos@fazendasantamaria.agr.br'
        };
      } else {
        demoUser = {
          id: 'usr-admin-00',
          name: 'Controladoria & Auditoria Agro',
          role: 'admin',
          organization: 'Gran Bernardo Holding',
          email: 'auditoria@granbernardoagro.com.br'
        };
      }
      setIsLoading(false);
      onLoginSuccess(demoUser);
    }, 400);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor, preencha o e-mail e a senha de acesso.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Simulação de login
      const user: UserProfile = {
        id: `usr-${Date.now()}`,
        name: loginEmail.includes('roberto') ? 'Dr. Roberto Bernardo' : 'Usuário Gran Bernardo',
        role: loginEmail.includes('produtor') ? 'producer' : 'consultant',
        organization: 'Gran Bernardo Agro & Consultoria Rural',
        email: loginEmail
      };
      setIsLoading(false);
      onLoginSuccess(user);
    }, 450);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Nome completo e e-mail corporativo são obrigatórios.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Você deve concordar com os termos de governança e sigilo de dados rurais.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-reg-${Date.now()}`,
        name: regName,
        role: regRole,
        organization: regOrg || (regRole === 'producer' ? 'Grupo Agropecuário' : 'Consultoria Rural'),
        email: regEmail
      };
      setIsLoading(false);
      onLoginSuccess(newUser);
    }, 550);
  };

  // Submit Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Informe o e-mail cadastrado para redefinição.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #141b29 0%, #0b0f17 100%)',
      padding: '24px 16px',
      color: '#f8fafc'
    }}>
      
      {/* Central Split Card */}
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)'
      }}>

        {/* LEFT COLUMN: Institutional Value Proposition & Agribusiness Excellence */}
        <div style={{
          background: 'linear-gradient(165deg, #0e1420 0%, #090d14 100%)',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--color-border)',
          position: 'relative'
        }}>
          <div>
            {/* Logo Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <Sprout size={20} color="#06b6d4" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                    GRAN BERNARDO
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#22d3ee', fontWeight: 800, letterSpacing: '0.06em' }}>
                    AGRO
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Consultoria Financeira & Reestruturação
                </p>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25, marginBottom: '12px' }}>
              Inteligência e Segurança Financeira para o Agronegócio
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '32px' }}>
              Plataforma determinística especializada em diagnóstico de safras, CPRs, Barter e alongamento de passivos bancários (MCR 2.6.9).
            </p>

            {/* 3 Core Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0
                }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>Gestão de Safra & Break-Even</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Modelagem de custos operacionais diretos, sensibilidade de cotação e margem líquida por hectare.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                  flexShrink: 0
                }}>
                  <Landmark size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>Reestruturação de Dívidas & CPRs</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Reprogramação de cronogramas de custeio, prorrogação legal MCR 2.6.9 e proteção contra quebra.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4b5fd',
                  flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>Consultora IA Especialista</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Interpretação autônoma de balanços, geração de dossiês e recomendações com rigor determinístico.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Trust Badge */}
          <div style={{
            marginTop: '36px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="#10b981" />
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Governança de Dados Financeiros:</span> Sigilo absoluto e adequação aos padrões agropecuários bancários.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Cockpit */}
        <div style={{
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--color-card)'
        }}>

          {/* Mode Switcher Tabs */}
          {authMode !== 'forgot' && (
            <div style={{
              display: 'flex',
              background: 'var(--color-surface-2)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: authMode === 'login' ? '#06b6d4' : 'transparent',
                  color: authMode === 'login' ? '#081018' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: authMode === 'register' ? '#06b6d4' : 'transparent',
                  color: authMode === 'register' ? '#081018' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: '#f87171'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ==========================================
              MODE 1: LOGIN
              ========================================== */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Acesse sua Área de Trabalho
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Digite suas credenciais de consultoria ou selecione um perfil de demonstração.
                </p>
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label className="form-label">E-mail Cadastrado</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@granbernardoagro.com.br"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMessage(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#06b6d4',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--color-text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>Manter conectado nesta estação</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', height: '42px', fontSize: '0.88rem', marginTop: '6px' }}
              >
                {isLoading ? (
                  <span>Validando Credenciais...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Quick Demo Access Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '10px 0 2px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Acesso Rápido de Teste
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>

              {/* Demo Profiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('consultant')}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 6px',
                    fontSize: '0.72rem',
                    flexDirection: 'column',
                    gap: '4px',
                    minHeight: '52px',
                    textAlign: 'center'
                  }}
                  title="Dr. Roberto Bernardo"
                >
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>Consultor</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--color-text-subtle)' }}>Dr. Roberto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('producer')}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 6px',
                    fontSize: '0.72rem',
                    flexDirection: 'column',
                    gap: '4px',
                    minHeight: '52px',
                    textAlign: 'center'
                  }}
                  title="Grupo Santa Maria"
                >
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>Produtor</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--color-text-subtle)' }}>G. Sta. Maria</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 6px',
                    fontSize: '0.72rem',
                    flexDirection: 'column',
                    gap: '4px',
                    minHeight: '52px',
                    textAlign: 'center'
                  }}
                  title="Auditoria & Holding"
                >
                  <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Admin</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--color-text-subtle)' }}>Auditoria</span>
                </button>
              </div>
            </form>
          )}

          {/* ==========================================
              MODE 2: REGISTER (CRIAR CONTA)
              ========================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Criar Conta na Gran Bernardo
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Cadastre sua consultoria ou grupo produtor para análise financeira avançada.
                </p>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--color-text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Dr. Roberto Bernardo ou João da Silva"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              {/* Email & Profile Role (2 columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@agro.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Perfil de Atuação</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="form-select"
                  >
                    <option value="consultant">Consultor Financeiro Agro</option>
                    <option value="producer">Produtor / Grupo Rural</option>
                    <option value="admin">Gestor / Administrador</option>
                  </select>
                </div>
              </div>

              {/* Organization & State */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Fazenda / Consultoria</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} color="var(--color-text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    <input
                      type="text"
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder="Ex: Fazenda Santa Maria"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado (UF)</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="form-select"
                  >
                    <option value="MT">Mato Grosso (MT)</option>
                    <option value="GO">Goiás (GO)</option>
                    <option value="MS">Mato Grosso do Sul (MS)</option>
                    <option value="PR">Paraná (PR)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                    <option value="BA">Bahia (BA)</option>
                    <option value="RS">Rio Grande do Sul (RS)</option>
                    <option value="SP">São Paulo (SP)</option>
                    <option value="TO">Tocantins (TO)</option>
                    <option value="MA">Maranhão (MA)</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Senha de Acesso</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Senha</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {regPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--color-text-subtle)' }}>Segurança:</span>
                  <div style={{ display: 'flex', gap: '3px', flex: 1, height: '4px' }}>
                    <div style={{ flex: 1, borderRadius: '2px', background: regStrength.score >= 1 ? regStrength.color : 'rgba(255,255,255,0.1)' }} />
                    <div style={{ flex: 1, borderRadius: '2px', background: regStrength.score >= 2 ? regStrength.color : 'rgba(255,255,255,0.1)' }} />
                    <div style={{ flex: 1, borderRadius: '2px', background: regStrength.score >= 3 ? regStrength.color : 'rgba(255,255,255,0.1)' }} />
                  </div>
                  <span style={{ color: regStrength.color, fontWeight: 600 }}>{regStrength.label}</span>
                </div>
              )}

              {/* Terms of Confidentiality Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: '#06b6d4', marginTop: '2px', cursor: 'pointer' }}
                  required
                />
                <label htmlFor="agreeTerms" style={{ cursor: 'pointer', lineHeight: 1.35 }}>
                  Concordo com os <strong style={{ color: '#fff' }}>Termos de Governança & Sigilo Rural</strong> para análise determinística de balanços e dívidas.
                </label>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', height: '42px', fontSize: '0.88rem', marginTop: '4px' }}
              >
                {isLoading ? (
                  <span>Criando Conta e Ambiente...</span>
                ) : (
                  <>
                    <span>Concluir Cadastro & Acessar</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ==========================================
              MODE 3: FORGOT PASSWORD
              ========================================== */}
          {authMode === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Recuperação de Acesso
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Informe o seu e-mail para receber as instruções seguras de redefinição de senha.
                </p>
              </div>

              {forgotSuccess ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', margin: 0 }}>Instruções Enviadas!</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    Enviamos um link de redefinição para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada e spam.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setForgotSuccess(false); setErrorMessage(''); }}
                    className="btn btn-primary"
                    style={{ marginTop: '14px', width: '100%' }}
                  >
                    Voltar ao Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">E-mail Cadastrado</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--color-text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.email@granbernardoagro.com.br"
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '40px', fontSize: '0.84rem' }}
                  >
                    {isLoading ? 'Enviando link...' : 'Enviar Link de Redefinição'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.76rem',
                        cursor: 'pointer'
                      }}
                    >
                      ← Voltar para a tela de login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
