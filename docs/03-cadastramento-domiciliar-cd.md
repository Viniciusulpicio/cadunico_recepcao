# 03 - Sistema de Cadastramento Domiciliar (CD)

O módulo de Cadastramento Domiciliar atende pessoas acamadas, idosos ou pessoas com deficiência sem condições de comparecer aos postos. Ele engloba geração de termos em PDF, roteirização geográfica inteligente de visitas e disparo de notificações via WhatsApp.

---

## 1. Identificadores no Google Drive (`cadunico.marilia.sp@gmail.com`)

| Recurso | ID Google Drive | Descrição |
| :--- | :--- | :--- |
| **Doc Mestre Padrão** | `1SC3thHpexLTFnz1wAC-KsV9BByIK83AdlwUph1MVmXI` | Termo para Titular / Beneficiário capaz |
| **Doc Mestre Representante Legal** | `17tCn8cT6sq_AKU9YCnA-p__IlzhFTMNA0Mi6nfE5G6Q` | Termo para Tutela / Curatela / RL |
| **Pasta de Saída dos Termos** | `1pSg_3wGWIC3ow14QdtoTNsnPXWycw5kx` | Termos Gerados PDF |
| **Planilha Central** | - | GERAL solicitação CD |

### Organização da Pasta de Cadastramento Domiciliar no Drive
![Pasta CD no Google Drive](img/03-drive-pasta-cd.png)

---

## 2. Operação da Planilha Central (`PLANILHA GERAL CD`)

![Visão Geral da Planilha Geral CD](img/03-planilha-geral-cd.png)

A planilha contém colunas automáticas de controle operacional:
- **Previsão de Atendimento:** Data programada pelo roteirizador.
- **Situação Identificada / Status:** `CONCLUIDO` (destaque verde), `AQUIVADO` (destaque ciano) ou `DUPLICADO` (destaque rosa/vermelho).
- **Ordem da Rota:** Posição exata que o motorista/entrevistador deve seguir no dia (1 a 14).
- **Link do PDF:** Link direto do documento termo já mesclado na pasta do Drive.

---

## 3. Menus de Operação do Cadastramento Domiciliar

### Menu 1: Geração de Termos e Gatilhos (`⚡ CD Atendimento Domiciliar`)
![Menu CD Atendimento Domiciliar](img/03-menu-cd-atendimento-domiciliar.png)
- **Processar / Gerar PDFs Pendentes:** Cria os termos pendentes.
- **Sincronizar Links na Coluna R:** Reconecta os links dos PDFs criados na planilha geral.
- **Apagar PDFs e Limpar Links de Visitas Concluídas:** Limpa os PDFs pesados de casos já atendidos para economizar a cota de 15 GB do Google Drive.
- **Ativar Automação Automática:** Reativa os disparadores automáticos ao receber novos cadastros.

### Menu 2: Roteirizador Inteligente (`Automação CD`)
![Menu Automação CD](img/03-menu-automacao-cd.png)
- **Gerar Agenda Otimizada:** Agrupa as visitas pelo bairro mais distante da base (`Rua Nelson Spielman, 1294`) e calcula a rota mais curta do dia (máximo 14 na cidade ou 8 no distrito).
- **Recalcular Agenda:** Ajusta as datas de visitas pendentes.
- **Mover/Adiar Visitas Selecionadas:** Permite reprogramar manualmente visitas marcadas.
- **📑 Montar aba ROTA ORDENADA:** Cria uma folha pronta para impressão para entregar ao motorista e entrevistador com os endereços na sequência exata de viagem.
- **Limpar Cache de Endereços:** Limpa a aba `GeoCache` se algum endereço foi atualizado.

### Menu 3: Disparo de Notificação no WhatsApp (`📲 Disparar WhatsApp`)
![Menu Disparar WhatsApp](img/03-menu-disparar-whatsapp.png)
1. Clique na linha do cidadão agendado.
2. Acesse: **📲 Disparar WhatsApp → Enviar mensagem da linha selecionada**.
3. Clique em **📲 Abrir no WhatsApp Web** na barra lateral.
4. O chat abrirá com a data, horário aproximado e a lista dos documentos que a família deve deixar em mãos.
