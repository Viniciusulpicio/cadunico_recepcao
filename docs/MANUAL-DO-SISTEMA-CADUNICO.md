# Manual de Operação e Manutenção dos Sistemas do Cadastro Único e Bolsa Família
**Prefeitura Municipal de Marília - Secretaria Municipal de Assistência Social**  
*Responsável técnico: Vinícius Sulpicio (`viniciusulpicio@gmail.com`)*

---

## Instrução Inicial: Duplicar Sempre, Nunca Criar do Zero

Para começar o mês novo de qualquer setor ou posto, nunca crie uma planilha em branco. Duplique a planilha do mês anterior ou use um dos arquivos da pasta `relatorios/modelos originais/`.

Quando você clica com o botão direito e seleciona **Fazer uma cópia**, o Google Sheets copia junto todo o código do Apps Script, os menus personalizados, as fórmulas e as formatações. Se você criar uma planilha nova do zero, nada disso vai funcionar.

**Dica para virada de mês dos setores:** O caminho mais rápido é duplicar a planilha do próprio setor do mês que acabou de fechar e apenas apagar os dados dos atendimentos antigos. Fazendo dessa forma, a nova planilha já vem com o nome dos servidores, os números de guichê e todas as configurações individuais de cada pessoa já montadas, sem precisar preencher tudo de novo.

---

## 1. Contas de Acesso e Estrutura de Pastas

### Conta Principal
- **E-mail:** `cadunico.marilia.sp@gmail.com`
- Esse e-mail é o dono de todas as pastas, formulários, planilhas e scripts. Para mexer em qualquer configuração, deploy de script ou permissão de pasta, você precisa estar conectado nessa conta.

### Estrutura no Google Drive
![Pastas Principais no Google Drive](img/00-drive-pastas-raiz.png)

Na raiz do Drive da conta, o trabalho está dividido em cinco frentes principais:
- **`adm`:** Fichas administrativas do Bolsa Família geradas a partir de formulário.
- **`cadastramento domiciliar`:** Solicitações de visita em domicílio, roteirização e termos.
- **`relatorios`:** Planilha consolidada de atendimentos da cidade, modelos originais e histórico.
- **`avaliacao atendimento`:** Pesquisa de satisfação dos munícipes e painéis gerenciais mensais por servidor.
- **`MODELOS DOCUMENTOS`:** 20 modelos de termos, declarações, encaminhamentos e a planilha `BAIRROS X CRAS.xlsx`.

### Repositório do Painel Web e Manual Online
- **Painel de Fila:** `https://viniciusulpicio.github.io/cadunico_recepcao/`
- **Manual Imprimível Online:** `https://viniciusulpicio.github.io/cadunico_recepcao/manual`
- **Repositório GitHub:** `https://github.com/Viniciusulpicio/cadunico_recepcao`

---

## 2. Painel de Fila dos Postos (Recepção e Entrevistadores)

### Como os Entrevistadores Usam o Painel no Navegador
![Painel de Fila Web Frontend](img/01-painel-fila-frontend-web.png)

O endereço do painel é `https://viniciusulpicio.github.io/cadunico_recepcao/`. Cada posto pode abrir direto com seu parâmetro:
- Posto Central: `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=central`
- CRAS Teotônio Vilela: `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=teotonio`
- CRAS Rosa Modelli: `https://viniciusulpicio.github.io/cadunico_recepcao/?posto=rosa_modelli`

Quando a recepção cadastra o atendimento na planilha e preenche a coluna G com `"Encaminhado para o atendimento interno (setor)"`, a pessoa entra na fila do painel web. O entrevistador clica em **Aceitar**, atende o cidadão e depois clica em **Finalizar**. A planilha recebe a hora de início, hora de término e o nome do servidor de forma automática.

