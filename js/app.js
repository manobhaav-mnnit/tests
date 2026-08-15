function getTestId() {
  return new URLSearchParams(window.location.search).get("id");
}

function findTest(id) {
  return tests[id];
}

function renderHome() {
  const list = document.getElementById("test-list");
  if (!list) return;

  Object.entries(tests).forEach(([id, test]) => {
    const a = document.createElement("a");
    a.className = "test-item";
    a.href = `test.html?id=${encodeURIComponent(id)}`;
    a.innerHTML = `<div><h2>${escapeHtml(test.title)}</h2><p>${escapeHtml(test.description)}</p></div><span>Start →</span>`;
    list.appendChild(a);
  });
}

function renderTest() {
  const form = document.getElementById("test-form");
  if (!form) return;

  const id = getTestId();
  const test = findTest(id);
  if (!test) {
    document.getElementById("test-header").innerHTML = "<h1>Test not found</h1>";
    return;
  }

  document.title = test.title;
  document.getElementById("test-header").innerHTML = `
    <p class="eyebrow">QUESTIONNAIRE</p>
    <h1>${escapeHtml(test.title)}</h1>
    <p class="muted">${escapeHtml(test.description)}</p>
    <p class="instructions">${escapeHtml(test.instructions)}</p>
  `;

  test.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";
    fieldset.innerHTML = `
      <legend><span class="number">${index + 1}</span>${escapeHtml(question)}</legend>
      <div class="options">
        ${test.options.map((option, optionIndex) => `
          <label class="option">
            <input type="radio" name="q${index}" value="${option.score}">
            <span>${escapeHtml(option.text)}</span>
          </label>
        `).join("")}
      </div>
    `;
    form.appendChild(fieldset);
  });

  document.getElementById("submit-btn").addEventListener("click", () => {
    const answers = test.questions.map((_, i) =>
      form.querySelector(`input[name="q${i}"]:checked`)
    );

    const error = document.getElementById("error");
    if (answers.some(a => !a)) {
      error.hidden = false;
      error.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const score = answers.reduce((sum, a) => sum + Number(a.value), 0);
    sessionStorage.setItem("testResult", JSON.stringify({ id, score }));
    window.location.href = `results.html?id=${encodeURIComponent(id)}`;
  });
}

function renderResults() {
  const results = document.getElementById("results");
  if (!results) return;

  const id = getTestId();
  const test = findTest(id);
  const saved = JSON.parse(sessionStorage.getItem("testResult") || "null");

  if (!test || !saved || saved.id !== id) {
    results.innerHTML = `
      <h1>No result available</h1>
      <p class="muted">Complete a test first.</p>
      <a class="button primary" href="index.html">Choose a test</a>
    `;
    return;
  }

  const range = test.ranges.find(r => saved.score >= r.min && saved.score <= r.max);

  results.innerHTML = `
    <p class="eyebrow">YOUR RESULT</p>
    <h1>${escapeHtml(test.title)}</h1>
    <div class="score">${saved.score}<span>/${test.maxScore}</span></div>
    <h2>${escapeHtml(range.label)}</h2>
    <p class="result-description">${escapeHtml(range.description)}</p>
    <p class="note">${escapeHtml(test.note)}</p>
    <div class="result-actions">
      <a class="button primary" href="test.html?id=${encodeURIComponent(id)}">Retake test</a>
      <a class="button secondary" href="index.html">All tests</a>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

renderHome();
renderTest();
renderResults();
