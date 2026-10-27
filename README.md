# Painel de Fila CadÚnico (Recepção → Setor Interno)

Painel unificado para gerenciar o atendimento da recepção e a fila dos entrevistadores dos postos do Cadastro Único.

---

## Links Diretos por Posto / Setor

Os entrevistadores podem acessar direto pelo link do seu setor (ou alternar pelo seletor no topo da tela):

- **Posto Central:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=central`
- **CRAS Teotônio Vilela:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=teotonio`
- **CRAS Rosa Modelli:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=rosa_modelli`

---

## Painel de Administração e Configuração de URLs

- **Painel Admin Remoto:** `https://viniciusulpicio.github.io/cadunico_recepcao/#admin`
- **Arquivo de Configuração no GitHub:** [`config.json`](https://github.com/Viniciusulpicio/cadunico_recepcao/edit/main/config.json)

---

## Como Configurar uma Nova Planilha em Qualquer Posto

1. **Na planilha do posto (Google Sheets):**
   - Abra **Extensões → Apps Script**, cole o conteúdo de [`Codigo.gs`](Codigo.gs) e salve.
   - Clique em **Implantar → Nova implantação → App da Web**:
     - *Executar como:* **Eu (sua conta Google)**
     - *Quem pode acessar:* **Qualquer pessoa**
   - Copie a URL gerada (terminada em `/exec`).

2. **Vincular ao Painel:**
   - Acesse `https://viniciusulpicio.github.io/cadunico_recepcao/#admin`
   - Cole a URL do Apps Script no campo do respectivo posto (Central, Teotônio Vilela ou Rosa Modelli).
   - Digite a senha de administrador e clique em **Salvar para todos os PCs**.
   - Ou edite diretamente o [`config.json`](config.json) no GitHub.
