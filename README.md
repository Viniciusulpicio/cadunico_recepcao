# Painel de Fila CadÚnico (Recepção → Setor Interno)

Painel unificado para gerenciar o atendimento da recepção e a fila dos entrevistadores dos postos do Cadastro Único, com **conformidade integral à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), Decreto nº 11.016/2022 e Portarias MC nº 810/2022 e MDS nº 502/2017**.

---

## 🔒 Conformidade Legal e Segurança da Informação

O sistema inclui proteções de nível federal para dados socioassistenciais:

1. **Termo de Compromisso e Manutenção de Sigilo (TCMS):** Aceite eletrônico obrigatório por servidor e matrícula antes de liberar a visualização da fila.
2. **Minimização e Mascaramento de Dados:** O CPF é exibido como `***.XXX.XXX-**` na fila geral e as observações confidenciais só são liberadas ao aceitar o atendimento na cabine individual.
3. **Autenticação por Chave de Posto (Token):** O endpoint Apps Script rejeita qualquer requisição anônima ou não autorizada.
4. **Trilha de Auditoria Automática:** Todo acesso, aceite, redirecionamento e finalização é gravado na aba protegida `AUDITORIA_LGPD`.
5. **Bloqueio por Inatividade:** Bloqueio de tela após 15 minutos sem uso para proteger os dados de terceiros no balcão (*anti-shoulder surfing*).

Para detalhamento normativo completo, consulte o documento [docs/LGPD_CONFORMIDADE.md](docs/LGPD_CONFORMIDADE.md).

---

## Links Diretos por Posto / Setor

Os entrevistadores identificados podem acessar direto pelo link do seu setor (ou alternar pelo seletor no topo da tela):

- **Posto Central:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=central`
- **CRAS Teotônio Vilela:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=teotonio`
- **CRAS Rosa Modelli:** `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=rosa_modelli`

---

## Como Configurar uma Nova Planilha no Posto

1. **Na planilha do posto (Google Sheets):**
   - Abra **Extensões → Apps Script**, cole o conteúdo de [`Codigo.gs`](Codigo.gs) e salve.
   - Em **Configurações do Projeto → Propriedades do Script**, defina `CHAVE_ACESSO_POSTO` com a senha institucional do posto.
   - Clique em **Implantar → Nova implantação → App da Web**:
     - *Executar como:* **Eu (sua conta Google)**
     - *Quem pode acessar:* **Qualquer pessoa** (as requisições são validadas e protegidas por chave de acesso no código)
   - Copie a URL gerada (terminada em `/exec`).

2. **Vincular ao Painel:**
   - Acesse o painel pelo navegador com `#admin` no final da URL.
   - Cole a URL do Apps Script no campo da unidade correspondente.
   - Informe aos operadores a chave de acesso do posto para assinatura do TCMS no primeiro acesso.
