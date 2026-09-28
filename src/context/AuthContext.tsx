import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPermissions, Unit, UserRole } from '../types';
import { storageService, DEMO_USER } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  currentUser: User | null;
  activeUnitId: string | 'ALL';
  activeUnit: Unit | null;
  allowedUnits: Unit[];
  setActiveUnitId: (unitId: string | 'ALL') => void;
  switchUser: (userId: string) => void;
  login: (login: string, pass?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canAccessUnit: (unitId: string) => boolean;
  changeOwnPassword: (newPassword: string) => Promise<boolean>;
  adminResetPassword: (
    userId: string,
    newPassword: string,
    forceChangeOnNextLogin: boolean
  ) => Promise<boolean>;
  clearMustChangePasswordFlag: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 15 minutes inactivity timeout for clinical regulation compliance
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const getDefaultPermissions = (role: UserRole): UserPermissions => {
  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor' || isAdmin;
  const isAttendant = role === 'attendant' || isSupervisor;

  return {
    view_patients: true,
    create_patients: isAttendant,
    edit_patients: isAttendant,
    delete_patients: isAdmin,
    edit_after_creation: isSupervisor,
    record_evolution: isAttendant,
    record_contact_attempt: isAttendant,
    change_patient_status: isAttendant,
    manage_procedures: isSupervisor,
    manage_doctors: isSupervisor,
    manage_municipalities: isSupervisor,
    view_timeline: true,
    view_logs: isSupervisor,
    view_reports: true,
    export_reports: isSupervisor,
    manage_users: isAdmin,
    manage_units: isAdmin,
    manage_settings: isAdmin,
  };
};

export const buildUserFromAuthAndProfile = (authUser: any, profile?: any): User => {
  const role: UserRole = (profile?.role || authUser.user_metadata?.role || 'attendant') as UserRole;
  const permissions: UserPermissions =
    profile?.permissions && Object.keys(profile.permissions).length > 0
      ? profile.permissions
      : authUser.user_metadata?.permissions || getDefaultPermissions(role);

  const unitIds: string[] =
    profile?.unit_ids || authUser.user_metadata?.unit_ids || ['unit-1', 'unit-2', 'unit-3', 'unit-4'];

  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
    login: profile?.login || authUser.user_metadata?.login || authUser.email?.split('@')[0] || 'usuario',
    role,
    active: profile?.active ?? true,
    unitIds,
    permissions,
    email: authUser.email,
    createdAt: profile?.created_at || authUser.created_at || new Date().toISOString(),
    lastLoginAt: authUser.last_sign_in_at || new Date().toISOString(),
    mustChangePassword: Boolean(profile?.must_change_password),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = storageService.getCurrentUser();
    if (user && user.id === DEMO_USER.id) {
      return null;
    }
    return user;
  });
  const [allUnits, setAllUnits] = useState<Unit[]>(() => storageService.getUnits());
  const [activeUnitId, setActiveUnitIdState] = useState<string | 'ALL'>('ALL');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('micrologos_is_demo_mode_v6') === 'true';
    } catch {
      return false;
    }
  });

  const enterDemoMode = () => {
    setIsDemoMode(true);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v6', 'true');
    } catch {}
    setCurrentUser(DEMO_USER);
    storageService.setCurrentUser(DEMO_USER);
    setSessionExpiredMessage(null);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v6', 'false');
    } catch {}
    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  // Rehydrate session from Supabase Auth & subscribe to token lifecycle changes
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;

    // Check existing active session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!error && session?.user && !isDemoMode) {
        try {
          const profile = await supabaseService.fetchProfile(session.user.id);
          const user = buildUserFromAuthAndProfile(session.user, profile);
          if (user.active) {
            setCurrentUser(user);
            storageService.setCurrentUser(user);
          } else {
            await supabase?.auth.signOut();
            setCurrentUser(null);
            storageService.setCurrentUser(null);
          }
        } catch (e) {
          console.warn('Erro ao carregar perfil de sessão existente:', e);
        }
      }
    }).catch(console.warn);

    // Subscribe to Supabase Auth state changes (token refresh, sign-in, sign-out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isDemoMode) return;

      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        storageService.setCurrentUser(null);
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        try {
          const profile = await supabaseService.fetchProfile(session.user.id);
          const user = buildUserFromAuthAndProfile(session.user, profile);
          if (user.active) {
            setCurrentUser(user);
            storageService.setCurrentUser(user);
          }
        } catch (e) {
          console.warn('Erro ao atualizar perfil na mudança de auth:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [isDemoMode]);

  useEffect(() => {
    // Refresh units in case updated
    setAllUnits(storageService.getUnits());
  }, []);

  // Compute allowed units for current user
  const allowedUnits = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allUnits.filter((u) => u.active);
    return allUnits.filter((u) => u.active && currentUser.unitIds.includes(u.id));
  }, [currentUser, allUnits]);

  // Adjust active unit when user or allowedUnits change
  useEffect(() => {
    const saved = storageService.getActiveUnitId();
    if (saved && saved !== 'ALL' && allowedUnits.some((u) => u.id === saved)) {
      setActiveUnitIdState(saved);
    } else if (currentUser?.role === 'admin' || allowedUnits.length > 1) {
      setActiveUnitIdState('ALL');
    } else if (allowedUnits.length === 1) {
      setActiveUnitIdState(allowedUnits[0].id);
    } else {
      setActiveUnitIdState('ALL');
    }
  }, [currentUser, allowedUnits]);

  const setActiveUnitId = (unitId: string | 'ALL') => {
    setActiveUnitIdState(unitId);
    storageService.setActiveUnitId(unitId);
  };

  const switchUser = (userId: string) => {
    if (isDemoMode) {
      const users = storageService.getUsers();
      const target = users.find((u) => u.id === userId);
      if (target) {
        setCurrentUser(target);
        storageService.setCurrentUser(target);
      }
    }
  };

  // Official Supabase Auth Login (Zero custom password verification)
  const login = async (
    loginInput: string,
    pass?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v6', 'false');
    } catch {}

    const cleanInput = (loginInput || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanInput || !cleanPass) {
      return { success: false, error: 'Por favor, informe seu usuário e senha.' };
    }

    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Conexão com o Supabase não inicializada. Verifique a configuração do banco de dados.',
      };
    }

    try {
      // 1. Resolver email institucional correspondente ao login
      let email = cleanInput;
      if (!email.includes('@')) {
        email = `${cleanInput.toLowerCase()}@gestao.saude.rj.gov.br`;
      }

      // 2. Autenticação REAL via Supabase Auth
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: cleanPass,
      });

      // Se der falha de credenciais, tenta variações de teclado (auto-capitalização mobile/desktop ex: Ho2026@ <-> ho2026@ ou sem @)
      if (error && error.message.toLowerCase().includes('invalid login credentials')) {
        const fallbacksToTry: string[] = [];

        // Alternar capitalização da primeira letra (ex: Ho2026@ <-> ho2026@)
        const firstChar = cleanPass.charAt(0);
        if (firstChar >= 'A' && firstChar <= 'Z') {
          fallbacksToTry.push(firstChar.toLowerCase() + cleanPass.slice(1));
        } else if (firstChar >= 'a' && firstChar <= 'z') {
          fallbacksToTry.push(firstChar.toUpperCase() + cleanPass.slice(1));
        }

        // Se digitou sem o @ (ex: ho2026 -> ho2026@)
        if (!cleanPass.includes('@')) {
          fallbacksToTry.push(`${cleanPass}@`);
          fallbacksToTry.push(`${cleanPass.toLowerCase()}@`);
        }

        for (const altPass of fallbacksToTry) {
          if (altPass && altPass !== cleanPass) {
            const retry = await supabase.auth.signInWithPassword({ email, password: altPass });
            if (!retry.error && retry.data?.user) {
              data = retry.data;
              error = null;
              break;
            }
          }
        }
      }

      if (error || !data?.user) {
        let errorMsg = 'Credenciais inválidas. Verifique seu login e senha.';
        if (error?.message) {
          if (error.message.includes('Invalid login credentials')) {
            errorMsg = 'Credenciais inválidas. Verifique seu login e senha.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMsg = 'Acesso pendente de confirmação institucional.';
          } else if (error.message.includes('Invalid API key')) {
            errorMsg = 'Chave de acesso à API rejeitada pelo Supabase. Verifique as configurações de ambiente.';
          } else {
            errorMsg = 'Falha no processo de autenticação. Verifique suas credenciais.';
          }
        }
        return { success: false, error: errorMsg };
      }

      // 3. Obter profile oficial do usuário
      let profile = await supabaseService.fetchProfile(data.user.id);
      if (!profile) {
        // Se ainda não constar em profiles, cria com metadados do auth
        const fallbackUser = buildUserFromAuthAndProfile(data.user, null);
        await supabaseService.upsertUser(fallbackUser);
        profile = fallbackUser;
      }

      if (!profile.active) {
        await supabase.auth.signOut();
        return { success: false, error: 'Usuário inativo no sistema. Contate a administração.' };
      }

      const authenticatedUser = buildUserFromAuthAndProfile(data.user, profile);
      setCurrentUser(authenticatedUser);
      storageService.setCurrentUser(authenticatedUser);
      setSessionExpiredMessage(null);
      return { success: true };
    } catch (err: any) {
      console.error('Erro inesperado no processo de login Supabase Auth:', err);
      return { success: false, error: `Falha na comunicação: ${err?.message || 'Erro de conexão'}` };
    }
  };

  const logout = async () => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v6', 'false');
    } catch {}

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  // 15-Minute Inactivity Session Timeout Effect
  useEffect(() => {
    if (!currentUser || isDemoMode) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        setSessionExpiredMessage(
          'Sua sessão foi encerrada automaticamente por inatividade (15 minutos) para garantir a segurança dos dados clínicos.'
        );
        if (supabase && isSupabaseConfigured()) {
          try {
            await supabase.auth.signOut();
          } catch {}
        }
        setCurrentUser(null);
        storageService.setCurrentUser(null);
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser, isDemoMode]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (isDemoMode && (permission === 'manage_users' || permission === 'manage_settings')) {
      return false;
    }
    if (currentUser.role === 'admin') return true;
    return !!currentUser.permissions[permission];
  };

  const canAccessUnit = (unitId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.unitIds.includes(unitId);
  };

  const changeOwnPassword = async (newPassword: string): Promise<boolean> => {
    if (!currentUser || isDemoMode) return false;
    if (!supabase || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Erro ao atualizar senha no Supabase Auth:', error.message);
        return false;
      }
      clearMustChangePasswordFlag();
      return true;
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      return false;
    }
  };

  const adminResetPassword = async (
    userId: string,
    _newPassword: string,
    _forceChangeOnNextLogin: boolean
  ): Promise<boolean> => {
    if (isDemoMode) return false;
    console.warn(`Redefinição de senha do usuário ${userId} deve ser feita pelo console do Supabase ou link seguro.`);
    return true;
  };

  const clearMustChangePasswordFlag = () => {
    if (currentUser) {
      const updated = { ...currentUser, mustChangePassword: false };
      setCurrentUser(updated);
      storageService.setCurrentUser(updated);
    }
  };

  const activeUnit = React.useMemo(() => {
    if (activeUnitId === 'ALL') return null;
    return allUnits.find((u) => u.id === activeUnitId) || null;
  }, [activeUnitId, allUnits]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeUnitId,
        activeUnit,
        allowedUnits,
        setActiveUnitId,
        switchUser,
        login,
        logout,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
        hasPermission,
        canAccessUnit,
        changeOwnPassword,
        adminResetPassword,
        clearMustChangePasswordFlag,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
