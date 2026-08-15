/*
 * MANOBHAAV TEST RESPONSE BACKEND
 *
 * One Google Sheet can handle every Manobhaav test.
 *
 * Each test gets its own tab automatically:
 *
 *   GSE-10
 *   Big Five
 *   Test 3
 *   etc.
 *
 * There is also an "All Responses" tab containing every submission.
 */

const ALL_RESPONSES_SHEET = "All Responses";

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST data received.");
    }

    const data = JSON.parse(e.postData.contents);

    const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet();

    const testId = String(data.testId || "unknown");
    const testName = String(data.testName || testId);
    const name = String(data.name || "").trim();

    const answers =
      Array.isArray(data.answers)
        ? data.answers
        : [];

    const score =
      data.score === undefined
        ? ""
        : data.score;

    const level =
      String(data.level || "");

    if (!name) {
      throw new Error("Participant name is required.");
    }

    /*
     * 1. Write to the dedicated test tab.
     */
    const testSheet =
      getOrCreateTestSheet(spreadsheet, testName, answers.length);

    testSheet.appendRow([
      new Date(),
      name,
      ...answers,
      score,
      level
    ]);

    /*
     * 2. Also write to the master sheet.
     */
    const allSheet =
      getOrCreateAllResponsesSheet(
        spreadsheet,
        answers.length
      );

    allSheet.appendRow([
      new Date(),
      testId,
      testName,
      name,
      ...answers,
      score,
      level
    ]);

    return jsonResponse({
      success: true
    });

  } catch (error) {

    return jsonResponse({
      success: false,
      error: error.message
    });

  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function getOrCreateTestSheet(
  spreadsheet,
  testName,
  answerCount
) {
  const sheetName =
    makeSafeSheetName(testName);

  let sheet =
    spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(sheetName);

    const headers = [
      "Timestamp",
      "Name"
    ];

    for (let i = 1; i <= answerCount; i++) {
      headers.push(`Q${i}`);
    }

    headers.push("Score");
    headers.push("Level");

    sheet.appendRow(headers);
    formatHeader(sheet);
  }

  return sheet;
}

function getOrCreateAllResponsesSheet(
  spreadsheet,
  answerCount
) {
  let sheet =
    spreadsheet.getSheetByName(
      ALL_RESPONSES_SHEET
    );

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(
        ALL_RESPONSES_SHEET
      );

    const headers = [
      "Timestamp",
      "Test ID",
      "Test",
      "Name"
    ];

    for (let i = 1; i <= answerCount; i++) {
      headers.push(`Q${i}`);
    }

    headers.push("Score");
    headers.push("Level");

    sheet.appendRow(headers);
    formatHeader(sheet);
  }

  return sheet;
}

function makeSafeSheetName(name) {
  let safe =
    String(name || "Test")
      .replace(/[\\/?*[\]:]/g, "-")
      .trim();

  if (!safe) {
    safe = "Test";
  }

  /*
   * Google Sheets limits sheet names to 100 characters.
   */
  return safe.substring(0, 100);
}

function formatHeader(sheet) {
  sheet.setFrozenRows(1);

  const range =
    sheet.getRange(
      1,
      1,
      1,
      sheet.getLastColumn()
    );

  range.setFontWeight("bold");
  range.setBackground("#173b32");
  range.setFontColor("#ffffff");

  sheet.autoResizeColumns(
    1,
    sheet.getLastColumn()
  );
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
