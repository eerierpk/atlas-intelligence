import { useCallback, useEffect, useState } from "react";

const KEY = "medintel.journey.v1";

export interface DeviceProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  bookmarks: string[];
  lastLessonId?: string;
  updatedAt: number;
}

type Store = Record<string, DeviceProgress>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("medintel:journey-progress"));
}

export function readAllProgress(): Store {
  return read();
}

const empty = (): DeviceProgress => ({
  completedLessons: [],
  quizScores: {},
  bookmarks: [],
  updatedAt: Date.now(),
});

export function useJourneyProgress(deviceId: string) {
  const [state, setState] = useState<DeviceProgress>(() => read()[deviceId] ?? empty());

  useEffect(() => {
    setState(read()[deviceId] ?? empty());
    const onChange = () => setState(read()[deviceId] ?? empty());
    window.addEventListener("medintel:journey-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("medintel:journey-progress", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [deviceId]);

  const persist = useCallback(
    (next: DeviceProgress) => {
      const all = read();
      all[deviceId] = { ...next, updatedAt: Date.now() };
      write(all);
      setState(all[deviceId]);
    },
    [deviceId],
  );

  const markComplete = useCallback(
    (lessonId: string) => {
      const next = { ...state };
      if (!next.completedLessons.includes(lessonId)) {
        next.completedLessons = [...next.completedLessons, lessonId];
      }
      next.lastLessonId = lessonId;
      persist(next);
    },
    [state, persist],
  );

  const recordQuiz = useCallback(
    (chapterId: string, pct: number) => {
      persist({ ...state, quizScores: { ...state.quizScores, [chapterId]: pct } });
    },
    [state, persist],
  );

  const toggleBookmark = useCallback(
    (lessonId: string) => {
      const has = state.bookmarks.includes(lessonId);
      persist({
        ...state,
        bookmarks: has ? state.bookmarks.filter((b) => b !== lessonId) : [...state.bookmarks, lessonId],
      });
    },
    [state, persist],
  );

  const reset = useCallback(() => persist(empty()), [persist]);

  return { progress: state, markComplete, recordQuiz, toggleBookmark, reset };
}

export function pctComplete(p: DeviceProgress | undefined, totalLessons: number): number {
  if (!p || totalLessons === 0) return 0;
  return Math.round((p.completedLessons.length / totalLessons) * 100);
}
