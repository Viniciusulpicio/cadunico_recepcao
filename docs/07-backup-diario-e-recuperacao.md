# 07 - Sistema de Backup Automático Diário e Recuperação de Desastres

Para proteger o setor contra invasão da conta Google, exclusão maliciosa ou perda acidental de planilhas e códigos, todo o ecossistema do Cadastro Único possui uma rotina automatizada de backup diário em servidor dedicado 24h.

---

## 1. Arquitetura do Backup Automático (Servidor 24h)

- **Horário de Execução:** Todos os dias às **03:00 da manhã** (via `crontab` no servidor Linux 24h `rk322x-box` / `192.168.0.215`).
- **Acesso Web Local (Filebrowser):** `http://rk322x-box:8082/files/backups_cadunico`
- **Acesso via Rede Windows (Samba):** `\\192.168.0.215\Compartilhado\backups_cadunico`

### O que é salvo automaticamente todos os dias

1. **Espelho idêntico ao Google Drive (`rclone copy`):**
   - Todas as pastas (`adm`, `avaliacao atendimento`, `cadastramento domiciliar`, `MODELOS DOCUMENTOS` e `relatorios`), incluindo as 97+ planilhas mensais, documentos mestre e PDFs gerados.
   - O sistema utiliza o modo **`copy`** (nunca `sync`): se alguém invadir o Google Drive e apagar todos os arquivos na nuvem, **nenhum arquivo é apagado no servidor de backup**.
2. **Todos os 80+ Projetos Google Apps Script (`.gs`, `.html` e `.json`):**
   - Baixados automaticamente via API (`pull_scripts.py`).
   - Mesmo que os scripts no Google se chamem `"Projeto sem título"`, o extrator identifica a planilha dona de cada código pelo identificador `parentId` e cria a pasta **`Nome da Planilha [SCRIPT]/`** exatamente ao lado do arquivo `.xlsx` correspondente:
     - `adm/GERAL solicitação ADM - Sistema de Administração de Benefícios [SCRIPT]/`
     - `cadastramento domiciliar/GERAL solicitação CD - Sistema de Atendimento Domiciliar [SCRIPT]/`
     - `relatorios/Gestão Mensal de Atendimentos [SCRIPT]/`
     - `avaliacao atendimento/Avaliação de Atendimento - CadÚnico_ [SCRIPT]/`
     - `relatorios/modelos originais/yyyy／xx - RECEPCAO [SCRIPT]/` *(e demais planilhas de servidores/postos)*.
3. **Repositório do Painel Web (`cadunico_recepcao`) e Formulário Verde (`formulario_verde`):**
   - Sincronizados via `git pull` e armazenados junto às matrizes do sistema.
4. **Histórico de Arquivos Sobrescritos e Snapshots Compactados (`.tar.gz`):**
   - Sempre que uma planilha sofre alteração no Drive, a versão do dia anterior é preservada em `/mnt/storage/backups/motor_cadunico/historico_alterados/AAAA-MM-DD_HHMM/`.
   - Ao final de cada execução, é gerado um pacote fechado `/mnt/storage/backups/motor_cadunico/snapshots/cadunico-AAAA-MM-DD.tar.gz` (retenção automática dos últimos 30 dias diários + todo dia 01 de cada mês preservado permanentemente como arquivo mensal).

---

## 2. Como Restaurar uma Planilha ou Script Apagado

Caso alguém apague uma planilha, corrompa fórmulas ou exclua códigos do Apps Script no Google Drive:

1. **Baixar a Planilha e o Script do Backup:**
   - Acesse `http://rk322x-box:8082/files/backups_cadunico` (ou acione o responsável técnico).
   - Entre na pasta do setor (ex: `adm/`, `cadastramento domiciliar/` ou `relatorios/`) e baixe o arquivo `.xlsx` e a pasta `Nome da Planilha [SCRIPT]/` correspondente.
2. **Subir de Volta para o Google Drive:**
   - Arraste o arquivo `.xlsx` para a pasta do Google Drive, abra-o e clique em **Arquivo → Salvar como Planilhas Google**.
3. **Restaurar o Código Apps Script:**
   - Na planilha recuperada, clique em **Extensões → Apps Script**.
   - Copie o conteúdo dos arquivos `.gs` e `.html` da pasta `[SCRIPT]` e cole no editor do Apps Script.
   - Salve (`Ctrl + S`), recarregue a planilha e clique no menu do sistema em **⚙️ Ativar Automação Automática** (ou reimplante como Web App, no caso da planilha de Recepção).

---

## 3. Contato Técnico para Recuperação e Suporte

Se ocorrer invasão da conta `cadunico.marilia.sp@gmail.com`, perda severa de dados ou necessidade de intervenção no servidor de backup ou no painel web, entre em contato diretamente com o desenvolvedor do sistema (que mantém cópia integral e snapshots imutáveis de todas as planilhas, scripts e documentos):

- **Responsável Técnico / Desenvolvedor:** Vinícius Sulpicio
- **E-mail:** `viniciusulpicio@gmail.com`
- **GitHub / Repositório Oficial:** `https://github.com/Viniciusulpicio/cadunico_recepcao`
