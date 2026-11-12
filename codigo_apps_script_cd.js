/**
 * - SISTEMA DE GERAÇÃO E CONCATENAÇÃO DE ATENDIMENTO DOMICILIAR (CD)
 * - Prefeitura Municipal de Marília - Cadastro Único / Bolsa Família
 * - INCLUI: Termo Domiciliar (Google Docs) + Formulário Verde F1 Oficial (Governo Federal) + Anexos
 */

const ID_DOCUMENTO_MESTRE_RL = "17tCn8cT6sq_AKU9YCnA-p__IlzhFTMNA0Mi6nfE5G6Q";
const ID_DOCUMENTO_MESTRE = "1SC3thHpexLTFnz1wAC-KsV9BByIK83AdlwUph1MVmXI";
const ID_PDF_FORMULARIO_VERDE = "1M1MzdRQ1QFCwdOv4U0DF2XovNLpIpWqF"; // FORMULARIO VERDE F1.pdf oficial do Governo Federal
const ID_PASTA_DESTINO = "1pSg_3wGWIC3ow14QdtoTNsnPXWycw5kx"; // Termos Gerados PDF

// Email da conta oficial do Cadastro Único (opcional, para passar a posse do arquivo)
const EMAIL_DONO_CADUNICO = ""; // Ex: "cadunico@marilia.sp.gov.br" (deixe vazio se a automação já rodar logada nele)

const COLUNA_LINK_PDF_FORMS = 40; // Coluna AN na aba 'forms'
const COLUNA_LOG_FORMS = 41;      // Coluna AO na aba 'forms' (aviso de erro / anexos que falharam)
const VERSAO_PDFLIB = "1.17.1";
const NOME_CACHE_PDFLIB = "pdf-lib.min.js (cache do script)";
const COLUNA_LINK_GERAL_CD = 18;  // Coluna R na aba 'PLANILHA GERAL CD'
const COLUNA_STATUS_GERAL_CD = 16;// Coluna P na aba 'PLANILHA GERAL CD'

// Ordem exata dos anexos no miolo do PDF
const ORDEM_ANEXOS = [
  { kw: "folha resumo", label: "Folha Resumo" },
  { kw: "doc de identidade", label: "Xerox Doc Identidade" },
  { kw: "tutela", label: "Xerox Tutela/Curatela" },
  { kw: "comprovante de residência", label: "Xerox Comp. Residência" },
  { kw: "cnis", label: "Tela/Extrato CNIS" },
  { kw: "sibec", label: "Consulta SIBEC" },
  { kw: "receita federal", label: "Comprovante Receita Federal" },
  { kw: "outros documentos 1", label: "Outros Documentos 1" },
  { kw: "outros documentos 2", label: "Outros Documentos 2" },
  { kw: "outros documentos 3", label: "Outros Documentos 3" }
];

// ==========================================
// MENU PERSONALIZADO NO GOOGLE SHEETS
// ==========================================
function onOpen() {
  menuRota_();
  if (typeof menuAgenda_ === "function") menuAgenda_();
  if (typeof menuWhatsApp_ === "function") menuWhatsApp_();
}

function menuRota_() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ CD Atendimento Domiciliar")
    .addItem("🔄 Processar / Gerar PDFs Pendentes", "processarRespostasPendentes")
    .addItem("📄 Reprocessar Linha Selecionada", "reprocessarLinhaSelecionada")
    .addItem("👤 Reprocessar Última Resposta", "reprocessarUltimaResposta")
    .addSeparator()
    .addItem("🔗 Sincronizar Links na Coluna R (Geral CD)", "sincronizarTodosLinksParaPlanilhaGeral")
    .addSeparator()
    .addItem("🧹 Apagar PDFs e Limpar Links de Visitas Concluídas", "limparArquivosVisitasConcluidas")
    .addItem("⚙️ Ativar Automação Automática", "instalarGatilhoAutomatico")
    .addToUi();
}

// ==========================================
// ATIVAÇÃO DOS GATILHOS AUTOMÁTICOS
// ==========================================
function instalarGatilhoAutomatico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var gatilhos = ScriptApp.getProjectTriggers();

  for (var i = 0; i < gatilhos.length; i++) {
    var fn = gatilhos[i].getHandlerFunction();
    if (fn === "processarEnvioFormulario" || fn === "limparArquivosVisitasConcluidas" || fn === "aoEditarStatus") {
      ScriptApp.deleteTrigger(gatilhos[i]);
    }
  }

  ScriptApp.newTrigger("processarEnvioFormulario")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  ScriptApp.newTrigger("aoEditarStatus")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  ScriptApp.newTrigger("limparArquivosVisitasConcluidas")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  SpreadsheetApp.getUi().alert(
    "✅ Automação 100% Configurada!\n\n" +
    "Os gatilhos antigos foram limpos e um novo fluxo único foi estabelecido."
  );
}

// ==========================================
// GATILHO EM TEMPO REAL AO EDITAR STATUS (COLUNA P)
// ==========================================
function aoEditarStatus(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== "PLANILHA GERAL CD") return;

    const col = e.range.getColumn();
    const row = e.range.getRow();
    if (col !== COLUNA_STATUS_GERAL_CD || row < 2) return;

    const novoStatus = String(e.value || sheet.getRange(row, col).getValue() || "").trim().toUpperCase();
    const ehConcluido = novoStatus.includes("CONCLUIDO") || novoStatus.includes("CONCLUÍDO") || 
                        novoStatus.includes("ARQUIVADO") || novoStatus.includes("AQUIVADO");

    if (ehConcluido) {
      apagarPdfELimparLinhaGeral(sheet, row);
    }
  } catch (err) {
    Logger.log("Aviso em aoEditarStatus: " + err.toString());
  }
}

