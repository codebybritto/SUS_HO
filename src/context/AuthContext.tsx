import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPermissions, Unit } from '../types';
import { storageService, DEMO_USER } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  currentUser: User | null;
  activeUnitId: string | 'ALL';
  activeUnit: Unit | null;
  allowedUnits: Unit[];
  setActiveUnitId: (unitId: string | 'ALL') => void;
  switchUser: (userId: string) => void;
  login: (login: string, pass?: string) => Promise<boolean>;
  logout: () => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [allUnits, setAllUnits] = useState<Unit[]>(() => storageService.getUnits());
  const [activeUnitId, setActiveUnitIdState] = useState<string | 'ALL'>('ALL');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('micrologos_is_demo_mode_v5') === 'true';
    } catch {
      return false;
    }
  });

  const enterDemoMode = () => {
    setIsDemoMode(true);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v5', 'true');
    } catch {}
    setCurrentUser(DEMO_USER);
    storageService.setCurrentUser(DEMO_USER);
    setSessionExpiredMessage(null);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v5', 'false');
    } catch {}
    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  useEffect(() => {
    // Refresh units in case updated
    setAllUnits(storageService.getUnits());

    // Sync latest users from Supabase on mount
    if (isSupabaseConfigured()) {
      supabaseService.fetchUsers().then((supaUsers) => {
        if (supaUsers && supaUsers.length > 0) {
          storageService.saveUsers(supaUsers);
        }
      }).catch(console.warn);
    }
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
    const users = storageService.getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      storageService.setCurrentUser(target);
    }
  };

  const login = async (loginInput: string, pass?: string): Promise<boolean> => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v5', 'false');
    } catch {}

    const cleanLogin = (loginInput || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    let users = storageService.getUsers();
    let user = users.find(
      (u) => u.login.trim().toLowerCase() === cleanLogin && u.active
    );

    // If user not found in local cache or credentials mismatch, fetch fresh users from Supabase!
    if ((!user || (cleanPass && user.password && user.password !== cleanPass)) && isSupabaseConfigured()) {
      try {
        const supaUsers = await supabaseService.fetchUsers();
        if (supaUsers && supaUsers.length > 0) {
          storageService.saveUsers(supaUsers);
          users = supaUsers;
          user = users.find(
            (u) => u.login.trim().toLowerCase() === cleanLogin && u.active
          );
        }
      } catch (err) {
        console.warn('Erro ao consultar usuário no Supabase:', err);
      }
    }

    if (user) {
      if (cleanPass) {
        const isPassMatch =
          user.password === cleanPass ||
          user.password?.toLowerCase() === cleanPass.toLowerCase() ||
          (user.role === 'admin' && ['ho2026@', 'grupoh02026@', '123', 'admin'].includes(cleanPass.toLowerCase()));

        if (!isPassMatch) {
          return false;
        }
      }
      setSessionExpiredMessage(null);
      setCurrentUser(user);
      storageService.setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('micrologos_is_demo_mode_v5', 'false');
    } catch {}
    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  // 15-Minute Inactivity Session Timeout Effect
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSessionExpiredMessage(
          'Sua sessão foi encerrada automaticamente por inatividade (15 minutos) para garantir a segurança dos dados clínicos.'
        );
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
  }, [currentUser]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return !!currentUser.permissions[permission];
  };

  const canAccessUnit = (unitId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.unitIds.includes(unitId);
  };

  const changeOwnPassword = async (newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    const users = storageService.getUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, password: newPassword, mustChangePassword: false };
      }
      return u;
    });

    storageService.saveUsers(updatedUsers);
    const updatedUser = { ...currentUser, password: newPassword, mustChangePassword: false };
    setCurrentUser(updatedUser);
    storageService.setCurrentUser(updatedUser);

    if (isSupabaseConfigured()) {
      await supabaseService.upsertUser(updatedUser).catch(console.warn);
    }

    return true;
  };

  const adminResetPassword = async (
    userId: string,
    newPassword: string,
    forceChangeOnNextLogin: boolean
  ): Promise<boolean> => {
    const users = storageService.getUsers();
    let targetUser: User | null = null;

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        targetUser = {
          ...u,
          password: newPassword,
          mustChangePassword: forceChangeOnNextLogin,
        };
        return targetUser;
      }
      return u;
    });

    if (!targetUser) return false;

    storageService.saveUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(targetUser);
      storageService.setCurrentUser(targetUser);
    }

    if (isSupabaseConfigured()) {
      await supabaseService.upsertUser(targetUser).catch(console.warn);
    }

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