### Devolução para a Fila e Redirecionamento de Atendimento
Se o entrevistador precisar devolver o atendimento para a fila, o botão **Devolver para a fila** oferece duas opções:
1. **Peguei por engano:** Retorna o cidadão imediatamente para o status `AGUARDANDO`, limpando o nome do entrevistador e o horário de aceite sem alterar os dados originais.
2. **Atendimento incorreto / Redirecionar:** Quando a demanda real do cidadão é diferente da cadastrada na recepção:
   - O sistema finaliza o atendimento atual (`FINALIZADO`) contabilizando para o entrevistador que fez a triagem.
   - Cria automaticamente uma nova linha com status `AGUARDANDO`, mantendo o horário de chegada original da pessoa para não prejudicá-la na fila, e permite selecionar um dos **16 tipos oficiais da planilha** (`Inclusão Cadastral`, `Atualização Cadastral`, `Exclusão da Familia`, `Solicitação Administração do Bolsa Familia`, `Emissão Comprovante CadÚnico`, `Emissão da Carteira da Pessoa Idosa`, `Encaminhamento`, `Solicitação de Atendimento Domiciliar`, `Informações Gerais`, `Não cumprimento de condicionalidades PBF - CRAS`, `Solicitação Desligamento Voluntário PBF`, `Atendimento Telefônico`, `Encaminhamento para outros setores ou políticas publicas`, `WhatsApp - Resposta à Família`, `WhatsApp - Comunicado à Família` ou `WhatsApp - Aviso Prévio de CD`).

### Como Montar a Planilha de um Novo Mês

#### 1. Fazer Cópia da Planilha
Vá até a pasta do posto no Google Drive, clique com o botão direito na planilha do mês anterior e selecione **Fazer uma cópia**. Renomeie a planilha com o mês seguinte (exemplo: `2026/11 - RECEPCAO - CENTRAL`) e apague apenas as linhas preenchidas na aba `RECEPÇÃO MENSAL`, preservando o cabeçalho (linhas 1 a 3).

Duplicar direto a planilha do setor do mês anterior é a forma mais prática, pois preserva os nomes dos entrevistadores, as escalas e as configurações já validadas de cada servidor.

#### 2. Abrir o Apps Script
Com a nova planilha aberta, vá em **Extensões → Apps Script**.
![Extensões Apps Script](img/01-extensoes-apps-script.png)

#### 3. Abrir o Menu de Implantação
No canto superior direito, clique em **Implantar → Gerenciar implantações** (ou Nova implantação).
![Apps Script Menu Implantar](img/01-apps-script-menu-implantar.png)

#### 4. Selecionar o Tipo App da Web
Clique no ícone de engrenagem ao lado de "Selecione o tipo" e confirme a opção **App da Web**.
![Apps Script Selecionar App da Web](img/01-apps-script-selecionar-webapp.png)

#### 5. Configurar Permissões
Essa etapa é necessária para o site conseguir ler a planilha sem pedir login dos entrevistadores:
- **Executar como:** `Eu (cadunico.marilia.sp@gmail.com)`
- **Quem pode acessar:** `Qualquer pessoa`
![Configuração de Acesso Qualquer Pessoa](img/01-apps-script-config-qualquer-pessoa.png)

#### 6. Copiar a URL Gerada
Clique em **Implantar** e copie a URL que termina em `/exec`.
![Copiar URL Gerada](img/01-apps-script-copiar-url.png)

#### 7. Atualizar a Planilha de Configuração
Abra a planilha `Config_Postos_CadUnico` no Drive e cole a URL na linha correspondente ao posto (`central`, `teotonio` ou `rosa_modelli`).
![Planilha Config Postos URLs](img/01-planilha-config-postos-urls.png)

---

## 3. Administração de Benefícios (ADM / Bolsa Família)

Esse sistema gera os processos de desbloqueio, reversão de cancelamento e defesas de condicionalidades. O técnico preenche o formulário com dados e anexos, e o script gera um PDF único juntando o requerimento preenchido aos comprovantes enviados.

### Pasta do Setor no Google Drive
![Pasta ADM no Google Drive](img/02-drive-pasta-adm.png)

