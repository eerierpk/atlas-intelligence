import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AISession, SavedComparison } from "./types";

interface AtlasState {
  user: { name: string; email: string; role: string } | null;
  login: (email: string) => void;
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
  const [recentDeviceIds, setRecentDeviceIds] = useState<string[]>([]);

  const login = useCallback((email: string) => {
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Demo User";
    setUser({ name, email, role: "Healthcare Infrastructure Strategy Lead" });
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

  const pushRecent = useCallback((id: string) => {
    setRecentDeviceIds(prev => [id, ...prev.filter(x => x !== id)].slice(0, 8));
  }, []);

  const value = useMemo<AtlasState>(() => ({
    user, login, logout,
    savedDevices, toggleSaved,
    comparisonIds, toggleCompare, clearCompare,
    savedComparisons, saveComparison, removeSavedComparison,
    aiSessions, upsertSession, removeSession,
    recentDeviceIds, pushRecent,
  }), [user, savedDevices, comparisonIds, savedComparisons, aiSessions, recentDeviceIds, login, logout, toggleSaved, toggleCompare, clearCompare, saveComparison, removeSavedComparison, upsertSession, removeSession, pushRecent]);

  return <AtlasCtx.Provider value={value}>{children}</AtlasCtx.Provider>;
}

export function useAtlas() {
  const ctx = useContext(AtlasCtx);
  if (!ctx) throw new Error("useAtlas must be used inside AtlasProvider");
  return ctx;
}
