function importMarkdownFromGitHub() {
  const url = "https://raw.githubusercontent.com/helsoc7/pcep-quiz-questions/main/day2.md";
  const response = UrlFetchApp.fetch(url);
  const markdown = response.getContentText().replace(/\r\n/g, "\n");

  const form = FormApp.getActiveForm();
  form.setIsQuiz(true);

  // Extrahiere ALLE Fragen mit "# Frage X\nFragetext\nAntworten"
  const regex = /^# Frage \d+[^\n]*\n([\s\S]*?)(?=^# Frage|\Z)/gm;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const block = match[1].trim();
    const lines = block.split("\n");

    let questionLines = [];
    let inCodeBlock = false;

    for (let line of lines) {
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock || !line.trim().startsWith("- [")) {
        questionLines.push(line);
      }
    }

    const questionText = questionLines.join("\n").trim();
    const answers = lines.filter(line => line.trim().startsWith("- [")).map(l => l.trim());

    const choices = [];
    const correctAnswers = [];

    answers.forEach(answer => {
      const text = answer.replace(/^- \[[x ]\] /, "").trim();
      if (text && !choices.includes(text)) {
        choices.push(text);
        if (answer.startsWith("- [x]")) {
          correctAnswers.push(text);
        }
      }
    });

    if (!questionText || choices.length === 0) continue;

    let item;
    if (correctAnswers.length > 1) {
      item = form.addCheckboxItem();
    } else {
      item = form.addMultipleChoiceItem();
    }

    item.setTitle(questionText);
    item.setChoices(
      choices.map(c => item.createChoice(c, correctAnswers.includes(c)))
    );
    item.setPoints(1);
    item.setRequired(true);
  }
}
