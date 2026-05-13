import { useCallback, useEffect, useState } from "react";
import type { UserRole } from "./store";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  userRole: UserRole;
  title?: string;
  department?: string;
  phone?: string;
  /** Full years of professional experience (self-reported). */
  yearsExperience?: number;
  gender: "Male" | "Female" | "Do not want to specify";
  specializations: string[];
  status: "active" | "disabled";
  createdAt: number;
  lastLoginAt: number | null;
}

export interface OutboxEntry {
  id: string;
  to: string;
  subject: string;
  body: string;
  tempPassword: string;
  sentAt: number;
}

const KEY = "medintel.admin.v1";

interface Store {
  users: AdminUser[];
  outbox: OutboxEntry[];
}

const SEED: Store = {
  users: [
    {
      id: "u-admin",
      name: "Atlas Administrator",
      email: "admin@medintel.io",
      userRole: "Admin",
      title: "Platform Administrator",
      department: "IT",
      gender: "Do not want to specify",
      specializations: ["IT / Cybersecurity (Healthcare)"],
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      lastLoginAt: Date.now() - 1000 * 60 * 60 * 2,
      yearsExperience: 12,
    },
    {
      id: "u-expert",
      name: "Dr. Demo Expert",
      email: "expert.demo@medintel.io",
      userRole: "Healthcare Expert",
      title: "Clinical Content Reviewer",
      department: "Radiology",
      gender: "Female",
      specializations: ["Diagnostic Radiology", "Interventional Radiology"],
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
      lastLoginAt: Date.now() - 1000 * 60 * 60 * 18,
      yearsExperience: 22,
    },
    {
      id: "u-pro",
      name: "Maya Chen",
      email: "maya.chen@medintel.io",
      userRole: "Healthcare Professional",
      title: "Imaging Services Director",
      department: "Imaging",
      gender: "Female",
      specializations: ["Imaging Services Director / Manager", "Capital Planning / Finance"],
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      lastLoginAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      yearsExperience: 15,
    },
    {
      id: "u-stake",
      name: "Jonas Weber",
      email: "jonas.weber@medintel.io",
      userRole: "Business / Stakeholder",
      title: "Capital Planning Lead",
      department: "Finance",
      gender: "Male",
      specializations: ["Capital Planning / Finance", "Procurement / Sourcing"],
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      lastLoginAt: null,
      yearsExperience: 8,
    },
  ],
  outbox: [],
};

function read(): Store {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Store;
  } catch {
    return SEED;
  }
}
function write(s: Store) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function genPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz!@#$";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function useAdminStore() {
  const [store, setStore] = useState<Store>(() => read());

  useEffect(() => { write(store); }, [store]);

  const create = useCallback((u: Omit<AdminUser, "id" | "createdAt" | "lastLoginAt" | "status">) => {
    const newUser: AdminUser = {
      ...u,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastLoginAt: null,
      status: "active",
    };
    const tempPassword = genPassword();
    const entry: OutboxEntry = {
      id: crypto.randomUUID(),
      to: u.email,
      subject: `Welcome to MedIntel Atlas — your account is ready`,
      body: `Hi ${u.name},\n\nAn account has been provisioned for you on MedIntel Atlas with the role "${u.userRole}". Use the temporary password below to sign in; you will be prompted to change it on first login.\n\nTemporary password: ${tempPassword}\n\n— MedIntel Atlas (Simulated email — prototype)`,
      tempPassword,
      sentAt: Date.now(),
    };
    setStore(s => ({
      users: [newUser, ...s.users],
      outbox: [entry, ...s.outbox].slice(0, 20),
    }));
    return { user: newUser, outbox: entry };
  }, []);

  const update = useCallback((id: string, patch: Partial<AdminUser>) => {
    setStore(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
  }, []);

  const setStatus = useCallback((id: string, status: AdminUser["status"]) => {
    setStore(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, status } : u) }));
  }, []);

  const resetAccess = useCallback((id: string) => {
    const u = store.users.find(x => x.id === id);
    if (!u) return null;
    const tempPassword = genPassword();
    const entry: OutboxEntry = {
      id: crypto.randomUUID(),
      to: u.email,
      subject: `MedIntel Atlas — access reset`,
      body: `Hi ${u.name},\n\nYour MedIntel Atlas access was reset. Sign in with the temporary password below.\n\nTemporary password: ${tempPassword}\n\n— MedIntel Atlas (Simulated email — prototype)`,
      tempPassword,
      sentAt: Date.now(),
    };
    setStore(s => ({ ...s, outbox: [entry, ...s.outbox].slice(0, 20) }));
    return entry;
  }, [store.users]);

  return { users: store.users, outbox: store.outbox, create, update, setStatus, resetAccess };
}
