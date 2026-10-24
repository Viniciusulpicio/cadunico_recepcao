# Painel CadÚnico (Recepção -> Setor Interno) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o script Google Apps Script (`Codigo.gs`) e o painel web (`index.html`) hospedável no GitHub Pages com estética oficial CadÚnico/Gov.br para gerenciar a fila de atendimento em tempo real.

**Architecture:** Aplicação single-page estática (`index.html`) que consome e atualiza a planilha Google Sheets via Web App do Google Apps Script (`doGet`/`doPost` com `LockService`). Estado do atendimento em andamento do entrevistador persiste no `localStorage` e sincroniza com a planilha para evitar perda de ficha ao atualizar a página.

**Tech Stack:** Google Apps Script (V8), HTML5, CSS3 (Design System Gov.br / CadÚnico: Rawline/Inter, `#1351B4`, `#071D41`, `#168821`, `#FFCD07`), Vanilla JavaScript.

**Spec:** `docs/superpowers/specs/2026-10-23-cadunico-fila-design.md`

---

### Task 1: Google Apps Script (`Codigo.gs`) com `onEdit`, `doGet` e `doPost`

**Files:**
- Create: `Codigo.gs`

- [x] **Step 1: Implementar `onEdit(e)`, `doGet(e)` e `doPost(e)` com trava de concorrência (`LockService`)**
- [x] **Step 2: Garantir filtro exato por `"Encaminhado para o atendimento interno (setor)"` e transições `AGUARDANDO` -> `EM_ATENDIMENTO` -> `FINALIZADO`**

### Task 2: Painel Web CadÚnico (`index.html`) e Guia de Publicação (`README.md`)

**Files:**
- Create: `index.html`
- Create: `README.md`

- [x] **Step 1: Criar interface com estética Gov.br / CadÚnico, lista de fila com prioridade destacada e Modo Ficha Grande ao aceitar**
- [x] **Step 2: Adicionar modo de demonstração/configuração fácil da URL do Apps Script direto na tela e testar fluxo completo**
