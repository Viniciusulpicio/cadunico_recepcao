# 01 - Painel de Recepção e Fila de Atendimento

Este guia descreve como operar, manter e configurar novas planilhas para o painel de fila web dos entrevistadores e recepção.

---

## 1. Arquitetura da Solução

- **Interface Frontend (Web):** Hospedada no GitHub Pages (`https://viniciusulpicio.github.io/cadunico_recepcao/`).
- **Backend (API):** Google Apps Script implantado como Web App a partir de [`cadunico_recepcao/Codigo.gs`](file:///home/vinicius/temp/cad/cadunico_recepcao/Codigo.gs).
- **Banco de Dados / Armazenamento:** Planilha Google do posto (contendo a aba `RECEPÇÃO MENSAL`).

### Visão da Tela do Entrevistador (Web)
![Painel de Fila Web Frontend](img/01-painel-fila-frontend-web.png)

Na tela acima:
- O entrevistador seleciona seu guichê e posto (ex: *Posto Central*).
- A lista de pessoas aguardando exibe Nome, CPF mascarado, Tipo de Atendimento e o botão **Aceitar**.
- Ao clicar em **Aceitar**, o entrevistador chama o cidadão e a planilha é atualizada em tempo real.

---

## 2. Regra de Negócio e Mudança de Status

A planilha possui as seguintes colunas de triagem e controle:
- **Coluna G (7):** *Resolução do Atendimento*. Quando a recepção preenche com `"Encaminhado para o atendimento interno (setor)"`, a linha entra na fila.
- **Coluna K (11):** *Status Fila* (`AGUARDANDO` | `EM_ATENDIMENTO` | `FINALIZADO`).
- **Coluna L (12):** *Entrevistador Responsável*.
- **Coluna M (13):** *Hora Aceite* (início).
- **Coluna N (14):** *Hora Finalização* (término).

Quando o entrevistador clica em **Aceitar** no painel web, o Web App grava seu nome na coluna L, marca K como `EM_ATENDIMENTO` e anota o horário em M. Ao clicar em **Finalizar**, o status vai para `FINALIZADO` com horário em N.

---

## 3. Passo a Passo Visual: Criar Nova Planilha (Troca Mensal/Anual)

> **Regra de Ouro:** **SEMPRE DUPLIQUE** a planilha do mês anterior ou use a pasta `relatorios/modelos originais/` (Botão direito → **Fazer uma cópia**). Ao duplicar, **todo o código do Apps Script e os menus já vão juntos automaticamente**.

### Etapa 1: Abrir o Apps Script da Planilha Nova
Após duplicar e renomear a planilha do novo mês (ex: `2026/11 - RECEPCAO - CENTRAL`), abra o menu **Extensões → Apps Script**:

*Dica prática:* Duplicar diretamente a planilha do mês anterior do próprio setor é o caminho mais rápido, pois você só precisa apagar as linhas dos cidadãos atendidos. Os nomes dos servidores, os guichês e as configurações individuais já permanecem todos preenchidos.
![Extensões Apps Script](img/01-extensoes-apps-script.png)

### Etapa 2: Acessar o Menu de Implantação
No canto superior direito do editor Apps Script, clique no botão azul **Implantar → Gerenciar implantações** (ou Nova implantação):
![Apps Script Menu Implantar](img/01-apps-script-menu-implantar.png)

### Etapa 3: Selecionar o Tipo "App da Web"
Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha **App da Web**:
![Apps Script Selecionar App da Web](img/01-apps-script-selecionar-webapp.png)

### Etapa 4: Configurar Acesso Obrigatório
Configure as opções exatamente assim:
- **Executar como:** `Eu (cadunico.marilia.sp@gmail.com)`
- **Quem pode acessar:** `Qualquer pessoa`
![Configuração de Acesso Qualquer Pessoa](img/01-apps-script-config-qualquer-pessoa.png)

### Etapa 5: Copiar a Nova URL do App da Web
Clique no botão azul **Implantar** e depois clique em **Copiar** no campo *URL do App da Web* (terminada em `/exec`):
![Copiar URL Gerada](img/01-apps-script-copiar-url.png)

### Etapa 6: Atualizar a Planilha Central de Postos
Abra a planilha `Config_Postos_CadUnico` e cole a nova URL na linha correspondente ao posto (`central`, `teotonio` ou `rosa_modelli`):
![Planilha Config Postos URLs](img/01-planilha-config-postos-urls.png)
