# 00 - Visão Geral do Sistema e Gestão de Acessos

Este documento centraliza as contas, permissões, infraestrutura de backup e contatos de suporte dos sistemas mantidos no setor do Cadastro Único e Bolsa Família (Prefeitura Municipal de Marília).

---

## 1. Conta Mestra, Repositórios e Servidor de Backup

| Recurso | Identificador / Localização | Responsabilidade |
| :--- | :--- | :--- |
| **E-mail Institucional Google** | `cadunico.marilia.sp@gmail.com` | Dono de todas as planilhas, formulários, arquivos mestre e Apps Scripts. |
| **Repositório Front-end (Fila)** | `https://github.com/Viniciusulpicio/cadunico_recepcao` | Código HTML/JS do Painel de Fila e Manual hospedados no GitHub Pages. |
| **Página Web em Produção** | `https://viniciusulpicio.github.io/cadunico_recepcao/` | Interface visual acessada pelos entrevistadores e recepção. |
| **Manual Web para Impressão** | `https://viniciusulpicio.github.io/cadunico_recepcao/manual` | Versão online e imprimível (`Ctrl + P`) de toda a documentação. |
| **Servidor de Backup 24h** | `http://rk322x-box:8082/files/backups_cadunico` (`192.168.0.215`) | Espelho diário automático (03:00) das planilhas, pastas e 80+ scripts `.gs`. |
| **Desenvolvedor / Suporte** | Vinícius Sulpicio (`viniciusulpicio@gmail.com`) | Manutenção da arquitetura, painel web e restauração de backups de emergência. |

### Estrutura de Pastas Raiz no Google Drive
![Pastas Principais no Google Drive](img/00-drive-pastas-raiz.png)

Todas as ferramentas operam a partir das pastas principais:
- `adm`: Sistema de fichas e processos do Bolsa Família.
- `cadastramento domiciliar`: Agendamento, roteirização e termos de CD.
- `relatorios`: Gestão mensal consolidada, modelos originais e histórico de fechamento.
- `avaliacao atendimento`: Formulário e dashboards mensais de satisfação dos munícipes.
- `MODELOS DOCUMENTOS`: 20 modelos `.odt`/`.docx` de declarações/encaminhamentos e planilha `BAIRROS X CRAS.xlsx`.

---

## 2. Mapa dos Módulos do Sistema

1. **Painel de Fila / Recepção (`cadunico_recepcao`)**
   - Comunicação via Web App entre a recepção e os entrevistadores de 3 postos (Central, Teotônio Vilela, Rosa Modelli), com devolução por engano e redirecionamento entre os 16 tipos oficiais de atendimento.
2. **Administração de Benefícios (`adm`)**
   - Google Forms + Script de geração de processos administrativos em PDF mesclado com documentos comprobatórios.
3. **Cadastramento Domiciliar (`cadastramento domiciliar`)**
   - Google Forms + Script de geração de termos em PDF + Roteirizador geográfico com algoritmo 2-opt + Disparador WhatsApp.
4. **Relatórios e Gestão Mensal (`relatorios`)**
   - Consolidação de atendimentos mensais, congelamento de histórico e mecanismo de busca por CPF/Nome.
5. **Avaliação de Atendimento (`avaliacao atendimento`)**
   - Coleta de notas de cordialidade, clareza e tempo de espera com geração automática de abas e dashboards mensais por servidor.
6. **Modelos de Documentos e Formulário Verde F1 (`MODELOS DOCUMENTOS` / `formulario_verde`)**
   - Declarações, termos unipessoais, fichas de exclusão, encaminhamentos, tabela `BAIRROS X CRAS.xlsx` e Formulário Verde F1 preenchível.
7. **Backup Automático Diário (`backups_cadunico`)**
   - Rotina diária (03:00) via `rclone copy` + `pull_scripts.py` que salva todas as pastas do Drive, os 80+ códigos Apps Script ao lado de cada planilha (`[SCRIPT]`) e snapshots `.tar.gz` de 30 dias + mensais.

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
   - Toda alteração em código de Web App (`cadunico_recepcao`) exige que a implantação seja feita como:
     - **Executar como:** Eu (`cadunico.marilia.sp@gmail.com`)
     - **Quem tem acesso:** Qualquer pessoa (*Anyone*)
