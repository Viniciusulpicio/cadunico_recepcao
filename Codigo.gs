/**
 * SISTEMA DE RECEPÇÃO E FILA INTERNA - CADASTRO ÚNICO
 * MÓDULO DE CONFORMIDADE LGPD (Lei nº 13.709/2018), Decreto nº 11.016/2022,
 * Portaria MC nº 810/2022 e Portaria MDS nº 502/2017.
 *
 * Aba principal: "RECEPÇÃO MENSAL"
 * Aba de auditoria de acessos: "AUDITORIA_LGPD"
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
 * Colunas de controle automático do painel:
 * K (11): Status Fila (AGUARDANDO | EM_ATENDIMENTO | FINALIZADO)
 * L (12): Entrevistador Responsável
 * M (13): Hora Aceite (Início do Atendimento)
 * N (14): Hora Finalização (Fim do Atendimento)
 */

var SHEET_NAME = "RECEPÇÃO MENSAL";
var SHEET_AUDITORIA = "AUDITORIA_LGPD";
var FUSO_HORARIO = "America/Sao_Paulo";
var RESOLUCAO_SETOR = "Encaminhado para o atendimento interno (setor)";
var CHAVE_PADRAO_POSTO = "CADUNICO_SEC_2026"; // Chave configurável via Propriedades do Script (ScriptProperties)

/**
 * Retorna a chave de acesso do posto armazenada com segurança
 */
function obterChaveSeguranca_() {
  var props = PropertiesService.getScriptProperties();
  var chave = props.getProperty("CHAVE_ACESSO_POSTO");
  if (!chave) {
    chave = CHAVE_PADRAO_POSTO;
    props.setProperty("CHAVE_ACESSO_POSTO", chave);
  }
  return chave;
}

/**
 * Valida autorização de acesso conforme Art. 46 da LGPD e Portaria 502/2017
 */
function validarAcesso_(params) {
  if (!params) return false;
  var token = String(params.token || params.chave || "").trim();
  var chaveValida = obterChaveSeguranca_();
  return token === chaveValida;
}

/**
 * Mascara o CPF para visualização na fila (Data Masking - LGPD Art. 6º, III)
 * Exemplo: 123.456.789-00 -> 123.***.***-00
 */
function mascararCpfServidor_(cpf) {
  if (!cpf) return "Não informado";
  var s = String(cpf).trim();
  var digitos = s.replace(/\D/g, "");
  if (digitos.length >= 8 && digitos.length <= 11) {
    var pad = digitos;
    while (pad.length < 11) pad = "0" + pad;
    return pad.slice(0, 3) + ".***.***-" + pad.slice(9);
  }
  return s.length > 5 ? s.slice(0, 3) + "***" + s.slice(-2) : "***";
}

/**
 * Trilha de auditoria obrigatória para proteção e rastreabilidade (LGPD Art. 6º, X e Portaria 502/2017)
 */
function registrarAuditoria_(acao, operador, matricula, row, nomeCidadao, cpfCidadao, detalhes) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetAuditoria = ss.getSheetByName(SHEET_AUDITORIA);
    if (!sheetAuditoria) {
      sheetAuditoria = ss.insertSheet(SHEET_AUDITORIA);
      sheetAuditoria.getRange(1, 1, 1, 7).setValues([[
        "Timestamp",
        "Ação",
        "Operador / Entrevistador",
        "Matrícula",
        "Linha Atendimento",
        "Cidadão (CPF Mascarado)",
        "Detalhes / Justificativa"
      ]]);
      sheetAuditoria.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#F1F5F9");
      sheetAuditoria.setFrozenRows(1);
    }

    var timestamp = Utilities.formatDate(new Date(), FUSO_HORARIO, "dd/MM/yyyy HH:mm:ss");
    var cpfMask = mascararCpfServidor_(cpfCidadao);
    var cidadaoRef = nomeCidadao ? (nomeCidadao + " (" + cpfMask + ")") : ("Linha " + row);

    sheetAuditoria.appendRow([
      timestamp,
      acao,
      operador || "Não identificado",
      matricula || "Não informada",
      row || "-",
      cidadaoRef,
      detalhes || ""
    ]);
  } catch (e) {
    console.error("Falha ao registrar auditoria LGPD: " + e.message);
  }
}

