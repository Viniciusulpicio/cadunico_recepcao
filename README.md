# Painel de Fila CadÚnico (Recepção → Setor Interno)

Site publicado (para os computadores do CRAS):
- **Entrevistadores (CRAS):** `https://viniciusulpicio.github.io/cadunico_recepcao/`
- **Gerenciamento Remoto (Admin):** `https://viniciusulpicio.github.io/cadunico_recepcao/#admin`

---

## Como funciona (Sem os entrevistadores precisarem configurar nada)

1. **Configuração Única do Motor ([`config.json`](file:///home/vinicius/temp/cad/cadunico_recepcao/config.json)):**
   - Implante o [`Codigo.gs`](file:///home/vinicius/temp/cad/cadunico_recepcao/Codigo.gs) **uma única vez** no Google Apps Script (`script.google.com` → Novo Projeto → Implantar como App da Web → Executar como `Eu` / Acesso `Qualquer pessoa`).
   - Cole a URL `/exec` gerada dentro do arquivo [`config.json`](file:///home/vinicius/temp/cad/cadunico_recepcao/config.json) no campo `"scriptUrl"`.
   - Pronto: todos os computadores do CRAS já abrem conectados automaticamente, e o botão de configuração fica oculto para os entrevistadores.

2. **Como trocar a planilha todo mês de longe do CRAS (30 segundos):**
   - Você tem duas formas de trocar a planilha mensal sem encostar nos computadores do CRAS e sem criar novo Apps Script:
   - **Opção A (Pelo painel `#admin`):** Abra `https://viniciusulpicio.github.io/cadunico_recepcao/#admin` do seu celular ou PC, cole o link normal da planilha do mês novo (`https://docs.google.com/spreadsheets/d/.../edit`) e clique em **Salvar e Ativar no CRAS**. O Apps Script salva o ID na nuvem do Google e todos os PCs do CRAS mudam de planilha em 4 segundos.
   - **Opção B (Pelo GitHub):** Edite o campo `"sheetUrl"` direto no arquivo [`config.json`](file:///home/vinicius/temp/cad/cadunico_recepcao/config.json) pelo site do GitHub. Em 30 segundos o GitHub Actions atualiza todos os computadores do CRAS automaticamente.