function apagarPdfELimparLinhaGeral(sheet, row) {
  const linkPdf = String(sheet.getRange(row, COLUNA_LINK_GERAL_CD).getValue() || "").trim();
  const cpf = String(sheet.getRange(row, 4).getValue() || "").replace(/\D/g, "");

  if (linkPdf && linkPdf.startsWith("http")) {
    const fileId = extrairIdArquivoGoogleDrive(linkPdf);
    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        if (!file.isTrashed()) {
          file.setTrashed(true);
        }
      } catch (e) {}
    }
  }

  sheet.getRange(row, COLUNA_LINK_GERAL_CD).clearContent();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaForms = ss.getSheetByName("forms");
  if (abaForms && cpf) {
    const ultForms = abaForms.getLastRow();
    for (let f = 2; f <= ultForms; f++) {
      const cpfForm = String(abaForms.getRange(f, 3).getValue() || "").replace(/\D/g, "");
      if (cpfForm === cpf) {
        for (let colUpload = 30; colUpload <= 39; colUpload++) {
          const valUpload = String(abaForms.getRange(f, colUpload).getValue() || "");
          const matches = valUpload.match(/[-\w]{25,}/g);
          if (matches) {
            matches.forEach(id => {
              try {
                DriveApp.getFileById(id).setTrashed(true);
              } catch(errU) {}
            });
          }
        }
        abaForms.getRange(f, COLUNA_LINK_PDF_FORMS).clearContent();
        break;
      }
    }
  }
}

function limparArquivosVisitasConcluidas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaGeral = ss.getSheetByName("PLANILHA GERAL CD");
  if (!abaGeral) return;

  const ultGeral = abaGeral.getLastRow();
  if (ultGeral < 2) return;

  let totalLimpos = 0;
  for (let r = 2; r <= ultGeral; r++) {
    const status = String(abaGeral.getRange(r, COLUNA_STATUS_GERAL_CD).getValue() || "").trim().toUpperCase();
    const linkPdf = String(abaGeral.getRange(r, COLUNA_LINK_GERAL_CD).getValue() || "").trim();

    const ehConcluido = status.includes("CONCLUIDO") || status.includes("CONCLUÍDO") || 
                        status.includes("ARQUIVADO") || status.includes("AQUIVADO");

    if (ehConcluido && linkPdf !== "") {
      apagarPdfELimparLinhaGeral(abaGeral, r);
      totalLimpos++;
    }
  }
}

// ==========================================
// MOTOR DE GERAÇÃO E PROCESSAMENTO
// ==========================================
async function processarRespostasPendentes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaResp = ss.getSheetByName("forms");
  var ultLinha = abaResp.getLastRow();

  if (ultLinha < 2) {
    SpreadsheetApp.getUi().alert("Nenhuma resposta encontrada para processar.");
    return;
  }

  var processados = 0;
  for (var r = 2; r <= ultLinha; r++) {
    var linkExistente = abaResp.getRange(r, COLUNA_LINK_PDF_FORMS).getValue();
    if (!linkExistente || linkExistente.toString().trim() === "") {
      await gerarTermoCdPorLinha(r);
      processados++;
    }
  }
  SpreadsheetApp.getUi().alert("Processamento concluído! " + processados + " documento(s) gerado(s).");
}

async function reprocessarLinhaSelecionada() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var linha = sheet.getActiveCell().getRow();
  if (linha < 2) {
    SpreadsheetApp.getUi().alert("Por favor, selecione uma linha de dados (linha 2 ou superior).");
    return;
  }
  const link = await gerarTermoCdPorLinha(linha, true);
  SpreadsheetApp.getUi().alert(link
    ? "Linha " + linha + " reprocessada com sucesso!"
    : "Linha " + linha + " NÃO foi gerada. Veja o motivo na coluna AO da aba 'forms'.");
}

async function reprocessarUltimaResposta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaResp = ss.getSheetByName("forms");
  var linha = abaResp.getLastRow();
  const link = await gerarTermoCdPorLinha(linha, true);
  SpreadsheetApp.getUi().alert(link
    ? "Última linha (" + linha + ") processada com sucesso!"
    : "Linha " + linha + " NÃO foi gerada. Veja o motivo na coluna AO da aba 'forms'.");
}

async function processarEnvioFormulario(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaRespostas = ss.getSheetByName("forms");
    if (!abaRespostas) return;

    const linha = e && e.range ? e.range.getRow() : abaRespostas.getLastRow();
    if (linha <= 1) return;

    const linkJaExiste = abaRespostas.getRange(linha, COLUNA_LINK_PDF_FORMS).getValue();
    if (linkJaExiste && linkJaExiste.toString().trim() !== "") {
      return;
    }

    SpreadsheetApp.flush();
    Utilities.sleep(1500);

    await gerarTermoCdPorLinha(linha);
  } catch (erro) {
    Logger.log("Erro no gatilho processarEnvioFormulario: " + erro.toString());
  }
}