- **`SOLICITAÇÃO DE ADMINISTRAÇÃO PBF`:** Formulário de envio com perguntas cadastrais e campos de upload.
- **`DOCUMENTO MESTRE ADM`:** Arquivo do Google Docs com o modelo do requerimento oficial.
- **`ADM Gerados PDF`:** Pasta onde o script salva os PDFs finais mesclados.
- **`GERAL solicitação ADM`:** Planilha que lista todos os registros recebidos e os links para abrir os PDFs gerados.

### Menu de Controle na Planilha (`⚡ ADM Benefícios`)
![Menu ADM Benefícios](img/02-menu-adm-beneficios.png)

- **Processar / Gerar PDFs Pendentes:** Percorre linhas sem link e tenta gerar o documento novamente. Use se alguém enviar o formulário enquanto o script estiver inativo.
- **Reprocessar Linha Selecionada:** Gera novamente o PDF da linha em que você estiver clicado.
- **Reprocessar Última Resposta:** Força o processamento do último formulário recebido.
- **Limpar Uploads Residuais do Meu Drive:** Move fotos avulsas da raiz do Drive para a pasta correta de respostas.
- **Ativar Automação Automática:** Reconecta o gatilho automático de envio (`onFormSubmit`). Se o formulário for respondido e a planilha não gerar o link do PDF, clique aqui para reativar.

---

## 4. Cadastramento Domiciliar (CD)

Atende pessoas acamadas ou com mobilidade reduzida. O sistema recebe pedidos via formulário, gera os termos com os documentos anexados, organiza as rotas geográficas por bairro e envia mensagem de confirmação para a família no WhatsApp.

### Pasta no Google Drive
![Pasta CD no Google Drive](img/03-drive-pasta-cd.png)

- **`SOLICITACAO CD`:** Formulário para inclusão de novos pedidos de visita.
- **`DOCUMENTO MESTRE`:** Modelo para titular capaz.
- **`DOCUMENTO MESTRE RL`:** Modelo para titulares com curador, tutor ou responsável legal.
- **`Termos Gerados PDF`:** Pasta onde os termos ficam salvos após a mesclagem.
- **`GERAL solicitação CD`:** Planilha central de controle e roteirização.

### Status e Cores da Planilha Geral
![Visão Geral da Planilha Geral CD](img/03-planilha-geral-cd.png)

- **Verde (`CONCLUIDO`):** Visita domiciliar feita.
- **Ciano (`AQUIVADO`):** Endereço não localizado, família mudou ou recusou atendimento.
- **Rosa (`DUPLICADO`):** Pedido repetido na triagem.
- **Ordem da Rota:** Posição que o veículo deve seguir na rua durante o itinerário do dia (1 a 14).
- **Link do PDF:** Abre o arquivo pronto para impressão para levar na prancheta de campo.

### Menus de Comando do Cadastramento Domiciliar

#### Menu 1: Emissão de Termos (`⚡ CD Atendimento Domiciliar`)
![Menu CD Atendimento Domiciliar](img/03-menu-cd-atendimento-domiciliar.png)
- **Processar / Gerar PDFs Pendentes:** Cria os termos em PDF que ainda não foram gerados.
- **Sincronizar Links na Coluna R:** Restaura os links dos PDFs criados na coluna R.
- **Apagar PDFs e Limpar Links de Visitas Concluídas:** Apaga arquivos pesados de visitas finalizadas para liberar espaço na conta do Google Drive.
- **Ativar Automação Automática:** Reativa o gatilho de formulário caso pare de rodar sozinho.

