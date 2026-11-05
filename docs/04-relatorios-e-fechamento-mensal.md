# 04 - Relatórios, Fechamento Mensal e Busca

Este módulo documenta a gestão consolidada dos atendimentos de todos os postos na planilha `Gestão Mensal de Atendimentos.xlsx`.

---

## 1. Estrutura de Pastas e Modelos Originais

![Pasta Relatórios no Google Drive](img/04-drive-pasta-relatorios.png)

Dentro da pasta `relatorios` do Google Drive:
- **`Gestão Mensal de Atendimentos`:** Painel mestre consolidado de estatísticas.
- **`Config_Postos_CadUnico`:** Planilha que armazena os links dos Apps Scripts de cada unidade.
- **`modelos originais`:** Pasta com as planilhas base oficiais para duplicar.

> **Aviso de Duplicação:** Para iniciar um novo mês ou novo setor, acesse a pasta `modelos originais`, clique com o botão direito e selecione **Fazer uma cópia**. Nunca crie planilhas em branco.
![Modelos Originais para Duplicar](img/04-drive-modelos-originais-duplicar.png)

---

## 2. Dashboard e Configuração Mensal de Servidores

![Demonstrativo Consolidado de Atendimentos](img/04-dashboard-consolidado.png)

A aba `Dashboard` resume os atendimentos realizados por local (Central, Rosa Modelli, Teotônio Vilela, Domicílio, Ação Itinerante, etc.) e por tipo de serviço.

A aba `Configuração Mensal` vincula a planilha individual de cada servidor:
![Configuração Mensal Servidores](img/04-configuracao-mensal-servidores.png)

---

## 3. Rotina Crítica: Congelamento do Mês Encerrado

As abas utilizam fórmulas dinâmicas para puxar os dados das planilhas de recepção. Ao final de cada mês, é **obrigatório congelar** para evitar perda de dados históricos ou lentidão:

1. Abra a aba do mês recém-encerrado.
2. Clique no menu superior: **🔍 Busca → Congelar Dados do Mês Atual**.
![Menu Busca e Congelar Dados](img/04-menu-busca-e-congelar.png)
3. Confirme a caixa de diálogo clicando em **Sim**.
4. O script converterá as fórmulas do intervalo `Z4:AH` em valores estáticos (texto puro), preservando o histórico permanentemente.

---

## 4. Como Adicionar Novos Meses na Ferramenta de Busca

A função de busca por Nome/CPF pesquisa em uma lista de abas. Quando um novo mês for criado:

1. Abra a planilha e vá em **Extensões → Apps Script**.
2. Abra o arquivo `codigo.gs` e localize a linha ~58:
   ```javascript
   var abasMensais = ['08/2026', '09/2026', '10/2026'];
   ```
3. Adicione o novo mês à lista (ex: `['08/2026', '09/2026', '10/2026', '11/2026']`).
4. Salve o script (Ctrl + S).

---

## 5. Como Operar a Busca Geral

1. Clique no menu **🔍 Busca → Buscar Atendimento (Nome ou CPF)**.
2. Digite o nome (completo ou parcial) ou os números do CPF (com ou sem pontuação).
3. Uma janela modal listará todos os registros correspondentes com: Mês, Data, Nome, CPF, Servidor e Tipo de Atendimento:
![Resultado da Pesquisa de Atendimentos](img/04-resultado-pesquisa-atendimentos.png)