async function gerarTermoCdPorLinha(linha, forcar) {
  // Trava de execução concorrente para evitar gerar PDFs duplicados ao mesmo tempo
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(120000)) {
    Logger.log("Outro processo já está gerando este documento na linha " + linha);
    return null;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaRespostas = ss.getSheetByName("forms");
    if (!abaRespostas || linha <= 1) return null;

    SpreadsheetApp.flush();
    const linkAtual = abaRespostas.getRange(linha, COLUNA_LINK_PDF_FORMS).getValue();
    if (linkAtual && linkAtual.toString().trim().startsWith("http")) {
      if (!forcar) return linkAtual;
      const idAntigo = extrairIdArquivoGoogleDrive(linkAtual.toString());
      if (idAntigo) { try { DriveApp.getFileById(idAntigo).setTrashed(true); } catch (e) {} }
      abaRespostas.getRange(linha, COLUNA_LINK_PDF_FORMS).clearContent();
    }
    abaRespostas.getRange(linha, COLUNA_LOG_FORMS).clearContent();

    const numColunas = abaRespostas.getLastColumn();
    const headers = abaRespostas.getRange(1, 1, 1, numColunas).getValues()[0];
    const dados = abaRespostas.getRange(linha, 1, 1, numColunas).getValues()[0];

    function formatarDataSegura(valorData, dataPadrao) {
      if (!valorData) return dataPadrao;
      const d = new Date(valorData);
      if (isNaN(d.getTime())) return dataPadrao;
      return Utilities.formatDate(d, "America/Sao_Paulo", "dd/MM/yyyy");
    }

    const dataAtual = new Date();
    const carimboData = formatarDataSegura(dados[0], Utilities.formatDate(dataAtual, "America/Sao_Paulo", "dd/MM/yyyy"));

    const nomeSolicitante = dados[1] ? dados[1].toString().trim() : "";
    const cpfSolicitante = dados[2] ? dados[2].toString().trim() : "";
    const endereco = dados[3] ? dados[3].toString().trim() : "";
    const bairro = dados[4] ? dados[4].toString().trim() : "";
    const referencia = dados[5] ? dados[5].toString().trim() : "";
    const telefone1 = dados[6] ? dados[6].toString().trim() : "";
    const telefone2 = dados[7] ? dados[7].toString().trim() : "";
    const obsContato = dados[8] ? dados[8].toString().trim() : "";
    const possuiRL = dados[9] ? dados[9].toString().trim() : "NÃO";
    const nomeRL = dados[10] ? dados[10].toString().trim() : "";
    const cpfRL = dados[11] ? dados[11].toString().trim() : "";
    const grauParentescoRL = dados[12] ? dados[12].toString().trim() : "";
    const telefoneRL = dados[13] ? dados[13].toString().trim() : "";
    const tipoSolicitacao = dados[14] ? dados[14].toString().trim() : "";
    const codigoFamiliar = dados[15] ? dados[15].toString().trim() : "";
    const dataValidade = dados[16] ? formatarDataSegura(dados[16], "") : "";
    const motivoAtualizacao = dados[17] ? dados[17].toString().trim() : "";
    const modalidadeProg = dados[18] ? dados[18].toString().trim() : "";
    const programas = dados[19] ? dados[19].toString().trim() : "";
    const beneficioBloqueado = dados[20] ? dados[20].toString().trim() : "NÃO";
    const justificativaAD = dados[21] ? dados[21].toString().trim() : "";
    const docsAnexados = dados[22] ? dados[22].toString().trim() : "";
    const obsGeral = dados[23] ? dados[23].toString().trim() : "";
    const dataFicha = formatarDataSegura(dados[24], carimboData);
    const servidorResponsavel = dados[25] ? dados[25].toString().trim() : Session.getActiveUser().getEmail();
    const regiao = dados[26] ? dados[26].toString().trim() : "";
    const cep = dados[27] ? dados[27].toString().trim() : "";

    const contatosFormatados = telefone2 ? `${telefone1} / ${telefone2}` : telefone1;
    const dataExtenso = getDataPorExtenso(dataAtual);
    const ehRL = possuiRL.toUpperCase().includes("SIM");

    const dataFormatadaArquivo = dataFicha.replace(/\//g, "-");
    const nomeRUFLimpo = nomeSolicitante.replace(/[\\/?%*:|"<>. ]/g, "_").trim();
    const servidorLimpo = servidorResponsavel.replace(/[\\/?%*:|"<>. ]/g, "_").trim();
    const nomePDF = `${dataFormatadaArquivo} - ${nomeRUFLimpo} - ${servidorLimpo}`;

    const pastaDestino = obterPasta(ID_PASTA_DESTINO, "Termos Gerados PDF");
    const idDocSelecionado = ehRL ? ID_DOCUMENTO_MESTRE_RL : ID_DOCUMENTO_MESTRE;
    const arquivoModelo = obterArquivo(idDocSelecionado, "DOCUMENTO MESTRE");

    // 1. Termo Domiciliar (Google Docs com todas as tags originais)
    const copiaDoc = arquivoModelo.makeCopy(`TEMP_${nomePDF}`, pastaDestino);
    const docAberto = DocumentApp.openById(copiaDoc.getId());
    const corpo = docAberto.getBody();

    corpo.replaceText("\\{\\{NOME_SOLICITANTE\\}\\}", nomeSolicitante);
    corpo.replaceText("\\{\\{CPF_SOLICITANTE\\}\\}", cpfSolicitante);
    corpo.replaceText("\\{\\{ENDERECO\\}\\}", endereco);
    corpo.replaceText("\\{\\{BAIRRO\\}\\}", bairro);
    corpo.replaceText("\\{\\{REGIAO\\}\\}", regiao);
    corpo.replaceText("\\{\\{CEP\\}\\}", cep);
    corpo.replaceText("\\{\\{REFERENCIA\\}\\}", referencia);
    corpo.replaceText("\\{\\{CONTATO\\}\\}", contatosFormatados);
    corpo.replaceText("\\{\\{ENVIA_WHATSAPP\\}\\}", contatosFormatados.toLowerCase().includes("whats") ? "SIM" : "NÃO");
    corpo.replaceText("\\{\\{DATA_SOLICITACAO\\}\\}", dataFicha);
    corpo.replaceText("\\{\\{DATA_EXTENSO\\}\\}", dataExtenso);
    corpo.replaceText("\\{\\{NOME_ENTREVISTADOR\\}\\}", servidorResponsavel);
    corpo.replaceText("\\{\\{OBS_CONTATO\\}\\}", obsContato);
    corpo.replaceText("\\{\\{OBS_GERAL\\}\\}", obsGeral);

    corpo.replaceText("\\{\\{X_RL_SIM\\}\\}", ehRL ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_RL_NAO\\}\\}", !ehRL ? "(X)" : "( )");
    corpo.replaceText("\\{\\{NOME_RL\\}\\}", nomeRL);
    corpo.replaceText("\\{\\{CPF_RL\\}\\}", cpfRL);
    corpo.replaceText("\\{\\{CONTATO_RL\\}\\}", telefoneRL);

    const parentescoLower = grauParentescoRL.toLowerCase();
    corpo.replaceText("\\{\\{X_TUTOR\\}\\}", parentescoLower.includes("tutor") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_CURADOR\\}\\}", parentescoLower.includes("curador") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_PROCURADOR\\}\\}", parentescoLower.includes("procurador") ? "(X)" : "( )");

    const tipoSolLower = tipoSolicitacao.toLowerCase();
    corpo.replaceText("\\{\\{X_INCLUSAO\\}\\}", tipoSolLower.includes("inclusão") || tipoSolLower.includes("inclusao") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_ATUALIZACAO\\}\\}", tipoSolLower.includes("atualização") || tipoSolLower.includes("atualizacao") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{CODIGO_FAMILIAR\\}\\}", codigoFamiliar);
    corpo.replaceText("\\{\\{DATA_VALIDADE\\}\\}", dataValidade);

    const motivoLower = motivoAtualizacao.toLowerCase();
    corpo.replaceText("\\{\\{X_DESATUALIZADO\\}\\}", motivoLower.includes("desatualizado") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_TRANSF_MUNICIPIO\\}\\}", motivoLower.includes("transferência") || motivoLower.includes("transferencia") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_MUDANCA_ENDERECO\\}\\}", motivoLower.includes("mudança") || motivoLower.includes("mudanca") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_ALTERACAO_RENDA\\}\\}", motivoLower.includes("renda") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_OBITO\\}\\}", motivoLower.includes("óbito") || motivoLower.includes("obito") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_SEPARACAO\\}\\}", motivoLower.includes("separação") || motivoLower.includes("separacao") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_EXCLUSAO\\}\\}", motivoLower.includes("exclusão") || motivoLower.includes("exclusao") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_AVERIGUACAO\\}\\}", motivoLower.includes("averiguação") || motivoLower.includes("averiguacao") ? "(X)" : "( )");

    const modalidadeLower = modalidadeProg.toLowerCase();
    const programasLower = programas.toLowerCase();
    corpo.replaceText("\\{\\{X_REQUERER\\}\\}", modalidadeLower.includes("requerer") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_BENEFICIARIA\\}\\}", modalidadeLower.includes("beneficiária") || modalidadeLower.includes("beneficiaria") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_PBF\\}\\}", programasLower.includes("bolsa família") || programasLower.includes("bolsa familia") || programasLower.includes("pbf") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_BPC\\}\\}", programasLower.includes("bpc") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_TSEE\\}\\}", programasLower.includes("tarifa social") || programasLower.includes("tsee") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_OXIGENIO\\}\\}", programasLower.includes("oxigênio") || programasLower.includes("oxigenio") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_CARTEIRA_IDOSO\\}\\}", programasLower.includes("idoso") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_ENEM\\}\\}", programasLower.includes("enem") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_PASSE_LIVRE\\}\\}", programasLower.includes("passe livre") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_BAIXA_RENDA\\}\\}", programasLower.includes("baixa renda") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_MCMV\\}\\}", programasLower.includes("minha casa") || programasLower.includes("mcmv") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_CONCURSOS\\}\\}", programasLower.includes("concursos") ? "(X)" : "( )");

    const progParts = programas.split(',').map(item => item.trim());
    const progPadroes = ["bolsa", "pbf", "bpc", "tarifa social", "tsee", "oxigênio", "oxigenio", "idoso", "enem", "passe livre", "baixa renda", "minha casa", "mcmv", "concursos"];
    const outrosProgList = progParts.filter(item => {
      const itemLower = item.toLowerCase();
      return !progPadroes.some(padrao => itemLower.includes(padrao)) && item !== "";
    });
    const textoOutrosProg = outrosProgList.join(", ");
    corpo.replaceText("\\{\\{X_OUTROS_PROGRAMAS\\}\\}", textoOutrosProg.length > 0 ? "(X)" : "( )");
    corpo.replaceText("\\{\\{OUTROS_PROGRAMAS\\}\\}", textoOutrosProg);

    const ehBloqueado = beneficioBloqueado.toString().toUpperCase().includes("SIM");
    corpo.replaceText("\\{\\{X_BLOQUEADO_SIM\\}\\}", ehBloqueado ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_BLOQUEADO_NAO\\}\\}", !ehBloqueado ? "(X)" : "( )");

    const justifLower = justificativaAD.toLowerCase();
    corpo.replaceText("\\{\\{X_UNIPESSOAL\\}\\}", justifLower.includes("unipessoal") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_PRIORITARIO\\}\\}", justifLower.includes("prioritário") || justifLower.includes("prioritario") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_AVERIGUACAO_JUST\\}\\}", justifLower.includes("averiguação") || justifLower.includes("averiguacao") ? "(X)" : "( )");

    const docsLower = docsAnexados.toLowerCase();

    corpo.replaceText("\\{\\{X_DOC_IDENT\\}\\}", docsLower.includes("ident") || docsLower.includes("rg") || docsLower.includes("cnh") || docsLower.includes("cpf") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_FOLHA_RESUMO\\}\\}", docsLower.includes("resumo") || docsLower.includes("folha") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_TELA_CNIS\\}\\}", docsLower.includes("cnis") ? "(X)" : "( )");
    corpo.replaceText("\\{\\{X_COMP_RESD\\}\\}", docsLower.includes("residência") || docsLower.includes("residencia") ? "(X)" : "( )");

    const docsParts = docsAnexados.split(',').map(item => item.trim());
    const docsPadroes = ["ident", "rg", "cnh", "cpf", "resumo", "folha", "cnis", "residência", "residencia"];
    const outrosDocsList = docsParts.filter(item => {
      const itemLower = item.toLowerCase();
      return !docsPadroes.some(padrao => itemLower.includes(padrao)) && item !== "";
    });
    const textoOutrosDocs = outrosDocsList.join(", ");
    corpo.replaceText("\\{\\{X_OUTROS_DOCS\\}\\}", textoOutrosDocs.length > 0 ? "(X)" : "( )");
    corpo.replaceText("\\{\\{OUTROS_DOCS\\}\\}", textoOutrosDocs);

    corpo.replaceText("\\{\\{X_OPCAO_1\\}\\}", "[ ]");
    corpo.replaceText("\\{\\{X_OPCAO_2\\}\\}", "[ ]");
    corpo.replaceText("\\{\\{NIS_SOLICITANTE\\}\\}", codigoFamiliar);

    const textoObjetivo = motivoAtualizacao || tipoSolicitacao;
    corpo.replaceText("\\{\\{MOTIVO_SOLICITACAO\\}\\}", textoObjetivo);
    corpo.replaceText("\\{\\{OBJETIVO_SOLICITACAO\\}\\}", textoObjetivo);

    destacarSelecionadosEmNegrito(corpo);
    docAberto.saveAndClose();

    const docBlob = copiaDoc.getAs('application/pdf').setName(`${nomePDF}.pdf`);
    const idsAnexosOrdenados = obterIdsAnexosOrdenados(dados, headers);

    try {
      DriveApp.getFileById(copiaDoc.getId()).setTrashed(true);
    } catch (e) {
      Logger.log("Aviso: Falha ao apagar doc temporário - " + e);
    }

    // Dados para o Formulário Verde Oficial
    const dadosFormVerde = {
      nome: nomeSolicitante,
      cpf: cpfSolicitante,
      contato: contatosFormatados,
      codigoFamiliar: codigoFamiliar,
      data: dataFicha,
      servidor: servidorResponsavel,
      ehInclusao: tipoSolLower.includes("inclusão") || tipoSolLower.includes("inclusao")
    };

    // 2. Mesclagem Completa
    let resultadoMerge;
    try {
      resultadoMerge = await mesclarDossieCdPdfLib(docBlob, idsAnexosOrdenados, dadosFormVerde);
    } catch (errMerge) {
      const msg = "ERRO " + Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM HH:mm") + ": " + errMerge;
      Logger.log(msg + " | linha " + linha);
      abaRespostas.getRange(linha, COLUNA_LOG_FORMS).setValue(msg);
      SpreadsheetApp.flush();
      return null;
    }

    const arquivoPDF = pastaDestino.createFile(resultadoMerge.blob);
    const linkPdfFinal = arquivoPDF.getUrl();

    // Tenta atribuir a posse do arquivo para o e-mail do CadÚnico caso configurado
    if (EMAIL_DONO_CADUNICO && EMAIL_DONO_CADUNICO.includes("@")) {
      try {
        arquivoPDF.setOwner(EMAIL_DONO_CADUNICO);
      } catch (errOwner) {
        Logger.log("Aviso setOwner: " + errOwner);
      }
    }

    if (resultadoMerge.falhas.length > 0) {
      abaRespostas.getRange(linha, COLUNA_LOG_FORMS).setValue(
        "ATENÇÃO: " + resultadoMerge.falhas.length + " anexo(s) não entraram: " + resultadoMerge.falhas.join(" | "));
    }

    try {
      arquivoPDF.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}

    abaRespostas.getRange(linha, COLUNA_LINK_PDF_FORMS).setValue(linkPdfFinal);
    gravarLinkNaPlanilhaGeral(cpfSolicitante, nomeSolicitante, linkPdfFinal);
    SpreadsheetApp.flush();

    return linkPdfFinal;

  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// ==========================================
