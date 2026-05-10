import type { Modality } from "@/lib/atlas/types";

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "callout"; tone: "info" | "warn" | "ok"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "image"; src: string; alt: string; caption?: string; credit?: string }
  | { kind: "tagTable"; rows: { tag: string; name: string; value: string }[] }
  | { kind: "deepDive"; title: string; text: string };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  body: LessonBlock[];
}

export interface QuizQuestion {
  q: string;
  type: "single" | "multi";
  options: string[];
  correct: number[];
  rationale: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
  checkpoint: QuizQuestion[];
}

export interface ElementTile {
  id: string;
  name: string;
  layer: "Modality" | "Workstation" | "Network" | "Archive/Cloud";
  category: "Hardware" | "Software" | "Ecosystem";
  blurb: string;
  detail: string;
}

export interface GlossaryTerm {
  term: string;
  short: string;
  long?: string;
}

export interface Resource {
  label: string;
  org: string;
  url: string;
}

export interface Curriculum {
  modality: Modality;
  overview: string;
  setup: Chapter[];
  use: Chapter[];
  elements: ElementTile[];
  glossary: GlossaryTerm[];
  resources: Resource[];
}
