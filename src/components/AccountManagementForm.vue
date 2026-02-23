<template>
  <div class="form">
    <header class="header">
      <h1 class="title">Учетные записи</h1>
      <Button
        icon="pi pi-plus"
        aria-label="Добавить учетную запись"
        @click="addAccount"
      />
    </header>

    <Message severity="info" icon="pi pi-info-circle" class="hint-message">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </Message>

    <div class="grid-list">
      <div class="grid-row grid-row--header">
        <span class="grid-cell grid-cell--labels">Метки</span>
        <span class="grid-cell grid-cell--type">Тип записи</span>
        <span class="grid-cell grid-cell--login">Логин</span>
        <span class="grid-cell grid-cell--password">Пароль</span>
        <span class="grid-cell grid-cell--actions"></span>
      </div>
      <TransitionGroup name="row-list" tag="div" class="grid-list-rows">
        <div
          v-for="state in formStates"
          :key="state.id"
          class="grid-row grid-row--body"
        >
        <div class="grid-cell grid-cell--labels">
          <InputText
            v-model="state.labelsText"
            placeholder="Значение"
            :maxlength="LABELS_MAX_LENGTH"
            class="input w-full"
            :invalid="invalid(state, 'labels')"
            @blur="onLabelsBlur(state)"
          />
        </div>
        <div class="grid-cell grid-cell--type">
          <Select
            v-model="state.recordType"
            :options="store.RECORD_TYPE_OPTIONS"
            class="input w-full"
            @change="onRecordTypeChange(state)"
          />
        </div>
        <div
          class="grid-cell grid-cell--login"
          :class="{ 'grid-cell--login-span': state.recordType === 'LDAP' }"
        >
          <InputText
            v-model="state.login"
            placeholder="Значение"
            :maxlength="LOGIN_MAX_LENGTH"
            class="input w-full"
            :invalid="invalid(state, 'login')"
            @blur="onLoginBlur(state)"
          />
        </div>
        <div
          v-if="state.recordType === 'Локальная'"
          class="grid-cell grid-cell--password grid-cell--password-full"
        >
          <Password
            v-model="state.password"
            placeholder="Значение"
            :maxlength="PASSWORD_MAX_LENGTH"
            toggle-mask
            fluid
            class="input w-full"
            :invalid="invalid(state, 'password')"
            @blur="onPasswordBlur(state)"
          />
        </div>
        <div class="grid-cell grid-cell--actions">
          <Button
            icon="pi pi-trash"
            severity="secondary"
            text
            aria-label="Удалить учетную запись"
            @click="removeAccount(state.id)"
          />
        </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Password from "primevue/password";
import Message from "primevue/message";
import { useAccountsStore } from "@/stores/accounts";
import type { AccountFormState } from "@/types/accounts";
import {
  LABELS_MAX_LENGTH,
  LOGIN_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "@/types/accounts";

const store = useAccountsStore();
const formStates = ref<AccountFormState[]>([]);
const invalidFields = ref<Record<string, { labels?: boolean; login?: boolean; password?: boolean }>>({});

onMounted(() => {
  formStates.value = store.accounts.map((a) => store.storedToForm(a));
});

function addAccount(): void {
  formStates.value = [...formStates.value, store.addEmpty()];
}

function removeAccount(id: string): void {
  store.remove(id);
  formStates.value = formStates.value.filter((s) => s.id !== id);
  const next = { ...invalidFields.value };
  delete next[id];
  invalidFields.value = next;
}

function validateRow(state: AccountFormState): boolean {
  const errors: { labels?: boolean; login?: boolean; password?: boolean } = {};
  if (state.labelsText.length > LABELS_MAX_LENGTH) errors.labels = true;
  if (!state.login.trim()) errors.login = true;
  if (state.login.length > LOGIN_MAX_LENGTH) errors.login = true;
  if (state.recordType === "Локальная") {
    if (!state.password) errors.password = true;
    if (state.password.length > PASSWORD_MAX_LENGTH) errors.password = true;
  }
  invalidFields.value = { ...invalidFields.value, [state.id]: errors };
  return Object.keys(errors).length === 0;
}

function onLabelsBlur(state: AccountFormState): void {
  if (validateRow(state)) store.updateFromForm(state);
}

function onRecordTypeChange(state: AccountFormState): void {
  if (state.recordType === "LDAP") state.password = "";
  if (validateRow(state)) store.updateFromForm(state);
}

function onLoginBlur(state: AccountFormState): void {
  if (validateRow(state)) store.updateFromForm(state);
}

function onPasswordBlur(state: AccountFormState): void {
  if (validateRow(state)) store.updateFromForm(state);
}

function invalid(state: AccountFormState, field: "labels" | "login" | "password"): boolean {
  return Boolean(invalidFields.value[state.id]?.[field]);
}
</script>

<style scoped>
.form {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.75rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1d21;
}
.hint-message {
  margin-bottom: 1rem;
}
.grid-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.grid-list-rows {
  display: contents;
}
.row-list-enter-active,
.row-list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.row-list-move {
  transition: transform 0.25s ease;
}
.row-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.row-list-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.row-list-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
}
.row-list-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.row-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.grid-row {
  display: grid;
  grid-template-columns: 1fr 140px 1fr 1fr 48px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
}
.grid-row--header {
  background: #f8f9fa;
  font-size: 0.8125rem;
  color: #5c6370;
  font-weight: 500;
}
.grid-row--body {
  border-top: 1px solid #e5e7eb;
}
.grid-row--body .grid-cell--login-span {
  grid-column: span 2;
}
.grid-cell {
  min-width: 0;
}
.grid-cell--password-full {
  min-width: 0;
  display: flex;
}
.grid-cell--password-full > * {
  width: 100%;
  min-width: 0;
}
.input {
  width: 100%;
}
.w-full {
  width: 100%;
}
.grid-cell--actions {
  display: flex;
  justify-content: center;
}
</style>
