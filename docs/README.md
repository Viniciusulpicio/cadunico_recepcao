# Manual de Operação e Passagem de Bastão - Cadastro Único / Bolsa Família

Guia mestre de governança, sustentação, backup e manutenção de todos os sistemas de atendimento, triagem, processos administrativos, visitas domiciliares e avaliação dos postos de Marília.

---

## 1. Documento Mestre para Impressão e Consulta Web

- **[MANUAL-DO-SISTEMA-CADUNICO.md](MANUAL-DO-SISTEMA-CADUNICO.md):** Manual unificado com todos os módulos integrados, instruções passo a passo, catálogo de modelos, rotina de backup diário e telas explicativas.
- **[MANUAL-IMPRESSAO.html](MANUAL-IMPRESSAO.html):** Versão formatada pronta para imprimir em papel ou salvar como PDF no navegador (`Ctrl + P`), também publicada em `https://viniciusulpicio.github.io/cadunico_recepcao/manual`.

---

## 2. Índice dos Módulos Detalhados

1. [00 - Visão Geral e Gestão de Acessos](00-visao-geral-e-acessos.md)
   Contas mestras, bibliotecas externas (`pdf-lib`), serviços de mapa, níveis de permissão e contato técnico.
2. [01 - Painel de Recepção e Fila de Atendimento](01-painel-recepcao-e-fila.md)
   Operação do front-end web de fila, planilha `RECEPCAO`, `Config_Postos_CadUnico`, devolução/redirecionamento nos 16 tipos oficiais, deploy do Web App e Alerta da Coordenação (Casos Especiais).
3. [02 - Sistema de Administração de Benefícios (ADM / PBF)](02-administracao-beneficios-adm.md)
   Geração automatizada de formulários e processos administrativos em PDF mesclado com anexos.
4. [03 - Sistema de Cadastramento Domiciliar (CD)](03-cadastramento-domiciliar-cd.md)
   Geração de termos em PDF, preenchimento vetorial do Formulário Verde F1, roteirização geográfica (2-opt), WhatsApp e limpeza automática da cota de 15 GB.
5. [04 - Relatórios de Servidores, Fechamento Mensal e Busca](04-relatorios-e-fechamento-mensal.md)
   Planilhas individuais de produção (`RELATORIO SERVIDOR` e `RELATORIO CD`), aba mestre `Casos_Especiais`, congelamento mensal e busca por CPF/Nome.
6. [05 - Avaliação de Atendimento e Desempenho](05-avaliacao-de-atendimento.md)
   Formulário de satisfação dos munícipes, geração automática de dashboards mensais e notas por atendente.
7. [06 - Modelos de Documentos, Territorialização e Formulário Verde F1](06-modelos-e-formulario-verde.md)
   Catálogo dos 20 modelos `.odt`/`.docx` da pasta `MODELOS DOCUMENTOS`, planilha `BAIRROS X CRAS.xlsx` e Formulário Verde F1 preenchível.
8. [07 - Backup Automático Diário e Recuperação de Desastres](07-backup-diario-e-recuperacao.md)
   Funcionamento do backup diário externo das planilhas e dos 80+ scripts `.gs` (`[SCRIPT]`) e contato para restauração imediata.

---

## 3. Regra Fundamental: Sempre Duplique as Planilhas

> **Aviso Importante:** Nunca crie uma planilha do zero. **SEMPRE DUPLIQUE** uma planilha funcional existente no Google Drive (clique com o botão direito → **Fazer uma cópia**). Ao duplicar, todos os códigos Apps Script, menus personalizados, formatações e gatilhos são transferidos automaticamente sem risco de erros manuais.

---

## 4. Checklist Rápido de Manutenção (Primeiros Passos de Quem Assume)

1. **Conta Google:** Garantir acesso com privilégios totais à conta `cadunico.marilia.sp@gmail.com`.
2. **Gatilhos de Formulários:** Caso algum formulário pare de gerar PDF, entrar na respectiva planilha e acionar o item de menu `⚙️ Ativar Automação Automática`.
3. **Virada de Mês (2 frentes separadas):**
   - **Frente 1 — Fila de Recepção dos Postos:** Duplicar a planilha `RECEPCAO` de cada posto, implantar o Apps Script como *App da Web* e atualizar as 3 URLs na planilha `Config_Postos_CadUnico`.
   - **Frente 2 — Relatórios Mensais dos Servidores:** Duplicar as planilhas `RELATORIO SERVIDOR` / `RELATORIO CD`, vincular os novos links na aba `Configuração Mensal` da `Gestão Mensal de Atendimentos`, congelar o mês encerrado (`🔍 Busca → Congelar Dados do Mês Atual`) e adicionar o novo mês na lista `abasMensais` do script de busca.
4. **Espaço em Disco:** Monitorar a cota de 15 GB do Google Drive utilizando a limpeza de PDFs de visitas concluídas na planilha de CD.
5. **Suporte e Recuperação de Backups:** Caso qualquer planilha ou script seja apagado/corrompido ou ocorra invasão da conta, entre em contato com **Vinícius Sulpicio** (`viniciusulpicio@gmail.com`) para restauração a partir do backup diário externo.
