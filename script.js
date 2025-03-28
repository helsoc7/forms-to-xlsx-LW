function exportFormToQuestionBankStyleSheet() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();

  const headers = [
    "Group",
    "Type",
    "Question",
    "CorAns",
    "Answer1", "Answer2", "Answer3", "Answer4", "Answer5",
    "Answer6", "Answer7", "Answer8", "Answer9", "Answer10",
    "CorrectExplanation",
    "IncorrectExplanation"
  ];

  const rows = [];

  items.forEach(item => {
    const type = item.getType();
    const title = item.getTitle();
    let group = "General";
    let questionType = "";
    let options = Array(10).fill(""); // 10 leere Antwortfelder
    let correctAnswers = "";

    switch (type) {
      case FormApp.ItemType.MULTIPLE_CHOICE:
        questionType = "TMC";
        const mcItem = item.asMultipleChoiceItem();
        const mcChoices = mcItem.getChoices();
        options = mcChoices.map(c => c.getValue()).concat(options).slice(0, 10);
        const correctMC = mcChoices.findIndex(c => c.isCorrectAnswer());
        if (correctMC >= 0) correctAnswers = (correctMC + 1).toString();
        break;

      case FormApp.ItemType.CHECKBOX:
        questionType = "TMCMA";
        const cbItem = item.asCheckboxItem();
        const cbChoices = cbItem.getChoices();
        options = cbChoices.map(c => c.getValue()).concat(options).slice(0, 10);
        const correctIndices = cbChoices.map((c, i) => c.isCorrectAnswer() ? (i + 1) : null).filter(x => x !== null);
        correctAnswers = correctIndices.join(",");
        break;

      case FormApp.ItemType.LIST:
        questionType = "TMC";
        const listItem = item.asListItem();
        const listChoices = listItem.getChoices();
        options = listChoices.map(c => c.getValue()).concat(options).slice(0, 10);
        break;

      case FormApp.ItemType.TEXT:
        questionType = "TST";
        break;

      case FormApp.ItemType.PARAGRAPH_TEXT:
        questionType = "TP";
        break;

      case FormApp.ItemType.FILE_UPLOAD:
        questionType = "TFU";
        break;

      case FormApp.ItemType.SCALE:
      case FormApp.ItemType.GRID:
      case FormApp.ItemType.DATE:
      case FormApp.ItemType.TIME:
        return;
    }

    const row = [
      group,
      questionType,
      title,
      correctAnswers,
      ...options,
      "You are correct!",
      "Sorry, you have selected the wrong answer."
    ];

    rows.push(row);
  });

  // Neue Tabelle mit Blatt "Questions"
  const spreadsheet = SpreadsheetApp.create("Fragen Export (Question Bank Style)");
  const sheet = spreadsheet.getActiveSheet();
  sheet.setName("Questions");
  sheet.appendRow(headers);
  rows.forEach(r => sheet.appendRow(r));

  // XLSX-Export (Google Drive)
  const url = "https://docs.google.com/feeds/download/spreadsheets/Export?key=" + spreadsheet.getId() + "&exportFormat=xlsx";
  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + token }
  });

  const blob = response.getBlob().setName("Fragen_Export.xlsx");
  const file = DriveApp.createFile(blob);
  Logger.log("✅ XLSX-Datei gespeichert in Google Drive: " + file.getUrl());
}