#### Menu 2: Roteirizador de Visitas (`Automação CD`)
![Menu Automação CD](img/03-menu-automacao-cd.png)
- **Gerar Agenda Otimizada:** Agrupa os atendimentos pendentes partindo do bairro mais distante da sede (`Rua Nelson Spielman, 1294`) e calcula a rota mais curta do dia (limite de 14 visitas na área urbana ou 8 nos distritos).
- **Recalcular Agenda:** Reorganiza datas futuras com base nos novos pedidos recebidos.
- **Mover/Adiar Visitas Selecionadas:** Reprograma as linhas selecionadas para outra data.
- **Montar aba ROTA ORDENADA:** Cria uma aba limpa contendo apenas a folha de bordo do dia, na ordem exata de parada, pronta para imprimir para o motorista e entrevistador.
- **Limpar Cache de Endereços:** Limpa a aba `GeoCache` se algum endereço tiver sido alterado na triagem.

#### Menu 3: Mensagem de WhatsApp (`📲 Disparar WhatsApp`)
![Menu Disparar WhatsApp](img/03-menu-disparar-whatsapp.png)
1. Clique na linha da pessoa agendada.
2. Acesse **📲 Disparar WhatsApp → Enviar mensagem da linha selecionada**.
3. Na barra lateral que se abre, clique em **📲 Abrir no WhatsApp Web**.
4. O WhatsApp Web abrirá a conversa com a mensagem pré-preenchida contendo a data da visita e os documentos necessários.

---

## 5. Relatórios Estatísticos, Gestão Mensal e Busca

Consolida o total de atendimentos de todos os postos de Marília para relatórios e prestação de contas.

### Pasta de Relatórios e Modelos Originais
![Pasta Relatórios no Google Drive](img/04-drive-pasta-relatorios.png)

A pasta `modelos originais` guarda as matrizes que nunca devem ser editadas diretamente, apenas duplicadas:
- `yyyy/xx - RECEPCAO`
- `yyyy/xx - RELATORIO CD`
- `yyyy/xx- RELATORIO SERVIDOR`
![Modelos Originais para Duplicar](img/04-drive-modelos-originais-duplicar.png)

### Dashboard e Configuração de Servidores
![Demonstrativo Consolidado de Atendimentos](img/04-dashboard-consolidado.png)

A aba `Dashboard` soma os atendimentos por local (Central, Rosa Modelli, Teotônio Vilela, Domicílio, Ação Itinerante, etc.) e tipo de demanda.

A aba `Configuração Mensal` vincula a planilha individual de cada servidor:
![Configuração Mensal Servidores](img/04-configuracao-mensal-servidores.png)

### Rotina Obrigatória: Congelar Dados do Mês Encerrado
As abas mensais trazem os dados das recepções por meio de fórmulas. Para evitar que os dados mudem ou sumam quando as planilhas dos postos forem arquivadas, congele a aba assim que o mês terminar:

1. Abra a planilha `Gestão Mensal de Atendimentos`.
2. Vá até a aba do mês encerrado (exemplo: `10/2026`).
3. Clique em **🔍 Busca → Congelar Dados do Mês Atual**.
![Menu Busca e Congelar Dados](img/04-menu-busca-e-congelar.png)
4. Confirme no aviso. O script substituirá as fórmulas por valores fixos.

### Busca Geral por CPF ou Nome
1. Na mesma planilha, vá em **🔍 Busca → Buscar Atendimento (Nome ou CPF)**.
2. Digite o CPF ou parte do nome.
3. O sistema abre uma lista com todas as passagens da pessoa registradas nos meses pesquisados:
![Resultado da Pesquisa de Atendimentos](img/04-resultado-pesquisa-atendimentos.png)

Para incluir um mês novo na busca, abra **Extensões → Apps Script** nessa planilha e adicione o mês no array `abasMensais` (linha 58 do arquivo `codigo.gs`):
```javascript
var abasMensais = ['08/2026', '09/2026', '10/2026', '11/2026'];
```

---

## 6. Avaliação de Atendimento e Desempenho dos Atendentes

Sistema que coleta a opinião do munícipe via formulário e constrói automaticamente painéis mensais com notas de cordialidade, clareza, tempo de espera e resolução da demanda.

### Formulário Respondido pelo Cidadão
![Formulário de Avaliação pelo Munícipe](img/05-formulario-avaliacao-municipe.png)

