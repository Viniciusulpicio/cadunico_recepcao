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
var PROP_ACTIVE_SHEET_ID = "ACTIVE_SHEET_ID";

/**
 * Gatilho automático ao editar a planilha na recepção (caso o script esteja dentro da própria planilha)
 */
function onEdit(e) {
  if (!e || !e.source) return;
  var sheet = e.source.getActiveSheet();

  if (sheet.getName() !== SHEET_NAME) return;

  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();

  if (row >= 4 && col > 2) {
    var dateCell = sheet.getRange(row, 1);
    var timeCell = sheet.getRange(row, 2);

    if (dateCell.getValue() === "") {
      var now = new Date();
      var dataBrasil = Utilities.formatDate(now, FUSO_HORARIO, "dd/MM/yyyy");
      var horaBrasil = Utilities.formatDate(now, FUSO_HORARIO, "HH:mm:ss");

      dateCell.setValue(dataBrasil);
      timeCell.setValue(horaBrasil);
    }

    garantirCabecalhosControle_(sheet);

    var resolucaoVal = String(sheet.getRange(row, 7).getDisplayValue() || "").trim();
    var statusCell = sheet.getRange(row, 11);
    var statusAtual = String(statusCell.getValue() || "").trim();

    if (ehEncaminhadoSetor_(resolucaoVal) && statusAtual === "") {
      statusCell.setValue("AGUARDANDO");
    }
  }
}

/**
 * Obtém a planilha ativa (permite trocar de planilha todo mês remotamente pelo ID/link
 * sem precisar reimplantar o Apps Script nem mexer nos computadores do CRAS)
 */
function obterPlanilha_(params) {
  var idParam = extrairSheetId_((params && (params.sheetId || params.sheetUrl)) || "");
  var idSalvo = PropertiesService.getScriptProperties().getProperty(PROP_ACTIVE_SHEET_ID) || "";
  var targetId = idParam || idSalvo;

  if (targetId) {
    return SpreadsheetApp.openById(targetId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function extrairSheetId_(valor) {
  var str = String(valor || "").trim();
  if (!str) return "";
  var match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(str)) return str;
  return "";
}

/**
 * Endpoint HTTP GET - Retorna a fila de aguardando e o atendimento ativo
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || "listar";

  if (action !== "listar") {
    return executarAcao_(params);
  }

  var ss;
  try {
    ss = obterPlanilha_(params);
  } catch (err) {
    return respostaJson_({ ok: false, erro: "Não foi possível abrir a planilha configurada. Verifique o link/permissão." });
  }

  if (!ss) {
    return respostaJson_({ ok: false, erro: "Nenhuma planilha vinculada. Configure o link da planilha no painel #admin." });
  }

  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (!sheet) {
    return respostaJson_({ ok: false, erro: "Aba '" + SHEET_NAME + "' não encontrada." });
  }

  var hoje = dataHojeBrasil_();
  var agora = horaAgoraBrasil_();
  var lastRow = sheet.getLastRow();

  if (lastRow < 4) {
    return respostaJson_({
      ok: true,
      fila: [],
      emAtendimento: [],
      hoje: hoje,
      atualizadoEm: agora,
      planilhaNome: ss.getName(),
      planilhaId: ss.getId()
    });
  }

  var numRows = lastRow - 3;
  var valores = sheet.getRange(4, 1, numRows, 14).getDisplayValues();
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

    if (!nome && !cpf) continue;

    // Preenche Data e Hora automaticamente mesmo se a planilha do mês novo não tiver onEdit
    if (data === "") {
      data = hoje;
      hora = hora || agora;
      try {
        sheet.getRange(rowNumber, 1, 1, 2).setValues([[data, hora]]);
      } catch (ignore) {}
    }

    if (!ehEncaminhadoSetor_(resolucao)) continue;

    if (somenteHoje && data !== "" && !mesmaData_(data, hoje)) continue;

    if (statusFila === "") {
      statusFila = "AGUARDANDO";
      try {
        garantirCabecalhosControle_(sheet);
        sheet.getRange(rowNumber, 11).setValue("AGUARDANDO");
      } catch (ignore) {}
    }

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
      status: statusFila,
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
    atualizadoEm: agora,
    planilhaNome: ss.getName(),
    planilhaId: ss.getId(),
    fila: fila,
    emAtendimento: emAtendimento
  });
}

/**
 * Endpoint HTTP POST
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
 * Executa ações com LockService
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

    // Ação remota para o administrador trocar a planilha do mês sem tocar nos PCs do CRAS
    if (action === "definirPlanilha") {
      var novoId = extrairSheetId_(payload.sheetUrl || payload.sheetId || "");
      if (!novoId) {
        return respostaJson_({ ok: false, erro: "Link ou ID da planilha inválido." });
      }
      try {
        var novaSs = SpreadsheetApp.openById(novoId);
        var aba = novaSs.getSheetByName(SHEET_NAME) || novaSs.getSheets()[0];
        if (aba) garantirCabecalhosControle_(aba);
        PropertiesService.getScriptProperties().setProperty(PROP_ACTIVE_SHEET_ID, novoId);
        return respostaJson_({
          ok: true,
          planilhaId: novoId,
          planilhaNome: novaSs.getName()
        });
      } catch (errOpen) {
        return respostaJson_({
          ok: false,
          erro: "Não foi possível abrir essa planilha. Verifique se sua conta tem permissão de edição nela."
        });
      }
    }

    var row = parseInt(payload.row, 10);
    var entrevistador = String(payload.entrevistador || "Entrevistador").trim();

    if (!row || row < 4) {
      return respostaJson_({ ok: false, erro: "Linha inválida." });
    }

    var ss = obterPlanilha_(payload);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    if (!sheet) {
      return respostaJson_({ ok: false, erro: "Aba não encontrada." });
    }

    garantirCabecalhosControle_(sheet);

    var statusCell = sheet.getRange(row, 11);
    var entrevistadorCell = sheet.getRange(row, 12);
    var horaAceiteCell = sheet.getRange(row, 13);
    var horaFimCell = sheet.getRange(row, 14);

    var statusAtual = String(statusCell.getDisplayValue() || "").trim().toUpperCase();
    var donoAtual = String(entrevistadorCell.getDisplayValue() || "").trim();
    var agora = horaAgoraBrasil_();

    if (action === "aceitar") {
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
