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
   Operação do front-end web, devolução/redirecionamento de atendimento, lista dos 16 tipos oficiais, deploy do Apps Script e criação de planilhas mensais por posto.
3. [02 - Sistema de Administração de Benefícios (ADM / PBF)](02-administracao-beneficios-adm.md)
   Geração automatizada de formulários e processos administrativos em PDF mesclado com anexos.
4. [03 - Sistema de Cadastramento Domiciliar (CD)](03-cadastramento-domiciliar-cd.md)
   Geração de termos em PDF, roteirização geográfica inteligente (2-opt) e integração com WhatsApp.
5. [04 - Relatórios, Fechamento Mensal e Busca](04-relatorios-e-fechamento-mensal.md)
   Rotina de congelamento mensal de dados e pesquisa de atendimentos por CPF/Nome.
6. [05 - Avaliação de Atendimento e Desempenho](05-avaliacao-de-atendimento.md)
   Formulário de satisfação dos munícipes, geração automática de dashboards mensais e notas por atendente.
7. [06 - Modelos de Documentos, Territorialização e Formulário Verde F1](06-modelos-e-formulario-verde.md)
   Catálogo dos 20 modelos `.odt`/`.docx` da pasta `MODELOS DOCUMENTOS`, planilha `BAIRROS X CRAS.xlsx` e Formulário Verde F1 preenchível.
8. [07 - Backup Automático Diário e Recuperação de Desastres](07-backup-diario-e-recuperacao.md)
   Rotina automática diária (03:00) em servidor 24h (`rk322x-box`), salvamento dos 80+ scripts `.gs` ao lado de cada planilha e passo a passo de restauração.

---

## 3. Regra Fundamental: Sempre Duplique as Planilhas

> **Aviso Importante:** Nunca crie uma planilha do zero. **SEMPRE DUPLIQUE** uma planilha funcional existente no Google Drive (clique com o botão direito → **Fazer uma cópia**). Ao duplicar, todos os códigos Apps Script, menus personalizados, formatações e gatilhos são transferidos automaticamente sem risco de erros manuais.

---

## 4. Checklist Rápido de Manutenção (Primeiros Passos de Quem Assume)

1. **Conta Google:** Garantir acesso com privilégios totais à conta `cadunico.marilia.sp@gmail.com`.
2. **Gatilhos de Formulários:** Caso algum formulário pare de gerar PDF, entrar na respectiva planilha e acionar o item de menu `⚙️ Ativar Automação Automática`.
3. **Virada de Mês:**
   - Duplicar a planilha de recepção dos postos e atualizar as URLs de Apps Script na planilha `Config_Postos_CadUnico`.
   - Executar o menu `🔍 Busca → Congelar Dados do Mês Atual` na planilha de Gestão Mensal.
   - Adicionar o novo mês na lista `abasMensais` no script de relatórios.
4. **Espaço em Disco e Backup:** Monitorar a cota de 15 GB do Google Drive (usando a limpeza de PDFs de visitas concluídas no CD) e consultar os backups diários em `http://rk322x-box:8082/files/backups_cadunico`.
5. **Suporte e Recuperação:** Em caso de perda severa de arquivos ou invasão de conta, contatar **Vinícius Sulpicio** (`viniciusulpicio@gmail.com`).
