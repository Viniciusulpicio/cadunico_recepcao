# 07 - Sistema de Backup Automático Diário e Recuperação de Desastres

Para proteger o setor contra invasão da conta Google, exclusão maliciosa ou perda acidental de planilhas, fórmulas e códigos, todo o ecossistema do Cadastro Único conta com uma rotina externa automatizada de backup diário.

---

## 1. Como Funciona a Proteção Diária

O backup é executado automaticamente todos os dias às **03:00 da manhã** em servidor dedicado sob custódia técnica, preservando de forma independente da conta Google:

1. **Espelho Completo do Google Drive (Proteção Contra Exclusão):**
   - Todas as pastas (`adm`, `avaliacao atendimento`, `cadastramento domiciliar`, `MODELOS DOCUMENTOS` e `relatorios`), incluindo todas as planilhas mensais, documentos mestre e PDFs gerados, são copiadas diariamente mantendo **exatamente a mesma organização de pastas do Google Drive**.
   - A rotina opera em modo incremental seguro (nunca apaga arquivos anteriores): mesmo que alguém invada a conta do Google Drive e exclua todas as pastas e esvazie a lixeira, **todas as planilhas e documentos permanecem intactos no servidor de backup**.
2. **Todos os 80+ Códigos Google Apps Script (`.gs`, `.html` e `.json`) Vinculados às Planilhas:**
   - Quando uma planilha é baixada manualmente do Google Drive como `.xlsx`, o Google remove os códigos do Apps Script embutidos nela.
   - Para evitar a perda das automações e resolver o problema de múltiplos scripts com o nome `"Projeto sem título"`, o extrator automático do backup lê o vínculo oficial (`parentId`) de cada script e salva seus códigos dentro de uma pasta **`Nome da Planilha [SCRIPT]/`** posicionada exatamente ao lado do arquivo `.xlsx` correspondente:
     - `adm/GERAL solicitação ADM - Sistema de Administração de Benefícios [SCRIPT]/`
     - `cadastramento domiciliar/GERAL solicitação CD - Sistema de Atendimento Domiciliar [SCRIPT]/`
     - `relatorios/Gestão Mensal de Atendimentos [SCRIPT]/`
     - `avaliacao atendimento/Avaliação de Atendimento - CadÚnico_ [SCRIPT]/`
     - `relatorios/modelos originais/yyyy／xx - RECEPCAO [SCRIPT]/` *(e demais planilhas de postos e servidores)*.
3. **Histórico de Versões e Pacotes Fechados Diários/Mensais:**
   - Sempre que uma planilha é modificada ou sobrescrita no Drive, a versão anterior é arquivada separadamente com data e hora.
   - Além do espelho aberto, o sistema gera pacotes compactados diários (últimos 30 dias) e pacotes mensais permanentes (todo dia 01 de cada mês).

---

## 2. Como Solicitar a Restauração de Arquivos ou Scripts

Caso qualquer planilha, fórmula, documento mestre ou script seja apagado, corrompido ou apresente falha após edição indevida (ou em caso de perda de acesso/invasão da conta `cadunico.marilia.sp@gmail.com`):

1. **Acione o Responsável Técnico:**
   - Entre em contato informando qual pasta, planilha ou período precisa ser recuperado:
     - **Nome:** Vinícius Sulpicio
     - **E-mail:** `viniciusulpicio@gmail.com`
     - **Repositório Oficial:** `https://github.com/Viniciusulpicio/cadunico_recepcao`
2. **Restauração Rápida no Google Drive:**
   - O arquivo `.xlsx` íntegro e a respectiva pasta `Nome da Planilha [SCRIPT]/` (ou o pacote completo do sistema) serão disponibilizados imediatamente.
   - Basta enviar a planilha recuperada para o Google Drive (**Arquivo → Salvar como Planilhas Google**), colar o código `.gs` correspondente em **Extensões → Apps Script** e clicar no menu da planilha em **⚙️ Ativar Automação Automática**.
