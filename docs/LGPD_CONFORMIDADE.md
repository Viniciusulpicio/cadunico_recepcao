# Diretrizes e Mapeamento de Conformidade Legal — Cadastro Único

Este documento consolida todas as adequações técnicas, operacionais e de governança implementadas no ecossistema de sistemas do Cadastro Único para Programas Sociais do Governo Federal (CadÚnico) — Prefeitura Municipal de Marília.

As implementações atendem integralmente à **Lei Federal nº 13.709/2018 (LGPD)**, ao **Decreto Federal nº 11.016/2022**, à **Portaria MC nº 810/2022** e à **Portaria MDS nº 502/2017**.

---

## 1. Mapeamento Normativo Federal

### a) Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709/2018
- **Art. 6º, I, II e III (Finalidade, Adequação e Necessidade/Minimização):**
  - O painel público de fila limita a visualização aos dados operacionais estritamente indispensáveis (Hora, Nome e Tipo de Atendimento).
  - O CPF é mascarado no backend e frontend (`123.***.***-00`) durante toda a triagem coletiva.
  - O campo de observações socioassistenciais e o CPF íntegro somente são transmitidos à cabine após o aceite formal do atendimento pelo servidor.
- **Art. 23 (Tratamento por Pessoas Jurídicas de Direito Público):**
  - O tratamento destina-se estritamente ao atendimento socioassistencial e à organização pública de demandas nos postos e CRAS.
- **Art. 46 e 47 (Segurança da Informação e Dever de Sigilo):**
  - Todas as chamadas de API (`doGet` e `doPost`) exigem a chave de segurança da unidade (`token`).
  - Bloqueio automático de tela após 15 minutos sem uso (*anti-shoulder surfing*), exigindo a senha da unidade para desbloquear a visualização.
  - Eliminação de qualquer armazenamento local em disco desprotegido de arquivos com dados reais de munícipes.
- **Art. 6º, X e Art. 37 (Responsabilização e Prestação de Contas):**
  - Registro de auditoria em aba dedicada (`AUDITORIA_LGPD`) com carimbo de data/hora, matrícula do servidor, nome do operador e ação realizada.
  - Registro de auditoria em aba dedicada (`AUDITORIA_CONSULTAS`) na planilha mestre para qualquer pesquisa por CPF ou Nome.

### b) Decreto Federal nº 11.016/2022 (Regulamentação do Cadastro Único)
- **Art. 3º, incisos V e VI:**
  - Diretrizes expressas de proteção de dados pessoais e zelo pela segurança da informação.
  - Veda raspagens de dados e consultas sem autenticação de operador.

### c) Portaria MC nº 810/2022 (Gestão e Proteção de Dados do CadÚnico)
- **Art. 36:** Os operadores devem garantir a integridade e o sigilo das informações das pessoas e famílias cadastradas.
- **Art. 37:** O uso dos dados deve respeitar a dignidade e privacidade do cidadão. Histórico e anotações confidenciais não são expostos em balcões abertos.

### d) Portaria MDS nº 502/2017 (Política de Controle de Acesso ao CadÚnico)
- **Identificação individualizada:** Fim do atendimento anônimo; exige Nome Completo e Matrícula funcional antes de liberar a fila.
- **Termo de Compromisso e Manutenção de Sigilo (TCMS):** Aceite eletrônico obrigatório e coleta física da assinatura manual para o prontuário funcional (RH).

---

## 2. Controles Técnicos Implementados

| Módulo / Mecanismo | Arquivo de Origem | Norma Federal Atendida |
| :--- | :--- | :--- |
| **Autenticação por Chave de Posto** | `Codigo.gs` (`validarAcesso_`) | LGPD art. 46; Portaria MDS 502/2017 |
| **Mascaramento de CPF no Servidor** | `Codigo.gs` (`mascararCpfServidor_`) | LGPD art. 6º, III (Minimização) |
| **Ocultação de Observações na Fila Geral** | `Codigo.gs` (`doGet`) | Portaria MC 810/2022 art. 36 |
| **Trilha de Auditoria da Fila de Atendimento** | `Codigo.gs` (`registrarAuditoria_`) | LGPD art. 6º, X; Portaria MDS 502/2017 |
| **Validação Prévia de Credenciais no Login** | `index.html` (`assinarTcms`) | LGPD art. 46 (Prevenção de acessos indevidos) |
| **Proteção de Digitação e Toggle "Ver Senha"** | `index.html` (`inputTcmsToken`) | Usabilidade e segurança operacional |
| **Pausa de Polling com Modal Aberto** | `index.html` (`buscarFila`) | Estabilidade de sessão e integridade |
| **Bloqueio de Tela por Inatividade (15 min)** | `index.html` (`#screenLockOverlay`) | Decreto 11.016/2022 art. 3º, VI |
| **Desbloqueio com Chave da Unidade** | `index.html` (`desbloquearTela`) | Portaria MDS 502/2017 |
| **Controle de Revelação de CPF na Cabine** | `index.html` (`#btnToggleMaskCpf`) | LGPD art. 46 (Segurança em balcão) |
| **Auditoria de Buscas por CPF/Nome** | `Gestão Mensal` (`registrarAuditoriaBusca_`) | Portaria MDS 502/2017 e LGPD art. 37 |
| **Padronização Neutra no WhatsApp (CD)** | `codigo_apps_script_cd.js` | LGPD art. 5º, II e art. 33 (Sem dados médicos) |

---

## 3. Diretrizes Operacionais para a Gestão Municipal

1. **Configuração da Chave nas Propriedades do Script:**
   - Em cada planilha Google do posto, a chave deve ser configurada em **Configurações do Projeto → Propriedades do Script** sob o nome `CHAVE_ACESSO_POSTO`.
   - Essa propriedade fica gravada dentro dos servidores da Google e não é exposta no código-fonte.
2. **Coleta Física do TCMS:**
   - Todo operador deve assinar o termo físico disponível em `TERMO_DE_SIGILO_TCMS_OFICIAL.txt` para arquivamento no prontuário funcional.
3. **Migração do Google Drive para Domínio Institucional:**
   - As pastas do setor devem ser alocadas em um **Drive Compartilhado** pertencente ao domínio oficial da Prefeitura (`@marilia.sp.gov.br`), garantindo titularidade jurídica pública.
4. **Inspeção Mensal de Auditoria:**
   - A coordenação deve inspecionar mensalmente as abas `AUDITORIA_LGPD` (nas planilhas de posto) e `AUDITORIA_CONSULTAS` (na planilha mestre) para averiguar desvios ou consultas em horários anômalos.
5. **Procedimento em Desligamento de Servidor:**
   - Ao desligar, transferir ou exonerar servidores, alterar imediatamente a `CHAVE_ACESSO_POSTO` no Apps Script para revogar credenciais antigas.
