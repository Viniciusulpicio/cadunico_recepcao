# Painel de Fila CadÚnico (Recepção → Setor Interno)

- **Link dos Entrevistadores (CRAS):** `https://viniciusulpicio.github.io/cadunico_recepcao/`
- **Trocar URL da Planilha do Mês (de longe do CRAS):** `https://github.com/Viniciusulpicio/cadunico_recepcao/edit/main/config.json` (ou `https://viniciusulpicio.github.io/cadunico_recepcao/#admin`)

---

## Fluxo Mensal (1 Apps Script em cada planilha, gerenciado de longe)

1. **Na planilha do mês novo (Google Sheets):**
   - Abra **Extensões → Apps Script**, cole o conteúdo de [`Codigo.gs`](file:///home/vinicius/temp/cad/cadunico_recepcao/Codigo.gs) e salve.
   - Clique em **Implantar → Nova implantação → App da Web** (*Executar como: Eu* / *Quem pode acessar: Qualquer pessoa*) e copie a URL `/exec` gerada.

2. **Atualizar todos os computadores do CRAS de longe (leva 30 segundos):**
   - **Opção A (Direto no GitHub pelo celular ou PC):** Abra [`config.json`](https://github.com/Viniciusulpicio/cadunico_recepcao/edit/main/config.json), cole a nova URL `/exec` dentro de `"scriptUrl"` e clique em **Commit changes**.
   - **Opção B (Pelo painel `#admin` do site):** Abra `https://viniciusulpicio.github.io/cadunico_recepcao/#admin`, cole a nova URL `/exec` e clique em **Publicar para o CRAS**.
   - Todos os computadores do CRAS leem o [`config.json`](file:///home/vinicius/temp/cad/cadunico_recepcao/config.json) sozinhos a cada 30 segundos e já passam a usar a planilha do mês novo sem nenhum usuário do CRAS precisar mexer em nada.
