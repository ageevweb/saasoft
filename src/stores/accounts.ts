import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { AccountStored, AccountFormState } from "@/types/accounts";
import {
  labelsTextToStored,
  labelsStoredToText,
  RECORD_TYPE_OPTIONS,
} from "@/types/accounts";

function generateId(): string {
  return crypto.randomUUID();
}

export const useAccountsStore = defineStore("accounts", () => {
  const items = ref<AccountStored[]>([]);

  const accounts = computed(() => items.value);

  function storedToForm(account: AccountStored): AccountFormState {
    return {
      id: account.id,
      labelsText: labelsStoredToText(account.labels),
      recordType: account.recordType,
      login: account.login,
      password: account.password ?? "",
    };
  }

  function addEmpty(): AccountFormState {
    const id = generateId();
    const newAccount: AccountStored = {
      id,
      labels: [],
      recordType: "Локальная",
      login: "",
      password: "",
    };
    items.value = [...items.value, newAccount];
    return storedToForm(newAccount);
  }

  function remove(id: string): void {
    items.value = items.value.filter((a) => a.id !== id);
  }

  function updateFromForm(state: AccountFormState): void {
    const idx = items.value.findIndex((a) => a.id === state.id);
    if (idx === -1) return;
    const labels = labelsTextToStored(state.labelsText);
    const password: string | null =
      state.recordType === "LDAP" ? null : state.password;
    items.value = items.value.map((a, i) =>
      i === idx
        ? {
            ...a,
            labels,
            recordType: state.recordType,
            login: state.login,
            password,
          }
        : a
    );
  }

  function getFormState(id: string): AccountFormState | undefined {
    const account = items.value.find((a) => a.id === id);
    return account ? storedToForm(account) : undefined;
  }

  return {
    items,
    accounts,
    RECORD_TYPE_OPTIONS,
    addEmpty,
    remove,
    updateFromForm,
    getFormState,
    storedToForm,
  };
}, { persist: true });
