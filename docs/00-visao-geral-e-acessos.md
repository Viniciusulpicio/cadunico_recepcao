# 00 - Visão Geral do Sistema e Gestão de Acessos

Este documento centraliza as contas, permissões, estrutura de módulos e contato de suporte dos sistemas mantidos no setor do Cadastro Único e Bolsa Família (Prefeitura Municipal de Marília).

---

## 1. Conta Mestra, Repositórios e Suporte

| Recurso | Identificador / Localização | Responsabilidade |
| :--- | :--- | :--- |
| **E-mail Institucional Google** | `cadunico.marilia.sp@gmail.com` | Dono de todas as planilhas, formulários, arquivos mestre e Apps Scripts. |
| **Repositório Front-end (Fila)** | `https://github.com/Viniciusulpicio/cadunico_recepcao` | Código HTML/JS do Painel de Fila e Manual hospedados no GitHub Pages. |
| **Página Web em Produção** | `https://viniciusulpicio.github.io/cadunico_recepcao/` | Interface visual acessada pelos entrevistadores e recepção. |
| **Manual Web para Impressão** | `https://viniciusulpicio.github.io/cadunico_recepcao/manual` | Versão online e imprimível (`Ctrl + P`) de toda a documentação. |
| **Backup Externo Automático** | Rotina diária automatizada (sob custódia técnica) | Cópia diária integral das pastas do Drive, planilhas e 80+ scripts `.gs`. |
| **Desenvolvedor / Suporte** | Vinícius Sulpicio (`viniciusulpicio@gmail.com`) | Suporte técnico, manutenção do painel web e restauração de backups. |

### Estrutura de Pastas Raiz no Google Drive
![Pastas Principais no Google Drive](img/00-drive-pastas-raiz.png)

Todas as ferramentas operam a partir das pastas principais:
- `adm`: Sistema de fichas e processos do Bolsa Família.
- `cadastramento domiciliar`: Agendamento, roteirização e termos de CD.
- `relatorios`: Dividida entre as planilhas de **Recepção/Fila dos Postos** (`RECEPCAO` e `Config_Postos_CadUnico`) e as planilhas de **Relatórios Estatísticos e Produção dos Servidores** (`RELATORIO SERVIDOR`, `RELATORIO CD` e `Gestão Mensal de Atendimentos`).
- `avaliacao atendimento`: Formulário e dashboards mensais de satisfação dos munícipes.
- `MODELOS DOCUMENTOS`: 20 modelos `.odt`/`.docx` de declarações/encaminhamentos e planilha `BAIRROS X CRAS.xlsx`.

---

## 2. Mapa dos Módulos do Sistema

1. **Painel de Fila e Recepção dos Postos (`cadunico_recepcao`)**
   - Comunicação em tempo real via Web App entre a planilha `RECEPCAO` de cada posto (Central, Teotônio Vilela, Rosa Modelli) e a tela dos entrevistadores, controlada pela planilha `Config_Postos_CadUnico`.
2. **Relatórios de Servidores e Gestão Mensal (`relatorios`)**
   - Planilhas mensais individuais de produção dos servidores (`RELATORIO SERVIDOR` e `RELATORIO CD`) conectadas ao painel consolidado `Gestão Mensal de Atendimentos`, com rotina de congelamento mensal e busca unificada por CPF/Nome.
3. **Administração de Benefícios (`adm`)**
   - Google Forms + Script de geração de processos administrativos em PDF mesclado com documentos comprobatórios.
4. **Cadastramento Domiciliar (`cadastramento domiciliar`)**
   - Google Forms + Script de geração de termos em PDF + Roteirizador geográfico com algoritmo 2-opt + Disparador WhatsApp.
5. **Avaliação de Atendimento (`avaliacao atendimento`)**
   - Coleta de notas de cordialidade, clareza e tempo de espera com geração automática de abas e dashboards mensais por servidor.
6. **Modelos de Documentos e Formulário Verde F1 (`MODELOS DOCUMENTOS` / `formulario_verde`)**
   - Declarações, termos unipessoais, fichas de exclusão, encaminhamentos, tabela `BAIRROS X CRAS.xlsx` e Formulário Verde F1 preenchível.
7. **Backup Automático Diário e Recuperação de Desastres**
   - Rotina diária externa que preserva todas as pastas do Drive, os 80+ códigos Apps Script vinculados ao lado de cada planilha (`[SCRIPT]`) e histórico de versões para restauração imediata em caso de perda ou invasão.

---

## 3. Serviços Externos e Dependências de Execução

- **Google Apps Script nativo:** Todos os scripts de backend usam tempo de execução V8 sob a conta Google do CadÚnico.
- **Geocodificação:** Utiliza o serviço interno do Google Workspace (`Maps.newGeocoder()`). **Não requer chave de API nem fatura no Google Cloud.**
- **Mesclagem de PDFs (pdf-lib):** Os scripts carregam a biblioteca `pdf-lib` via CDN (`https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js`) em tempo de execução para concatenar o documento base preenchido com as fotos/arquivos enviados nos formulários.

---

## 4. Onde Configurar Permissões para Novos Funcionários

1. **Acesso às Planilhas e Drives:**
   - Acesse o Google Drive com a conta `cadunico.marilia.sp@gmail.com`.
   - Compartilhe as pastas raiz e planilhas com nível de **Editor** apenas para quem for operar a triagem ou administrativo.
2. **Reimplantação de Scripts (Deploy):**
   - Toda alteração ou virada de mês na planilha de **Recepção/Fila** (`RECEPCAO`) exige que a implantação seja feita como:
     - **Executar como:** Eu (`cadunico.marilia.sp@gmail.com`)
     - **Quem tem acesso:** Qualquer pessoa (*Anyone*)
