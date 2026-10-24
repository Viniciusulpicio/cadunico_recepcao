/**
 * SISTEMA DE RECEPÇÃO E FILA INTERNA - CADASTRO ÚNICO
 * Aba principal: "RECEPÇÃO MENSAL"
 *
 * Colunas originais da planilha:
 * A (1): Data
 * B (2): Hora
 * C (3): Nome do RUF
 * D (4): CPF
 * E (5): Tipo de Atendimento
 * F (6): Local
 * G (7): Resolução do Atendimento
 * H (8): Observações
 * I (9): Classificação do Atendimento (Geral / Prioritário)
 * J (10): Tipo de Prioridade
 *
 * Colunas de controle automático do painel (criadas/usadas pelo script):
 * K (11): Status Fila (AGUARDANDO | EM_ATENDIMENTO | FINALIZADO)
 * L (12): Entrevistador Responsável
 * M (13): Hora Aceite (Início do Atendimento)
 * N (14): Hora Finalização (Fim do Atendimento)
 */

var SHEET_NAME = "RECEPÇÃO MENSAL";
var FUSO_HORARIO = "America/Sao_Paulo";
var RESOLUCAO_SETOR = "Encaminhado para o atendimento interno (setor)";

/**
 * Gatilho automático ao editar a planilha na recepção
 */
function onEdit(e) {
  if (!e || !e.source) return;
  var sheet = e.source.getActiveSheet();

  // Verifica se a edição foi na aba "RECEPÇÃO MENSAL"
  if (sheet.getName() !== SHEET_NAME) return;

  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();

  // Verifica se a edição foi a partir da linha 4 e depois da coluna B
  if (row >= 4 && col > 2) {
    var dateCell = sheet.getRange(row, 1); // Coluna A (Data)
    var timeCell = sheet.getRange(row, 2); // Coluna B (Hora)

    // Se a célula de Data estiver vazia, preenche com a data e hora do Brasil
    if (dateCell.getValue() === "") {
      var now = new Date();
      var dataBrasil = Utilities.formatDate(now, FUSO_HORARIO, "dd/MM/yyyy");
      var horaBrasil = Utilities.formatDate(now, FUSO_HORARIO, "HH:mm:ss");

      dateCell.setValue(dataBrasil);
      timeCell.setValue(horaBrasil);
    }

    // Garante cabeçalhos de controle na linha 3 se ainda não existirem
    garantirCabecalhosControle_(sheet);

    // Se a coluna G (Resolução = col 7) foi preenchida como encaminhado ao setor
    // e a coluna K (Status = col 11) está vazia, define como AGUARDANDO
    var resolucaoVal = String(sheet.getRange(row, 7).getDisplayValue() || "").trim();
    var statusCell = sheet.getRange(row, 11);
    var statusAtual = String(statusCell.getValue() || "").trim();

    if (ehEncaminhadoSetor_(resolucaoVal) && statusAtual === "") {
      statusCell.setValue("AGUARDANDO");
    }
  }
}

/**
 * Endpoint HTTP GET - Retorna a fila de aguardando (e o atendimento ativo do entrevistador, se houver)
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || "listar";

  if (action !== "listar") {
    return executarAcao_(params);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return respostaJson_({ ok: false, erro: "Aba '" + SHEET_NAME + "' não encontrada." });
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    return respostaJson_({ ok: true, fila: [], emAtendimento: [], hoje: dataHojeBrasil_() });
  }

  var numRows = lastRow - 3;
  var valores = sheet.getRange(4, 1, numRows, 14).getDisplayValues();
  var hoje = dataHojeBrasil_();
  var somenteHoje = params.todosOsDias !== "1";

  var fila = [];
  var emAtendimento = [];

  for (var i = 0; i < valores.length; i++) {
    var r = valores[i];
    var rowNumber = i + 4;

    var data = String(r[0] || "").trim();
    var hora = String(r[1] || "").trim();
    var nome = String(r[2] || "").trim();
    var cpf = String(r[3] || "").trim();
    var tipoAtendimento = String(r[4] || "").trim();
    var local = String(r[5] || "").trim();
    var resolucao = String(r[6] || "").trim();
    var observacoes = String(r[7] || "").trim();
    var classificacao = String(r[8] || "").trim();
    var tipoPrioridade = String(r[9] || "").trim();
    var statusFila = String(r[10] || "").trim().toUpperCase();
    var entrevistador = String(r[11] || "").trim();
    var horaAceite = String(r[12] || "").trim();

    // Ignora linhas sem nome e sem CPF
    if (!nome && !cpf) continue;

    // Filtra apenas quem foi "Encaminhado para o atendimento interno (setor)"
    if (!ehEncaminhadoSetor_(resolucao)) continue;

    // Se filtro de hoje estiver ativo, mostra linhas de hoje (ou sem data caso recém digitado)
    if (somenteHoje && data !== "" && !mesmaData_(data, hoje)) continue;

    var item = {
      row: rowNumber,
      data: data || hoje,
      hora: hora,
      nome: nome || "Sem nome informado",
      cpf: cpf || "Não informado",
      tipoAtendimento: tipoAtendimento || "Não informado",
      local: local,
      resolucao: resolucao,
      observacoes: observacoes,
      classificacao: classificacao || "Geral",
      tipoPrioridade: tipoPrioridade,
      prioritario: ehPrioritario_(classificacao, tipoPrioridade),
      status: statusFila || "AGUARDANDO",
      entrevistador: entrevistador,
      horaAceite: horaAceite
    };

    if (item.status === "AGUARDANDO") {
      fila.push(item);
    } else if (item.status === "EM_ATENDIMENTO") {
      emAtendimento.push(item);
    }
  }

  return respostaJson_({
    ok: true,
    hoje: hoje,
    atualizadoEm: horaAgoraBrasil_(),
    fila: fila,
    emAtendimento: emAtendimento
  });
}

/**
 * Endpoint HTTP POST - Aceitar atendimento, finalizar atendimento ou devolver à fila
 */
