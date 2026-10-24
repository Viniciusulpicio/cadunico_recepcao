# Design Spec: Painel de Fila e Atendimento CadÚnico (Recepção -> Setor Interno)

## 1. Objetivo
Conectar a planilha Google Sheets (`RECEPÇÃO MENSAL`) a um painel web estático hospedado no GitHub Pages com identidade visual oficial Gov.br / CadÚnico. O painel exibe apenas os cidadãos encaminhados para o setor interno no dia atual, permitindo que vários entrevistadores trabalhem simultaneamente sem chamar a mesma pessoa duas vezes.

## 2. Regras de Negócio e Fluxo
1. **Gatilho na Recepção (`onEdit`):**
   - Ao editar a aba `RECEPÇÃO MENSAL` a partir da linha 4 e coluna > 2, se `Data` (Coluna A) estiver vazia, grava `Data` (`dd/MM/yyyy`) e `Hora` (`HH:mm:ss`) no fuso `America/Sao_Paulo`.
2. **Filtro para o Entrevistador (`doGet`):**
   - Só envia para a fila dos entrevistadores registros cuja Coluna `G` (`Resolução do Atendimento`) seja `"Encaminhado para o atendimento interno (setor)"` e cujo status (Coluna `K`) esteja vazio ou `"AGUARDANDO"`.
3. **Campos Exibidos:**
   - `Hora` (Col B), `Nome do RUF` (Col C), `CPF` (Col D), `Tipo de Atendimento` (Col E), `Resolução do Atendimento` (Col G), além dos indicadores de prioridade (`Classificação do Atendimento` Col I e `Tipo de Prioridade` Col J) e `Observações` (Col H).
4. **Aceitar Atendimento (Trava para os outros entrevistadores):**
   - Quando um entrevistador clica em **"Aceitar Atendimento"**:
     - O backend (`doPost`) usa `LockService` do Apps Script para garantir que dois entrevistadores não aceitem a mesma linha ao mesmo tempo, gravando `"EM_ATENDIMENTO"` na Coluna `K`, nome do entrevistador na Coluna `L` e horário de início na Coluna `M`.
     - O cidadão **some imediatamente da lista de espera de todos os outros entrevistadores**.
     - Na tela do entrevistador que aceitou, abre **em tela cheia/destaque grande a Ficha da Pessoa** (Nome grande para chamar na porta, CPF com botão de cópia rápida em 1 clique, Hora, Tipo de Atendimento, Prioridade, Resolução e Observações).
5. **Finalizar Atendimento:**
   - Na ficha em destaque há o botão **"Finalizar Atendimento"** (e opção de devolver para a fila caso a pessoa não responda ao chamado).
   - Ao clicar em **"Finalizar Atendimento"**, grava `"FINALIZADO"` na Coluna `K` e horário de término na Coluna `N`, voltando para a tela da fila para aceitar o próximo atendimento.
