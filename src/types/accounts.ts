export type RecordType = "LDAP" | "Локальная";

export interface LabelItem {
  text: string;
}

export interface AccountStored {
  id: string;
  labels: LabelItem[];
  recordType: RecordType;
  login: string;
  password: string | null;
}

export interface AccountFormState {
  id: string;
  labelsText: string;
  recordType: RecordType;
  login: string;
  password: string;
}

export const RECORD_TYPE_OPTIONS: RecordType[] = ["Локальная", "LDAP"];

export const LABELS_MAX_LENGTH = 50;
export const LOGIN_MAX_LENGTH = 100;
export const PASSWORD_MAX_LENGTH = 100;

export function labelsTextToStored(text: string): LabelItem[] {
  if (!text.trim()) return [];
  return text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s }));
}

export function labelsStoredToText(labels: LabelItem[]): string {
  return labels.map((l) => l.text).join("; ");
}