/**
 * Gatilho automático ao editar a planilha na recepção
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
 * Endpoint HTTP GET
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // Validação de segurança obrigatória
  if (!validarAcesso_(params)) {
    return respostaJson_({
      ok: false,
      codigo: "NAO_AUTORIZADO",
      erro: "Acesso não autorizado. Chave de acesso do posto ausente ou inválida (LGPD Art. 46 / Portaria 502/2017)."
    });
  }

  var action = params.action || "listar";

  if (action !== "listar") {
    return executarAcao_(params);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (!sheet) {
    return respostaJson_({ ok: false, erro: "Aba '" + SHEET_NAME + "' não encontrada." });
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    return respostaJson_({ ok: true, fila: [], emAtendimento: [], hoje: dataHojeBrasil_() });
  }

  var numRows = Math.min(lastRow - 3, 2500);
  var valores = sheet.getRange(4, 1, numRows, 14).getDisplayValues();
  var hoje = dataHojeBrasil_();
  var somenteHoje = params.todosOsDias !== "1";
  var entrevistadorRequisitante = String(params.entrevistador || "").trim().toLowerCase();

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
    if (!ehEncaminhadoSetor_(resolucao)) continue;
    if (somenteHoje && data !== "" && data !== hoje) continue;

    var isOwnerAtivo = (statusFila === "EM_ATENDIMENTO") && (entrevistador.toLowerCase() === entrevistadorRequisitante) && entrevistadorRequisitante !== "";

    // Minimização de dados pessoais sensíveis (LGPD Art. 6º, III)
    var item = {
      row: rowNumber,
      data: data || hoje,
      hora: hora,
      nome: nome || "Sem nome informado",
      cpf: isOwnerAtivo ? cpf : mascararCpfServidor_(cpf),
      tipoAtendimento: tipoAtendimento || "Não informado",
      local: local,
      resolucao: resolucao,
      observacoes: isOwnerAtivo ? observacoes : "",
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

  if (!validarAcesso_(payload)) {
    return respostaJson_({
      ok: false,
      codigo: "NAO_AUTORIZADO",
      erro: "Acesso não autorizado. Chave de acesso do posto inválida ou ausente (LGPD Art. 46 / Portaria 502/2017)."
    });
  }

  return executarAcao_(payload);
}

/**
 * Executa transição de status com LockService e auditoria individualizada
 */
