import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AISession, IntelExpertWorkspaceEntry, SavedComparison } from "./types";

export type UserRole = "Student" | "Healthcare Professional" | "Healthcare Expert" | "Business / Stakeholder" | "Admin";

export interface AtlasUser {
  name: string;
  email: string;
  /** Display title (free text). */
  role: string;
  /** Structured role enum used for RBAC simulation. */
  userRole: UserRole;
  gender?: string;
  yearsExperience?: number;
  specialization?: string;
  /** Multi-select specialization tags from Appendix A taxonomy. */
  specializations?: string[];
  credentials?: string;
  title?: string;
}

/** Demo expert email — signing in with this address grants Healthcare Expert role (prototype). */
export const DEMO_EXPERT_EMAIL = "expert.demo@medintel.io";
/** Demo admin email — signing in with this address grants Admin role (prototype). */
export const DEMO_ADMIN_EMAIL = "admin@medintel.io";

interface AtlasState {
  user: AtlasUser | null;
  login: (email: string, opts?: { name?: string; userRole?: UserRole; role?: string }) => void;
  signup: (data: Omit<AtlasUser, "role"> & { role?: string }) => void;
  logout: () => void;
  savedDevices: string[];
  toggleSaved: (id: string) => void;
  comparisonIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  savedComparisons: SavedComparison[];
  saveComparison: (title: string) => void;
  removeSavedComparison: (id: string) => void;
  aiSessions: AISession[];
  upsertSession: (s: AISession) => void;
  removeSession: (id: string) => void;
  intelExpertSessions: IntelExpertWorkspaceEntry[];
  upsertIntelExpertSession: (e: IntelExpertWorkspaceEntry) => void;
  removeIntelExpertSession: (id: string) => void;
  recentDeviceIds: string[];
  pushRecent: (id: string) => void;
}

const AtlasCtx = createContext<AtlasState | null>(null);

/** Maximum devices in the Compare workspace (enforced in `toggleCompare`). */
export const MAX_COMPARE_DEVICES = 4;

export function AtlasProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AtlasState["user"]>(null);
  const [savedDevices, setSavedDevices] = useState<string[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [aiSessions, setAiSessions] = useState<AISession[]>([]);
  const [intelExpertSessions, setIntelExpertSessions] = useState<IntelExpertWorkspaceEntry[]>([]);
  const [recentDeviceIds, setRecentDeviceIds] = useState<string[]>([]);

  const login = useCallback((email: string, opts?: { name?: string; userRole?: UserRole; role?: string }) => {
    const trimmed = email.trim();
    const local = trimmed.split("@")[0] ?? "";
    const defaultName =
      local.replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Demo User";
    const lower = trimmed.toLowerCase();
    const isExpertDemo = lower === DEMO_EXPERT_EMAIL.toLowerCase() || opts?.userRole === "Healthcare Expert";
    const isAdminDemo = lower === DEMO_ADMIN_EMAIL.toLowerCase() || opts?.userRole === "Admin";
    setUser({
      name: opts?.name ?? defaultName,
      email: trimmed,
      role:
        opts?.role ??
        (isAdminDemo
          ? "Atlas Administrator — Demo"
          : isExpertDemo
            ? "Clinical Content Reviewer — Demo"
            : "Healthcare Infrastructure Strategy Lead"),
      userRole:
        opts?.userRole ??
        (isAdminDemo ? "Admin" : isExpertDemo ? "Healthcare Expert" : "Healthcare Professional"),
    });
  }, []);
  const signup = useCallback((data: Omit<AtlasUser, "role"> & { role?: string }) => {
    setUser({
      ...data,
      role: data.role ?? data.userRole,
    });
  }, []);
  const logout = useCallback(() => setUser(null), []);

  const toggleSaved = useCallback((id: string) => {
    setSavedDevices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE_DEVICES) return prev;
      return [...prev, id];
    });
  }, []);
  const clearCompare = useCallback(() => setComparisonIds([]), []);

  const saveComparison = useCallback((title: string) => {
    setSavedComparisons(prev => [
      { id: crypto.randomUUID(), deviceIds: comparisonIds, createdAt: Date.now(), title },
      ...prev,
    ]);
  }, [comparisonIds]);
  const removeSavedComparison = useCallback((id: string) => setSavedComparisons(p => p.filter(x => x.id !== id)), []);

  const upsertSession = useCallback((s: AISession) => {
    setAiSessions(prev => {
      const idx = prev.findIndex(x => x.id === s.id);
      if (idx >= 0) { const copy = prev.slice(); copy[idx] = s; return copy; }
      return [s, ...prev];
    });
  }, []);
  const removeSession = useCallback((id: string) => setAiSessions(p => p.filter(x => x.id !== id)), []);

  const upsertIntelExpertSession = useCallback((e: IntelExpertWorkspaceEntry) => {
    setIntelExpertSessions(prev => {
      const idx = prev.findIndex(x => x.id === e.id);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = e;
        return copy;
      }
      return [e, ...prev];
    });
  }, []);
  const removeIntelExpertSession = useCallback((id: string) => setIntelExpertSessions(p => p.filter(x => x.id !== id)), []);

  const pushRecent = useCallback((id: string) => {
    setRecentDeviceIds(prev => [id, ...prev.filter(x => x !== id)].slice(0, 8));
  }, []);

  const value = useMemo<AtlasState>(() => ({
    user, login, signup, logout,
    savedDevices, toggleSaved,
    comparisonIds, toggleCompare, clearCompare,
    savedComparisons, saveComparison, removeSavedComparison,
    aiSessions, upsertSession, removeSession,
    intelExpertSessions, upsertIntelExpertSession, removeIntelExpertSession,
    recentDeviceIds, pushRecent,
  }), [user, savedDevices, comparisonIds, savedComparisons, aiSessions, intelExpertSessions, recentDeviceIds, login, signup, logout, toggleSaved, toggleCompare, clearCompare, saveComparison, removeSavedComparison, upsertSession, removeSession, upsertIntelExpertSession, removeIntelExpertSession, pushRecent]);

  return <AtlasCtx.Provider value={value}>{children}</AtlasCtx.Provider>;
}

export function useAtlas() {
  const ctx = useContext(AtlasCtx);
  if (!ctx) throw new Error("useAtlas must be used inside AtlasProvider");
  return ctx;
}