// FUNÇÕES AUXILIARES & PDF-LIB
// ==========================================
function extrairIdArquivoGoogleDrive(url) {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

function gravarLinkNaPlanilhaGeral(cpf, nome, link) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaGeral = ss.getSheetByName("PLANILHA GERAL CD");
    if (!abaGeral) return;

    const ultLinha = abaGeral.getLastRow();
    if (ultLinha < 2) return;

    const dados = abaGeral.getRange(2, 1, ultLinha - 1, COLUNA_LINK_GERAL_CD).getValues();
    const cpfLimpo = String(cpf || "").replace(/\D/g, "");
    const nomeLimpo = String(nome || "").trim().toLowerCase();

    let linhaAlvo = -1;

    for (let i = 0; i < dados.length; i++) {
      const rowNome = String(dados[i][2] || "").trim().toLowerCase();
      const rowCpf = String(dados[i][3] || "").replace(/\D/g, "");

      if (cpfLimpo !== "" && rowCpf === cpfLimpo) {
        linhaAlvo = i + 2;
        if (rowNome === nomeLimpo) break;
      } else if (cpfLimpo === "" && nomeLimpo !== "" && rowNome === nomeLimpo) {
        linhaAlvo = i + 2;
        break;
      }
    }

    if (linhaAlvo !== -1) {
      abaGeral.getRange(linhaAlvo, COLUNA_LINK_GERAL_CD).setValue(link);
    }
  } catch (e) {
    Logger.log("Erro ao gravar link: " + e);
  }
}