function doPost(e) {
  var payload = {};
  try {
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
  } catch (err) {
    return respostaJson_({ ok: false, erro: "Formato de dados inválido." });
  }

  return executarAcao_(payload);
}

/**
 * Executa transição de status com LockService para impedir que 2 entrevistadores
 * aceitem a mesma pessoa ao mesmo tempo.
 */
function executarAcao_(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return respostaJson_({ ok: false, erro: "Servidor ocupado. Tente novamente em 2 segundos." });
  }

  try {
    var action = String(payload.action || "").trim();
    var row = parseInt(payload.row, 10);
    var entrevistador = String(payload.entrevistador || "Entrevistador").trim();

    if (!row || row < 4) {
      return respostaJson_({ ok: false, erro: "Linha inválida." });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return respostaJson_({ ok: false, erro: "Aba não encontrada." });
    }

    garantirCabecalhosControle_(sheet);

    var statusCell = sheet.getRange(row, 11); // Col K
    var entrevistadorCell = sheet.getRange(row, 12); // Col L
    var horaAceiteCell = sheet.getRange(row, 13); // Col M
    var horaFimCell = sheet.getRange(row, 14); // Col N

    var statusAtual = String(statusCell.getDisplayValue() || "").trim().toUpperCase();
    var donoAtual = String(entrevistadorCell.getDisplayValue() || "").trim();
    var agora = horaAgoraBrasil_();

    if (action === "aceitar") {
      // Se já foi aceito por outro entrevistador, bloqueia
      if (statusAtual === "EM_ATENDIMENTO" && donoAtual.toLowerCase() !== entrevistador.toLowerCase()) {
        return respostaJson_({
          ok: false,
          codigo: "JA_ACEITO",
          erro: "Este cidadão já foi aceito por " + (donoAtual || "outro entrevistador") + "."
        });
      }
      if (statusAtual === "FINALIZADO") {
        return respostaJson_({
          ok: false,
          codigo: "JA_FINALIZADO",
          erro: "Este atendimento já foi finalizado."
        });
      }

      statusCell.setValue("EM_ATENDIMENTO");
      entrevistadorCell.setValue(entrevistador);
      horaAceiteCell.setValue(agora);
      SpreadsheetApp.flush();

      return respostaJson_({
        ok: true,
        status: "EM_ATENDIMENTO",
        row: row,
        entrevistador: entrevistador,
        horaAceite: agora
      });
    }

    if (action === "finalizar") {
      statusCell.setValue("FINALIZADO");
      if (!donoAtual && entrevistador) {
        entrevistadorCell.setValue(entrevistador);
      }
      horaFimCell.setValue(agora);
      SpreadsheetApp.flush();

      return respostaJson_({
        ok: true,
        status: "FINALIZADO",
        row: row,
        horaFim: agora
      });
    }

    if (action === "devolver") {
      statusCell.setValue("AGUARDANDO");
      entrevistadorCell.setValue("");
      horaAceiteCell.setValue("");
      SpreadsheetApp.flush();

      return respostaJson_({
        ok: true,
        status: "AGUARDANDO",
        row: row
      });
    }

    return respostaJson_({ ok: false, erro: "Ação desconhecida: " + action });
  } finally {
    lock.releaseLock();
  }
}

function ehEncaminhadoSetor_(valor) {
  if (!valor) return false;
  var limpo = valor.toLowerCase().trim();
  return limpo.indexOf("encaminhado para o atendimento interno") !== -1;
}

function ehPrioritario_(classificacao, tipoPrioridade) {
  var c = String(classificacao || "").toLowerCase();
  var t = String(tipoPrioridade || "").trim();
  return c.indexOf("priorit") !== -1 || t !== "";
}

function garantirCabecalhosControle_(sheet) {
  var k3 = String(sheet.getRange(3, 11).getValue() || "").trim();
  if (!k3) {
    sheet.getRange(3, 11, 1, 4).setValues([[
      "Status Setor",
      "Entrevistador",
      "Hora Chamada",
      "Hora Finalização"
    ]]);
  }
}

function dataHojeBrasil_() {
  return Utilities.formatDate(new Date(), FUSO_HORARIO, "dd/MM/yyyy");
}

function mesmaData_(a, b) {
  var norm = function(s) {
    var partes = String(s || "").trim().split(/[\/\-]/);
    if (partes.length !== 3) return String(s || "").trim();
    var d = ("0" + parseInt(partes[0], 10)).slice(-2);
    var m = ("0" + parseInt(partes[1], 10)).slice(-2);
    var y = partes[2].length === 2 ? "20" + partes[2] : partes[2];
    return d + "/" + m + "/" + y;
  };
  return norm(a) === norm(b);
}

function horaAgoraBrasil_() {
  return Utilities.formatDate(new Date(), FUSO_HORARIO, "HH:mm:ss");
}

function respostaJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