function executarAcao_(payload) {
  if (!validarAcesso_(payload)) {
    return respostaJson_({
      ok: false,
      codigo: "NAO_AUTORIZADO",
      erro: "Acesso não autorizado. Chave de acesso do posto inválida ou ausente."
    });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (e) {
    return respostaJson_({ ok: false, erro: "Servidor ocupado. Tente novamente em 2 segundos." });
  }

  try {
    var action = String(payload.action || "").trim();
    var row = parseInt(payload.row, 10);
    var entrevistador = String(payload.entrevistador || "").trim();
    var matricula = String(payload.matricula || "").trim();

    if (!entrevistador) {
      return respostaJson_({
        ok: false,
        erro: "Identificação do servidor/entrevistador é obrigatória (Portaria MDS nº 502/2017)."
      });
    }

    if (!row || row < 4 || row > 3000) {
      return respostaJson_({ ok: false, erro: "Linha inválida." });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    if (!sheet) return respostaJson_({ ok: false, erro: "Aba não encontrada." });

    garantirCabecalhosControle_(sheet);

    var dadosCompletos = sheet.getRange(row, 1, 1, 14).getDisplayValues()[0];
    var dataOriginal = dadosCompletos[0] || dataHojeBrasil_();
    var horaOriginal = dadosCompletos[1] || horaAgoraBrasil_();
    var nomeCidadao = dadosCompletos[2] || "";
    var cpfCidadao = dadosCompletos[3] || "";
    var tipoAtendimento = dadosCompletos[4] || "";
    var local = dadosCompletos[5] || "";
    var resolucao = dadosCompletos[6] || "";
    var observacoes = dadosCompletos[7] || "";
    var classificacao = dadosCompletos[8] || "Geral";
    var tipoPrioridade = dadosCompletos[9] || "";
    var statusAtual = String(dadosCompletos[10] || "").trim().toUpperCase();
    var donoAtual = String(dadosCompletos[11] || "").trim();
    var horaAceiteAtual = String(dadosCompletos[12] || "").trim();

    var agora = horaAgoraBrasil_();
    var hoje = dataHojeBrasil_();
    var controleRange = sheet.getRange(row, 11, 1, 4);

    // Consulta detalhada para restauração de tela ativa
    if (action === "obter_detalhe") {
      if (statusAtual === "EM_ATENDIMENTO" && donoAtual.toLowerCase() === entrevistador.toLowerCase()) {
        registrarAuditoria_("CONSULTA_DETALHE_ATIVO", entrevistador, matricula, row, nomeCidadao, cpfCidadao, "Restauração de ficha em atendimento");
        return respostaJson_({
          ok: true,
          item: {
            row: row,
            data: dataOriginal,
            hora: horaOriginal,
            nome: nomeCidadao,
            cpf: cpfCidadao,
            tipoAtendimento: tipoAtendimento,
            local: local,
            resolucao: resolucao,
            observacoes: observacoes,
            classificacao: classificacao,
            tipoPrioridade: tipoPrioridade,
            prioritario: ehPrioritario_(classificacao, tipoPrioridade),
            status: "EM_ATENDIMENTO",
            entrevistador: donoAtual,
            horaAceite: horaAceiteAtual
          }
        });
      }
      return respostaJson_({ ok: false, erro: "Atendimento não pertence ao servidor atual ou já finalizado." });
    }

    if (action === "aceitar") {
      if (statusAtual === "EM_ATENDIMENTO" && donoAtual.toLowerCase() !== entrevistador.toLowerCase()) {
        return respostaJson_({
          ok: false,
          codigo: "JA_ACEITO",
          erro: "Já foi aceito por " + (donoAtual || "outro entrevistador") + "."
        });
      }
      if (statusAtual === "FINALIZADO") {
        return respostaJson_({
          ok: false,
          codigo: "JA_FINALIZADO",
          erro: "Este atendimento já foi finalizado."
        });
      }

      controleRange.setValues([["EM_ATENDIMENTO", entrevistador, agora, ""]]);
      SpreadsheetApp.flush();

      registrarAuditoria_("ACEITE_ATENDIMENTO", entrevistador, matricula, row, nomeCidadao, cpfCidadao, "Início do atendimento individual");

      return respostaJson_({
        ok: true,
        status: "EM_ATENDIMENTO",
        row: row,
        entrevistador: entrevistador,
        horaAceite: agora,
        item: {
          row: row,
          data: dataOriginal,
          hora: horaOriginal,
          nome: nomeCidadao,
          cpf: cpfCidadao,
          tipoAtendimento: tipoAtendimento,
          local: local,
          resolucao: resolucao,
          observacoes: observacoes,
          classificacao: classificacao,
          tipoPrioridade: tipoPrioridade,
          prioritario: ehPrioritario_(classificacao, tipoPrioridade),
          status: "EM_ATENDIMENTO",
          entrevistador: entrevistador,
          horaAceite: agora
        }
      });
    }

    if (action === "finalizar") {
      var nomeFinal = donoAtual || entrevistador;
      controleRange.setValues([["FINALIZADO", nomeFinal, horaAceiteAtual || agora, agora]]);
      SpreadsheetApp.flush();

      registrarAuditoria_("FINALIZAR_ATENDIMENTO", entrevistador, matricula, row, nomeCidadao, cpfCidadao, "Atendimento concluído com sucesso");

      return respostaJson_({ ok: true, status: "FINALIZADO", row: row, horaFim: agora });
    }

    if (action === "devolver") {
      controleRange.setValues([["AGUARDANDO", "", "", ""]]);
      SpreadsheetApp.flush();

      registrarAuditoria_("DEVOLVER_FILA", entrevistador, matricula, row, nomeCidadao, cpfCidadao, "Devolvido à fila de espera");

      return respostaJson_({ ok: true, status: "AGUARDANDO", row: row });
    }

    if (action === "redirecionar") {
      var novoTipo = String(payload.novoTipo || "").trim();
      if (!novoTipo) {
        return respostaJson_({ ok: false, erro: "Novo tipo de atendimento não informado." });
      }

      var atendenteAtual = donoAtual || entrevistador;
      controleRange.setValues([["FINALIZADO", atendenteAtual, horaAceiteAtual || agora, agora]]);

      var targetRow = encontrarProximaLinhaDisponivel_(sheet);
      var novaLinha = [
        dataOriginal,
        horaOriginal,
        nomeCidadao,
        cpfCidadao,
        novoTipo,
        local,
        RESOLUCAO_SETOR,
        observacoes,
        classificacao,
        tipoPrioridade,
        "AGUARDANDO",
        "",
        "",
        ""
      ];

      sheet.getRange(targetRow, 1, 1, 14).setValues([novaLinha]);
      SpreadsheetApp.flush();

      registrarAuditoria_("REDIRECIONAR", entrevistador, matricula, row, nomeCidadao, cpfCidadao, "Redirecionado para novo tipo: " + novoTipo + " (nova linha: " + targetRow + ")");

      return respostaJson_({
        ok: true,
        status: "REDIRECIONADO",
        rowOrigem: row,
        novaLinha: targetRow,
        novoTipo: novoTipo
      });
    }

    return respostaJson_({ ok: false, erro: "Ação desconhecida: " + action });
  } finally {
    lock.releaseLock();
  }
}

function encontrarProximaLinhaDisponivel_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return 4;

  var numRowsParaVerificar = Math.min(lastRow + 1, 2500);
  if (numRowsParaVerificar > 3) {
    var valores = sheet.getRange(4, 3, numRowsParaVerificar - 3, 2).getValues();
    for (var i = 0; i < valores.length; i++) {
      var nome = String(valores[i][0] || "").trim();
      var cpf = String(valores[i][1] || "").trim();
      if (!nome && !cpf) {
        return i + 4;
      }
    }
  }

  return lastRow + 1;
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

function horaAgoraBrasil_() {
  return Utilities.formatDate(new Date(), FUSO_HORARIO, "HH:mm:ss");
}

function respostaJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