function sincronizarTodosLinksParaPlanilhaGeral() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaResp = ss.getSheetByName("forms");
  const abaGeral = ss.getSheetByName("PLANILHA GERAL CD");

  if (!abaResp || !abaGeral) return;

  const ultResp = abaResp.getLastRow();
  const mapaLinksPorCpf = {};
  const mapaLinksPorNome = {};

  if (ultResp >= 2) {
    const dadosResp = abaResp.getRange(2, 1, ultResp - 1, COLUNA_LINK_PDF_FORMS).getValues();
    for (let i = 0; i < dadosResp.length; i++) {
      const nome = String(dadosResp[i][1] || "").trim().toLowerCase();
      const cpf = String(dadosResp[i][2] || "").replace(/\D/g, "");
      const link = String(dadosResp[i][COLUNA_LINK_PDF_FORMS - 1] || "").trim();

      if (link && link.startsWith("http")) {
        if (cpf) mapaLinksPorCpf[cpf] = link;
        if (nome) mapaLinksPorNome[nome] = link;
      }
    }
  }

  const ultGeral = abaGeral.getLastRow();
  if (ultGeral < 2) return;

  const dadosGeral = abaGeral.getRange(2, 1, ultGeral - 1, COLUNA_LINK_GERAL_CD).getValues();
  const colunaRNovosValores = [];
  let totalAtualizados = 0;

  for (let j = 0; j < dadosGeral.length; j++) {
    const nome = String(dadosGeral[j][2] || "").trim().toLowerCase();
    const cpf = String(dadosGeral[j][3] || "").replace(/\D/g, "");
    const linkAtual = String(dadosGeral[j][COLUNA_LINK_GERAL_CD - 1] || "").trim();

    let linkFinal = linkAtual;
    if (cpf && mapaLinksPorCpf[cpf]) {
      linkFinal = mapaLinksPorCpf[cpf];
    } else if (nome && mapaLinksPorNome[nome]) {
      linkFinal = mapaLinksPorNome[nome];
    }

    if (linkFinal && linkFinal !== linkAtual) {
      totalAtualizados++;
    }
    colunaRNovosValores.push([linkFinal]);
  }

  abaGeral.getRange(2, COLUNA_LINK_GERAL_CD, colunaRNovosValores.length, 1).setValues(colunaRNovosValores);
  SpreadsheetApp.getUi().alert("✅ " + totalAtualizados + " link(s) sincronizado(s) na Coluna R!");
}

