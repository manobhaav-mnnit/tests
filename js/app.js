/*
 * Google Apps Script Web App URL.
 *
 * Leave this blank while testing the frontend.
 * Once the Apps Script is deployed, paste its /exec URL here.
 */
const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbx_8HLBuD8S3a925Y2VG2XJzKuB7iy60914eOE3a0rpoO4Xn1WTX790tXBJ_7OlcU5X/exec";

function getTestId() {
  return new URLSearchParams(window.location.search).get("id");
}

function findTest(id) {
  return tests[id];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

function renderHome() {
  const list = document.getElementById("test-list");
  if (!list) return;

  Object.entries(tests).forEach(([id, test]) => {
    const a = document.createElement("a");
    a.className = "test-item";
    a.href = `test.html?id=${encodeURIComponent(id)}`;
    a.innerHTML = `
      <div>
        <p class="test-kicker">SELF-ASSESSMENT</p>
        <h2>${escapeHtml(test.title)}</h2>
        <p>${escapeHtml(test.description)}</p>
      </div>
      <span>Take test →</span>
    `;
    list.appendChild(a);
  });
}

function renderTest() {
  const form = document.getElementById("test-form");
  if (!form) return;

  const id = getTestId();
  const test = findTest(id);

  if (!test) {
    document.getElementById("test-header").innerHTML = `
      <p class="eyebrow">MANOBHAAV</p>
      <h1>Test not found</h1>
      <p class="muted">The requested test does not exist.</p>
    `;
    return;
  }

  document.title = `Manobhaav | ${test.title}`;

  document.getElementById("test-header").innerHTML = `
    <p class="eyebrow">QUESTIONNAIRE • ${test.questions.length} ITEMS</p>
    <h1>${escapeHtml(test.title)}</h1>
    <p class="muted">${escapeHtml(test.description)}</p>
    <p class="instructions">${escapeHtml(test.instructions)}</p>
    ${test.attribution ? `<p class="attribution">Developed by: ${escapeHtml(test.attribution)}</p>` : ""}
  `;

  test.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";

    fieldset.innerHTML = `
      <legend>
        <span class="number">${String(index + 1).padStart(2, "0")}</span>
        <span>${escapeHtml(question)}</span>
      </legend>

      <div class="options">
        ${test.options.map(option => `
          <label class="option">
            <input type="radio"
                   name="q${index}"
                   value="${option.score}">
            <strong>${option.score}</strong>
            <span>${escapeHtml(option.text)}</span>
          </label>
        `).join("")}
      </div>
    `;

    form.appendChild(fieldset);
  });

  document.getElementById("submit-btn").addEventListener("click", async () => {
    const nameInput = document.getElementById("participant-name");
    const name = nameInput.value.trim();
    const error = document.getElementById("error");

    if (!name) {
      error.textContent = "Please enter your name.";
      error.hidden = false;
      nameInput.focus();
      return;
    }

    const answers = test.questions.map((_, i) =>
      form.querySelector(`input[name="q${i}"]:checked`)
    );

    const firstMissing = answers.findIndex(answer => !answer);

    if (firstMissing !== -1) {
      error.textContent =
        `Please answer question ${firstMissing + 1} before submitting.`;

      error.hidden = false;

      form.querySelectorAll(".question")[firstMissing]
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      return;
    }

    error.hidden = true;

    const numericAnswers = answers.map(answer => Number(answer.value));

    const score = numericAnswers.reduce(
      (sum, value) => sum + value,
      0
    );

    const range = test.ranges.find(
      r => score >= r.min && score <= r.max
    );

    const payload = {
      testId: id,
      testName: test.title,
      name,
      answers: numericAnswers,
      score,
      level: range ? range.label : ""
    };

    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";

    await submitResult(payload);

    sessionStorage.setItem(
      "testResult",
      JSON.stringify({
        id,
        name,
        score
      })
    );

    window.location.href =
      `results.html?id=${encodeURIComponent(id)}`;
  });
}

async function submitResult(payload) {
  if (!SHEETS_ENDPOINT) {
    console.info("Google Sheets submission disabled.");
    return;
  }

  try {
    await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    /*
     * The result should still be shown even if the remote submission fails.
     */
    console.error("Google Sheets submission failed:", error);
  }
}

function renderResults() {
  const results = document.getElementById("results");
  if (!results) return;

  const id = getTestId();
  const test = findTest(id);

  let saved = null;

  try {
    saved = JSON.parse(
      sessionStorage.getItem("testResult") || "null"
    );
  } catch {
    saved = null;
  }

  if (!test || !saved || saved.id !== id) {
    results.innerHTML = `
      <p class="eyebrow">MANOBHAAV</p>
      <h1>No result available</h1>
      <p class="muted">Complete a test first.</p>
      <div class="result-actions">
        <a class="button primary" href="index.html">
          Choose a test
        </a>
      </div>
    `;
    return;
  }

  const range = test.ranges.find(
    r => saved.score >= r.min && saved.score <= r.max
  );

  results.innerHTML = `
    <p class="eyebrow">YOUR RESULT</p>
    <h1>${escapeHtml(test.title)}</h1>
    <p class="result-name">${escapeHtml(saved.name)}</p>

    <div class="score">
      ${saved.score}<span>/${test.maxScore}</span>
    </div>

    <h2>${escapeHtml(range ? range.label : "Result")}</h2>

    <p class="result-description">
      ${escapeHtml(
        range
          ? range.description
          : "Your score has been calculated."
      )}
    </p>

    <p class="note">${escapeHtml(test.note)}</p>

    ${renderInterventions(test.interventions)}

    <div class="result-actions">
      <a class="button primary"
         href="test.html?id=${encodeURIComponent(id)}">
        Retake test
      </a>

      <a class="button secondary" href="index.html">
        All tests
      </a>
    </div>
  `;
}

function renderInterventions(interventions) {
  if (!interventions || !interventions.length) return "";

  return `
    <div class="interventions">
      <p class="eyebrow">BUILD ON THIS</p>
      <h2>Ways to Strengthen Self-Efficacy</h2>
      <div class="intervention-list">
        ${interventions.map(item => `
          <div class="intervention-item">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

renderHome();
renderTest();
renderResults();