A pesquisa é anônima e rápida (menos de 1 minuto). O munícipe informa o posto, seleciona o atendente na lista e atribui notas de 1 a 5 para cordialidade e clareza, além de registrar se a solicitação foi resolvida.

### Painel Gerencial Global e por Servidor
![Painel Gerencial de Avaliação de Atendimento](img/05-dashboard-gerencial-avaliacao.png)

A aba `Dashboard Global` (e as abas clonadas de cada mês) consolida:
- Indicadores globais de satisfação e resolução.
- Desempenho individual por atendente (quantidade de atendimentos e médias de notas).
- Distribuição por tempo de espera e tipo de atendimento.

### Automação Mensal Automática (`onFormSubmit`)
Quando o cidadão envia a avaliação no Google Forms:
1. O script identifica o mês e ano do atendimento (exemplo: `Novembro 2026`).
2. Se for o primeiro envio do mês, ele cria automaticamente as abas `[Mês AAAA] - Respostas` e `[Mês AAAA] - Dashboard` (clonando os gráficos e ajustando as fórmulas para lerem o novo mês).
3. A linha de resposta é gravada na aba do mês correspondente e também na aba global.

### Menus de Comando da Planilha (`📊 Gestão CadÚnico`)
![Menu Gestão CadÚnico](img/05-menu-gestao-cadunico.png)
- **➕ Criar Mês Atual (Respostas + Dashboard):** Cria com antecedência o par de abas do mês corrente antes mesmo de entrar a primeira resposta.
- **📅 Criar Mês Específico...:** Permite gerar abas para meses anteriores ou futuros digitando o nome do mês e o ano.

---

## 7. Modelos de Documentos Oficiais, Territorialização e Formulário Verde F1

Na pasta `MODELOS DOCUMENTOS` do Google Drive estão padronizados os 20 arquivos editáveis (`.odt`, `.docx` e `.doc`) de uso diário:
- **Declarações e Termos:** Declaração de Residência (Titular e Responsável Legal), Declaração de Comparecimento, Termo de Renda e Composição Familiar, Termo de Família Unipessoal (Titular e RL) e Requerimento de Troca de RF.
- **Exclusão e Desligamento:** Ficha de Exclusão de Pessoa, Ficha de Exclusão da Família, Termo de Responsabilidade de Exclusão BPC e Declaração de Desligamento Voluntário do PBF.
- **Encaminhamentos para a Rede:** CRAS, Centro POP, INSS/BPC, Educação e Encaminhamento Genérico.
- **Abrangência dos CRAS (`BAIRROS X CRAS.xlsx`):** Tabela oficial que vincula cada bairro de Marília ao seu respectivo CRAS de referência.
- **Formulário Verde F1 Digital (`formulario_verde`):** Matrizes em alta definição do Formulário Principal F1 prontas para preenchimento em tela (`FORMULARIO_VERDE_F1_PREENCHIVEL.pdf`) ou impressão (`FORMULARIO_VERDE_F1_OFICIAL_DOCS.docx`).

---

## 8. Backup Automático Diário (Servidor 24h) e Recuperação de Desastres

Para proteger o setor contra invasão da conta Google ou exclusão acidental de planilhas e códigos, um servidor dedicado 24h (`rk322x-box` / `192.168.0.215`) executa automaticamente o backup completo todos os dias às **03:00 da manhã**.

### Como Acessar os Arquivos Salvos
- **Pelo Navegador (Filebrowser):** `http://rk322x-box:8082/files/backups_cadunico`
- **Pela Rede Local (Samba):** `\\192.168.0.215\Compartilhado\backups_cadunico`