function obterIdsAnexosOrdenados(rowValues, headers) {
  const listaIds = [];
  const idSet = {};

  for (let o = 0; o < ORDEM_ANEXOS.length; o++) {
    const itemOrdem = ORDEM_ANEXOS[o];
    const kw = itemOrdem.kw.toLowerCase();

    for (let c = 0; c < headers.length; c++) {
      const h = (headers[c] || "").toString().toLowerCase().trim();
      const val = (rowValues[c] || "").toString().trim();
      if (!val) continue;

      if (h.includes(kw)) {
        const matches = val.match(/[-\w]{25,}/g);
        if (matches) {
          for (let m = 0; m < matches.length; m++) {
            const id = matches[m];
            if (!idSet[id]) {
              idSet[id] = true;
              listaIds.push(id);
            }
          }
        }
      }
    }
  }

  return listaIds;
}

function carregarPdfLib_(pastaCache) {
  if (typeof PDFLib !== "undefined") return;

  let jsCode = null;
  const arqs = pastaCache.getFilesByName(NOME_CACHE_PDFLIB);
  if (arqs.hasNext()) {
    jsCode = arqs.next().getBlob().getDataAsString();
    if (!jsCode || jsCode.length < 100000) jsCode = null;
  }

  if (!jsCode) {
    const urls = [
      "https://cdn.jsdelivr.net/npm/pdf-lib@" + VERSAO_PDFLIB + "/dist/pdf-lib.min.js",
      "https://unpkg.com/pdf-lib@" + VERSAO_PDFLIB + "/dist/pdf-lib.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/" + VERSAO_PDFLIB + "/pdf-lib.min.js"
    ];
    const erros = [];
    for (let t = 0; t < 2 && !jsCode; t++) {
      for (let u = 0; u < urls.length && !jsCode; u++) {
        try {
          const r = UrlFetchApp.fetch(urls[u], { muteHttpExceptions: true });
          if (r.getResponseCode() === 200 && r.getContentText().length > 100000) jsCode = r.getContentText();
          else erros.push(urls[u] + " -> HTTP " + r.getResponseCode());
        } catch (e) { erros.push(urls[u] + " -> " + e); }
      }
      if (!jsCode) Utilities.sleep(2000);
    }
    if (!jsCode) throw new Error("Não consegui baixar a biblioteca pdf-lib. " + erros.join(" ; "));
    try { pastaCache.createFile(NOME_CACHE_PDFLIB, jsCode, MimeType.PLAIN_TEXT); } catch (e) {}
  }

  eval(jsCode.replace(/setTimeout\(\(function\(\)\{return t\(\)\}\),0\)/g, "t()"));
  if (typeof PDFLib === "undefined") throw new Error("pdf-lib carregou mas PDFLib não foi definido.");
}

