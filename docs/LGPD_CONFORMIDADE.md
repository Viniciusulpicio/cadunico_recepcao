# Diretrizes e Mapeamento de Conformidade Legal — Cadastro Único

Este documento formaliza as adequações implementadas no sistema de recepção e fila interna para atender integralmente à legislação federal brasileira sobre proteção de dados pessoais, segurança da informação e sigilo no âmbito do Cadastro Único para Programas Sociais do Governo Federal (CadÚnico).

---

## 1. Mapeamento Normativo Federal

### a) Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei Federal nº 13.709/2018
- **Art. 6º, I, II e III (Finalidade, Adequação e Necessidade/Minimização):**
  - O sistema limita os dados visíveis no painel coletivo de fila de espera ao mínimo indispensável (Hora, Nome e Tipo de Atendimento).
  - O CPF é exibido mascarado (`***.XXX.XXX-**`) no backend e no frontend da fila geral.
  - Observações socioassistenciais e CPF íntegro somente são transmitidos e visualizados após o aceite formal do atendimento na cabine individual.
- **Art. 23 (Tratamento por Pessoas Jurídicas de Direito Público):**
  - O tratamento de dados destina-se estritamente ao atendimento público socioassistencial e à organização do fluxo de atendimento nos postos do CadÚnico/CRAS.
- **Art. 46 e 47 (Segurança e Sigilo):**
  - Todas as chamadas de API (`doGet` e `doPost`) exigem token de autenticação institucional (`token`).
  - Bloqueio automático de tela após 15 minutos de inatividade para evitar visualização indevida por terceiros no balcão (*anti-shoulder surfing*).
- **Art. 6º, X e Art. 37 (Responsabilização e Prestação de Contas):**
  - Gravação automática de trilha de auditoria na aba `AUDITORIA_LGPD` para cada aceite, encerramento, devolução e consulta detalhada.

### b) Decreto Federal nº 11.016/2022 (Regulamentação do Cadastro Único)
- **Art. 3º, incisos V e VI:**
  - Estabelece como diretrizes expressas a proteção dos dados pessoais nos termos da LGPD e o zelo incondicional pela segurança da informação.
  - O sistema impede raspagens anônimas e veda o compartilhamento indiscriminado de dados.

### c) Portaria MC nº 810/2022 (Gestão e Proteção de Dados do CadÚnico)
- **Art. 36:** Os operadores devem garantir a integridade e o sigilo das informações das pessoas e famílias cadastradas.
- **Art. 37:** O uso dos dados deve respeitar a dignidade e privacidade do cidadão. O painel não expõe histórico nem observações na recepção pública.

### d) Portaria MDS nº 502/2017 (Política de Controle de Acesso ao CadÚnico)
- **Identificação individualizada do operador:** O sistema extinguiu guichês anônimos; exige Nome Completo e Matrícula funcional antes de liberar a fila.
- **Termo de Compromisso e Manutenção de Sigilo (TCMS):** Exigência de aceite eletrônico formal com advertência expressa das sanções administrativas, civis e penais pelo uso indevido de dados.

---

## 2. Controles Técnicos Implementados no Código

| Mecanismo de Controle | Arquivo | Norma Atendida |
| :--- | :--- | :--- |
| **Autenticação por Token de Posto** | `Codigo.gs` (`validarAcesso_`) | LGPD art. 46; Portaria 502/2017 |
| **Mascaramento de CPF no Servidor** | `Codigo.gs` (`mascararCpfServidor_`) | LGPD art. 6º, III (Minimização) |
| **Supressão de Observações na Fila Geral** | `Codigo.gs` (`doGet`) | Portaria MC 810/2022 art. 36 |
| **Trilha de Auditoria com Registro Funcional** | `Codigo.gs` (`registrarAuditoria_`) | LGPD art. 6º, X; Portaria 502/2017 |
| **Termo de Sigilo Eletrônico (TCMS)** | `index.html` (`#modalTcms`) | Portaria MC 810/2022; Portaria 502/2017 |
| **Bloqueio de Tela por Inatividade (15 min)** | `index.html` (`#screenLockOverlay`) | Decreto 11.016/2022 art. 3º, VI |
| **Controle de Revelação de CPF na Cabine** | `index.html` (`#btnToggleMaskCpf`) | LGPD art. 46 (Segurança da Informação) |

---

## 3. Instruções para a Gestão Municipal

1. **Alteração da Chave de Segurança no Google Apps Script:**
   - No editor do Apps Script da planilha, acesse **Configurações do Projeto → Propriedades do Script**.
   - Adicione ou altere a propriedade `CHAVE_ACESSO_POSTO` com uma senha forte exclusiva da unidade.
2. **Coleta de Assinatura Física do TCMS:**
   - Além do aceite no sistema web, todos os operadores e entrevistadores devem assinar o Termo de Sigilo físico para arquivamento no prontuário do servidor.
3. **Fiscalização Periódica da Trilha de Auditoria:**
   - Mensalmente, a coordenação municipal deve inspecionar a aba `AUDITORIA_LGPD` na planilha Google para verificar eventuais acessos fora de horário ou volume anômalo.
4. **Desligamento de Servidores:**
   - Ao desligar ou remanejar um operador, altere a chave de segurança do posto para revogar acessos anteriores.
