# 06 - Modelos de Documentos Oficiais, Territorialização e Formulário Verde F1

Este módulo reúne os documentos padronizados de atendimento diário nos postos do Cadastro Único, a tabela de abrangência territorial dos CRAS de Marília e as matrizes digitais do Formulário Principal F1 (Formulário Verde).

---

## 1. Pasta `MODELOS DOCUMENTOS` no Google Drive

Localizada na raiz do Google Drive (`cadunico.marilia.sp@gmail.com`), contém os arquivos editáveis (`.odt`, `.docx` e `.doc`) prontos para preenchimento e impressão no atendimento:

### Declarações e Termos Cadastrais
- **`DECLARAÇÃO DE RESIDÊNCIA.odt`:** Declaração padrão de endereço para famílias sem comprovante em nome próprio.
- **`DECLARAÇÃO DE RESIDÊNCIA RESPONSÁVEL LEGAL.odt`:** Versão específica para representantes legais (tutela, curatela ou guarda).
- **`_DECLARACAO DE COMPARECIMENTO CAD.odt`:** Atestado de presença do cidadão no posto para apresentação no trabalho.
- **`TERMO DE RENDA E COMPOSIÇÃO FAMILIAR 06-2026.odt`:** Declaração formal de renda informal/autônoma e membros moradores do domicílio.
- **`_AD TERMO FAMILIA UNIPESSOAL.odt`:** Termo de responsabilidade para cadastros de 1 única pessoa (titular capaz).
- **`_AD TERMO FAMILIA UNIPESSOAL RL.odt`:** Termo unipessoal assinado por representante legal.
- **`TROCA DE RF.doc`:** Requerimento para substituição de Responsável pela Unidade Familiar.

### Formulários de Exclusão e Desligamento
- **`FICHA DE EXCLUSÃO DE PESSOA.odt`:** Retirada de integrante específico da composição familiar.
- **`FICHA DE EXCLUSÃO DA FAMÍLIA.odt`:** Cancelamento integral do registro familiar no CadÚnico.
- **`TERMO DE RESPONSABILIDADE EXCLUSAO PESSOA BPC.odt`:** Termo específico quando a exclusão envolve composição de Benefício de Prestação Continuada (BPC/LOAS).
- **`_PBF - DECLARACAO DESLIGAMENTO VOLUNTARIO.docx`:** Solicitação espontânea de saída do Programa Bolsa Família.
- **`_PBF ADM.odt`:** Ficha física de apoio para solicitações administrativas do Bolsa Família.

### Termos de Visita Domiciliar (Apoio Físico)
- **`_1AD TERMO SOLICITACAO CD.odt`:** Versão manual para solicitação de entrevista domiciliar.
- **`_2 AD TERMO CIENCIA E OPCAO.odt`:** Termo de ciência de agendamento e opção de atendimento.

### Fichas de Encaminhamento à Rede Socioassistencial
- **`ENCAMINHAMENTO CRAS.odt`:** Encaminhamento para acompanhamento nas unidades CRAS.
- **`ENCAMINHAMENTO CENTRO POP.odt`:** Encaminhamento para população em situação de rua.
- **`ENCAMINHAMENTO INSS BPC.odt`:** Encaminhamento para requerimento ou revisão junto ao INSS.
- **`ENCAMINHAMENTO EDUCACAO.odt`:** Encaminhamento para rede municipal/estadual de ensino (condicionalidade de frequência escolar).
- **`ENCAMINHAMENTO GENERICO.odt`:** Ficha aberta para outros órgãos e secretarias.

---

## 2. Mapeamento Territorial (`BAIRROS X CRAS.xlsx`)

A planilha `BAIRROS X CRAS.xlsx` (dentro de `MODELOS DOCUMENTOS`) relaciona todos os bairros e distritos de Marília ao respectivo CRAS de referência (Rosa Modelli, Teotônio Vilela, Leonel Brizola, etc.). Deve ser consultada na recepção e triagem sempre que houver dúvida sobre qual unidade atende o endereço do munícipe.

---

## 3. Formulário Verde F1 Digital e Automação Vetorial

As versões reconstruídas em alta resolução e o script de emissão vetorial estão preservados no pacote técnico `formulario_verde`:

- **`FORMULARIO VERDE F1.pdf` (Oficial Caixa / Governo Federal - ID `1M1MzdRQ1QFCwdOv4U0DF2XovNLpIpWqF`):** Matriz oficial do Ministério do Desenvolvimento Social / Caixa Econômica Federal em folha A4 paisagem, utilizada como fundo pelo motor `pdf-lib`.
- **`FORMULARIO_VERDE_F1_PREENCHIVEL.pdf`:** Versão PDF interativa com campos de formulário editáveis diretamente no navegador ou Adobe Reader.
- **`FORMULARIO_VERDE_F1_OFICIAL_DOCS.docx` / `FORMULARIO_VERDE_F1_GOOGLE_DOCS.docx`:** Matrizes editáveis compatíveis com Microsoft Word e Google Docs para emissão em contingência ou impressão manual de reposição.
- **`codigo_apps_script.gs` / `codigo_apps_script.txt`:** Script completo do Google Apps Script com o motor `pdf-lib` calibrado:
  - Posiciona o Formulário Verde F1 na **Página 1** do dossiê final.
  - Desenha os dados do titular e município diretamente nos grids de caracteres com passo submilimétrico ($11.33\text{ pt}$).
  - Assenta o Código Familiar de 11 dígitos exatamente nas 11 caixinhas ($X=165.35$, passo $11.30\text{ pt}$, baseline $Y=136.5$).
  - Preenche o telefone fixo institucional `(14) 3434-1840` em negrito e centralizado na caixa branca inferior.
  - Marca a modalidade (`Inclusão` ou `Alteração`) com `X` centralizado no interior do quadrado.
  - Mescla o Termo Domiciliar (`DOCUMENTO MESTRE` ou `DOCUMENTO MESTRE RL`) e concatena até 10 categorias de anexos digitais enviados pelo Forms.