async function mesclarDossieCdPdfLib(docBlob, fileIds, dadosFormVerde) {
  const pastaCache = obterPasta(ID_PASTA_DESTINO, "Termos Gerados PDF");
  carregarPdfLib_(pastaCache);

  const falhas = [];
  const mergedDoc = await PDFLib.PDFDocument.create();
  const docBytes = new Uint8Array(docBlob.getBytes());
  const docPrincipal = await PDFLib.PDFDocument.load(docBytes, { ignoreEncryption: true });
  const totalPagsModelo = docPrincipal.getPageCount();

  // 1. PÁGINA 1: FORMULÁRIO VERDE F1 OFICIAL DO GOVERNO FEDERAL (PRIMEIRA PÁGINA)
  try {
    const arquivoVerdeOficial = DriveApp.getFileById(ID_PDF_FORMULARIO_VERDE);
    const bytesVerdeOficial = new Uint8Array(arquivoVerdeOficial.getBlob().getBytes());
    const docVerdeOficial = await PDFLib.PDFDocument.load(bytesVerdeOficial, { ignoreEncryption: true });
    
    // Renderiza a página oficial na horizontal A4
    const [paginaF1Embutida] = await mergedDoc.embedPdf(docVerdeOficial, [0]);
    const paginaVerde = mergedDoc.addPage([841.89, 595.28]); // A4 Paisagem
    paginaVerde.drawPage(paginaF1Embutida, {
      x: 0,
      y: 595.28,
      rotate: PDFLib.degrees(270)
    });

    const fonteBold = await mergedDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const fonteNorm = await mergedDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const corTexto = PDFLib.rgb(0, 0, 0);

    if (dadosFormVerde) {
      // 1. Recibo Superior
      paginaVerde.drawText(dadosFormVerde.nome || "", { x: 250.0, y: 540.0, size: 9.5, font: fonteBold, color: corTexto });
      const locTexto = "MARÍLIA";
      const locW = fonteBold.widthOfTextAtSize(locTexto, 9.5);
      paginaVerde.drawText(locTexto, { x: 346.5 - (locW / 2), y: 504.5, size: 9.5, font: fonteBold, color: corTexto });
      // Data no recibo: OMITIDA conforme solicitado

      // 2. Dados do Titular (dentro dos campos e caixas do formulário verde)
      // Nome da Pessoa Cadastrada (passo calibrado em 11.33 pt para centralizar cada letra e sobrenome)
      if (dadosFormVerde.nome) {
        const nomeUpper = String(dadosFormVerde.nome).trim().toUpperCase();
        for (let i = 0; i < nomeUpper.length; i++) {
          const char = nomeUpper[i];
          if (char === " ") continue;
          if (i < 32) {
            // Linha 1 de quadradinhos
            const charW = fonteBold.widthOfTextAtSize(char, 8.5);
            paginaVerde.drawText(char, {
              x: 196.3 + (i * 11.33) - (charW / 2),
              y: 310.5,
              size: 8.5,
              font: fonteBold,
              color: corTexto
            });
          } else if (i < 54) {
            // Linha 2 de quadradinhos (para nomes longos)
            const charW = fonteBold.widthOfTextAtSize(char, 8.5);
            paginaVerde.drawText(char, {
              x: 196.3 + ((i - 32) * 11.33) - (charW / 2),
              y: 289.5,
              size: 8.5,
              font: fonteBold,
              color: corTexto
            });
          }
        }
      }

      // CPF (centralizado dígito por dígito nos quadradinhos: 9 dígitos + 2 verificadores)
      if (dadosFormVerde.cpf) {
        const cpfLimpo = String(dadosFormVerde.cpf).replace(/\D/g, "");
        for (let i = 0; i < Math.min(9, cpfLimpo.length); i++) {
          const dig = cpfLimpo[i];
          const digW = fonteBold.widthOfTextAtSize(dig, 8.5);
          paginaVerde.drawText(dig, {
            x: 246.25 + (i * 11.35) - (digW / 2),
            y: 264.0,
            size: 8.5,
            font: fonteBold,
            color: corTexto
          });
        }
        for (let i = 9; i < Math.min(11, cpfLimpo.length); i++) {
          const dig = cpfLimpo[i];
          const digW = fonteBold.widthOfTextAtSize(dig, 8.5);
          paginaVerde.drawText(dig, {
            x: 359.5 + ((i - 9) * 11.5) - (digW / 2),
            y: 264.0,
            size: 8.5,
            font: fonteBold,
            color: corTexto
          });
        }
      }

      // Nome do Município (MARILIA em negrito, assentado rente ao fundo das caixas)
      const nomeMun = "MARILIA";
      for (let i = 0; i < nomeMun.length; i++) {
        const char = nomeMun[i];
        const charW = fonteBold.widthOfTextAtSize(char, 8.5);
        paginaVerde.drawText(char, {
          x: 298.3 + (i * 11.33) - (charW / 2),
          y: 185.0,
          size: 8.5,
          font: fonteBold,
          color: corTexto
        });
      }

      // 3. Painéis Inferiores
      // Código Familiar (centralizado e assentado na base das 11 caixinhas)
      if (dadosFormVerde.codigoFamiliar) {
        const codLimpo = String(dadosFormVerde.codigoFamiliar).replace(/\D/g, "");
        for (let i = 0; i < Math.min(11, codLimpo.length); i++) {
          const dig = codLimpo[i];
          const digW = fonteBold.widthOfTextAtSize(dig, 8.5);
          paginaVerde.drawText(dig, {
            x: 165.35 + (i * 11.30) - (digW / 2),
            y: 136.5,
            size: 8.5,
            font: fonteBold,
            color: corTexto
          });
        }
      }

      // Data da Entrevista: OMITIDA conforme solicitado
      // Entrevistador: OMITIDO conforme solicitado

      // Telefone do órgão responsável: (14) 3434-1840 em negrito e perfeitamente centralizado na caixa branca
      const telTexto = "(14) 3434-1840";
      const telW = fonteBold.widthOfTextAtSize(telTexto, 10.5);
      paginaVerde.drawText(telTexto, {
        x: 357.6 - (telW / 2),
        y: 85.3,
        size: 10.5,
        font: fonteBold,
        color: corTexto
      });

      // Modalidade: Inclusão ou Alteração (quadradinho de marcação perfeitamente centralizado vertical e horizontalmente)
      const yCheck = dadosFormVerde.ehInclusao ? 93.8 : 80.0;
      const xCheckW = fonteBold.widthOfTextAtSize("X", 8.5);
      paginaVerde.drawText("X", {
        x: 163.67 - (xCheckW / 2),
        y: yCheck,
        size: 8.5,
        font: fonteBold,
        color: corTexto
      });
    }
  } catch (errVerde) {
    falhas.push("Formulário Verde F1 Oficial (" + errVerde + ")");
  }

  // 2. TERMO DE ATENDIMENTO DOMICILIAR (PÁGINA 1 DO DOCUMENTO MESTRE)
  if (totalPagsModelo >= 1) {
    const p1 = await mergedDoc.copyPages(docPrincipal, [0]);
    p1.forEach(p => mergedDoc.addPage(p));
  }

  // 3. ANEXOS DO ATENDIMENTO DOMICILIAR
  for (let i = 0; i < fileIds.length; i++) {
    const fId = fileIds[i];
    let nomeArq = fId;
    try {
      const file = DriveApp.getFileById(fId);
      const blob = file.getBlob();
      const mime = (file.getMimeType() || "").toLowerCase();
      nomeArq = file.getName() || fId;
      const name = nomeArq.toLowerCase();
      const fileBytes = new Uint8Array(blob.getBytes());

      if (mime.includes("pdf") || name.endsWith(".pdf")) {
        const donorDoc = await PDFLib.PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const donorPages = await mergedDoc.copyPages(donorDoc, donorDoc.getPageIndices());
        donorPages.forEach(p => mergedDoc.addPage(p));
      } else if (mime.includes("png") || name.endsWith(".png")) {
        const imgPng = await mergedDoc.embedPng(fileBytes);
        const pagePng = mergedDoc.addPage([imgPng.width, imgPng.height]);
        pagePng.drawImage(imgPng, { x: 0, y: 0, width: imgPng.width, height: imgPng.height });
      } else if (mime.includes("jpeg") || mime.includes("jpg") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
        const imgJpg = await mergedDoc.embedJpg(fileBytes);
        const pageJpg = mergedDoc.addPage([imgJpg.width, imgJpg.height]);
        pageJpg.drawImage(imgJpg, { x: 0, y: 0, width: imgJpg.width, height: imgJpg.height });
      } else {
        falhas.push(nomeArq + " (formato não suportado: " + mime + ")");
      }
    } catch (errAnexo) {
      falhas.push(nomeArq + " (" + errAnexo + ")");
    }
  }

  if (fileIds.length > 0 && falhas.length === fileIds.length) {
    throw new Error("Nenhum dos " + fileIds.length + " anexo(s) pôde ser lido: " + falhas.join(" | "));
  }

  // 4. PÁGINAS FINAIS DO TERMO DOMICILIAR
  if (totalPagsModelo >= 3) {
    const pResid = await mergedDoc.copyPages(docPrincipal, [2]);
    pResid.forEach(p => mergedDoc.addPage(p));
  }

  if (totalPagsModelo >= 2) {
    const pResp = await mergedDoc.copyPages(docPrincipal, [1]);
    pResp.forEach(p => mergedDoc.addPage(p));
  }

  const bytesFinais = await mergedDoc.save();
  const blobFinal = Utilities.newBlob([...new Int8Array(bytesFinais)], "application/pdf", docBlob.getName());

  return { blob: blobFinal, pageCount: mergedDoc.getPageCount(), falhas: falhas };
}

