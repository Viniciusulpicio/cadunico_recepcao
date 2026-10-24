# Painel de Fila CadÚnico (Recepção → Setor Interno)

Sistema integrado à planilha **Google Sheets (`RECEPÇÃO MENSAL`)** para exibir aos entrevistadores na sala interna apenas os cidadãos marcados como **"Encaminhado para o atendimento interno (setor)"**.

## Arquivos Criados

1. [`Codigo.gs`](file:///home/vinicius/temp/cad/cadunico_recepcao/Codigo.gs): Script do Google Sheets contendo o seu `onEdit(e)` original + a API (`doGet`/`doPost`) que envia a fila para o site e controla quem foi aceito ou finalizado.
2. [`index.html`](file:///home/vinicius/temp/cad/cadunico_recepcao/index.html): Site pronto para o **GitHub Pages** com estética CadÚnico/Gov.br.

---

## Passo a Passo (5 minutos)

### Passo 1: Atualizar o Script na Planilha Google Sheets (2 minutos)
1. Abra a sua planilha no Google Sheets.
2. No menu superior, clique em **Extensões** → **Apps Script**.
3. Apague o código antigo e cole todo o conteúdo do arquivo [`Codigo.gs`](file:///home/vinicius/temp/cad/cadunico_recepcao/Codigo.gs).
4. Clique no ícone de **Salvar** (disquete).

### Passo 2: Publicar a Planilha como Web App (2 minutos)
1. Ainda no **Apps Script**, clique no botão azul **Implantar** (canto superior direito) → **Nova implantação**.
2. Clique na engrenagem ao lado de "Selecione o tipo" e escolha **App da Web**.
3. Preencha assim:
   - **Executar como:** `Eu` (seu e-mail)
   - **Quem pode acessar:** `Qualquer pessoa`
4. Clique em **Implantar**, autorize o acesso à planilha e **copie a URL do App da Web** gerada (termina com `/exec`).

### Passo 3: Subir o Site no GitHub Pages (1 minuto)
1. Suba o arquivo [`index.html`](file:///home/vinicius/temp/cad/cadunico_recepcao/index.html) para um repositório no GitHub e ative o **GitHub Pages** (em *Settings → Pages*).
2. Abra o site, clique em **"⚙️ Conectar Planilha"** no canto superior direito e cole a URL copiada no Passo 2 (ou se preferir deixar fixa no código para todos os computadores, cole na linha `const DEFAULT_SCRIPT_URL = "SUA_URL_AQUI";` dentro do `index.html`).