### O que o Backup Salva Automaticamente
1. **Mesma Organização do Google Drive (`rclone copy`):** Todas as pastas (`adm`, `avaliacao atendimento`, `cadastramento domiciliar`, `MODELOS DOCUMENTOS` e `relatorios`) ficam espelhadas com a mesma estrutura do Drive. Como o sistema usa o comando `copy` (e nunca `sync`), **mesmo que alguém apague tudo no Google Drive, nenhum arquivo é apagado no servidor de backup**.
2. **Todos os 80+ Scripts (`.gs` / `.html`) Junto de Suas Planilhas:** Mesmo que os projetos no Google Apps Script tenham o nome genérico `"Projeto sem título"`, o extrator automático (`pull_scripts.py`) lê o vínculo oficial (`parentId`) da planilha dona e salva os códigos dentro da pasta **`Nome da Planilha [SCRIPT]/`** exatamente ao lado do arquivo `.xlsx` correspondente.
3. **Histórico de Alterações e Snapshots Compactados (`.tar.gz`):** Sempre que uma planilha é alterada no Drive, a cópia anterior é guardada com data e hora em `historico_alterados/`. Além disso, o servidor gera pacotes diários `cadunico-AAAA-MM-DD.tar.gz` (mantendo os últimos 30 dias + todo dia 01 de cada mês preservado permanentemente).

### Como Restaurar em Caso de Perda ou Invasão
1. Acesse `http://rk322x-box:8082/files/backups_cadunico`, localize a pasta do setor e baixe a planilha `.xlsx` e a pasta `Nome da Planilha [SCRIPT]/`.
2. Suba a planilha `.xlsx` novamente para o Google Drive e clique em **Arquivo → Salvar como Planilhas Google**.
3. Na planilha restaurada, abra **Extensões → Apps Script**, cole o código `.gs` salvo na pasta `[SCRIPT]`, salve (`Ctrl + S`) e ative o gatilho no menu **⚙️ Ativar Automação Automática**.

---

## 9. O que Fazer se Alguma Coisa Der Errado

| Ocorrência | Onde Olhar | Como Resolver |
| :--- | :--- | :--- |
| O formulário do ADM ou do CD recebeu resposta, mas a planilha não gerou o PDF | Gatilho automático desarmado | Abra a planilha e clique no menu do setor em **Ativar Automação Automática**. Autorize as permissões da conta Google. |
| O painel de fila no site não carrega a lista de pessoas | Permissão de acesso do Apps Script | Na planilha de recepção do posto, vá em **Implantar → Gerenciar implantações**, clique no lápis de editar e confirme se está com **Quem pode acessar: Qualquer pessoa**. Copie a URL e cole na `Config_Postos_CadUnico`. |
| O Google Drive avisou que o armazenamento de 15 GB está no fim | Excesso de xerox antigas no Drive | Na planilha de CD, acione o menu **⚡ CD Atendimento Domiciliar → Apagar PDFs e Limpar Links de Visitas Concluídas**. Em seguida, esvazie a lixeira do Drive da conta. |
| O roteirizador do CD não traça rota ou para com erro | Endereço com número incorreto ou fora de Marília | Verifique se o endereço da solicitação tem o formato `Rua Nome da Rua, 123`. Corrija a célula e use **Automação CD → Limpar Cache de Endereços**. |
| A planilha de Gestão Mensal demora muito para abrir | Fórmulas de meses passados ainda ativas | Vá na aba do mês anterior e execute o menu **Busca → Congelar Dados do Mês Atual**. |
| Uma planilha ou script foi apagado ou corrompido no Google Drive | Servidor de Backup 24h (`backups_cadunico`) | Acesse `http://rk322x-box:8082/files/backups_cadunico`, baixe a planilha `.xlsx` e a pasta `[SCRIPT]` correspondente (ou acione o suporte técnico abaixo). |

---

## 10. Suporte Técnico e Contato do Desenvolvedor

Em caso de invasão da conta Google, necessidade de restauração completa dos snapshots de backup, ajustes no painel web de fila ou dúvidas técnicas sobre a infraestrutura dos sistemas, entre em contato diretamente com o desenvolvedor:

- **Responsável Técnico:** Vinícius Sulpicio
- **E-mail:** `viniciusulpicio@gmail.com`
- **GitHub / Código-Fonte:** `https://github.com/Viniciusulpicio/cadunico_recepcao`