function destacarSelecionadosEmNegrito(corpo) {
  let searchResult = corpo.findText("\\(X\\)");
  while (searchResult !== null) {
    const element = searchResult.getElement();
    const text = element.asText();
    const startIndex = searchResult.getStartOffset();
    const fullString = text.getText();

    let endIndex = fullString.indexOf(";", startIndex);
    if (endIndex === -1) endIndex = fullString.indexOf(".", startIndex);
    if (endIndex === -1) endIndex = fullString.length - 1;

    if (endIndex >= startIndex) {
      text.setBold(startIndex, endIndex, true);
    }
    searchResult = corpo.findText("\\(X\\)", searchResult);
  }
}

function obterArquivo(id, nome) {
  try {
    return DriveApp.getFileById(id);
  } catch (e) {
    const arquivos = DriveApp.getFilesByName(nome);
    if (arquivos.hasNext()) return arquivos.next();
    throw new Error(`Arquivo "${nome}" não encontrado.`);
  }
}

function obterPasta(id, nome) {
  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    const pastas = DriveApp.getFoldersByName(nome);
    if (pastas.hasNext()) return pastas.next();
    throw new Error(`Pasta "${nome}" não encontrada.`);
  }
}

function getDataPorExtenso(data) {
  const fuso = "America/Sao_Paulo";
  const dia = parseInt(Utilities.formatDate(data, fuso, "dd"), 10);
  const mesIndex = parseInt(Utilities.formatDate(data, fuso, "MM"), 10) - 1;
  const ano = Utilities.formatDate(data, fuso, "yyyy");
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${dia} de ${meses[mesIndex]} de ${ano}`;
}
