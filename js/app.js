/*
 * Google Apps Script Web App URL.
 *
 * Leave this blank while testing the frontend.
 * Once the Apps Script is deployed, paste its /exec URL here.
 */
const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx_8HLBuD8S3a925Y2VG2XJzKuB7iy60914eOE3a0rpoO4Xn1WTX790tXBJ_7OlcU5X/exec";


/* =========================
   HELPERS
========================= */

function getTestId() {
  return new URLSearchParams(window.location.search).get("id");
}

function findTest(id) {
  return tests[id];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}


/* =========================
   HOME PAGE
========================= */

function renderHome() {
  const list = document.getElementById("test-list");

  if (!list) return;

  // Prevent duplicate rendering
  list.innerHTML = "";

  Object.entries(tests).forEach(([id, test]) => {
    const link = document.createElement("a");

    link.className = "test-item";
    link.href = `test.html?id=${encodeURIComponent(id)}`;

    link.innerHTML = `
      <div>
        <p class="test-kicker">SELF-ASSESSMENT</p>

        <h2>${escapeHtml(test.title)}</h2>

        <p>${escapeHtml(test.description)}</p>
      </div>

      <span>Take test →</span>
    `;

    list.appendChild(link);
  });
}


/* =========================
   TEST PAGE
========================= */

function renderTest() {
  const form = document.getElementById("test-form");

  if (!form) return;

  const id = getTestId();
  const test = findTest(id);

  const header = document.getElementById("test-header");
  const submitButton = document.getElementById("submit-btn");
  const error = document.getElementById("error");

  if (!test) {
    if (header) {
      header.innerHTML = `
        <p class="eyebrow">MANOBHAAV</p>

        <h1>Test not found</h1>

        <p class="muted">
          The requested test does not exist.
        </p>
      `;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    return;
  }

  document.title = `Manobhaav | ${test.title}`;


  /* =========================
     HEADER
  ========================= */

  if (header) {
    header.innerHTML = `
      <p class="eyebrow">
        QUESTIONNAIRE • ${test.questions.length} ITEMS
      </p>

      <h1>${escapeHtml(test.title)}</h1>

      <p class="muted">
        ${escapeHtml(test.description)}
      </p>

      <p class="instructions">
        ${escapeHtml(test.instructions)}
      </p>

      ${
        test.attribution
          ? `
            <p class="attribution">
              Developed by: ${escapeHtml(test.attribution)}
            </p>
          `
          : ""
      }
    `;
  }


  /* =========================
     QUESTIONS
  ========================= */

  // Prevent duplicate questions if renderTest is called again.
  form.querySelectorAll(".question").forEach((question) => {
    question.remove();
  });

  test.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");

    fieldset.className = "question";

    fieldset.innerHTML = `
      <legend>
        <span class="number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span>
          ${escapeHtml(question)}
        </span>
      </legend>

      <div class="options">
        ${test.options
          .map(
            (option) => `
              <label class="option">
                <input
                  type="radio"
                  name="q${index}"
                  value="${option.score}"
                  aria-label="${escapeHtml(option.text)}"
                >

                <span>
                  ${escapeHtml(option.text)}
                </span>
              </label>
            `
          )
          .join("")}
      </div>
    `;

    form.insertBefore(fieldset, submitButton?.parentElement || null);
  });


  /* =========================
     OPTION SELECTION
  ========================= */

  form.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", () => {
      const question = input.closest(".question");

      if (question) {
        question.classList.add("answered");
      }

      if (error) {
        error.hidden = true;
      }
    });
  });


  /* =========================
     SUBMIT
  ========================= */

  if (!submitButton) return;

  // Prevent duplicate listeners
  const newSubmitButton = submitButton.cloneNode(true);
  submitButton.replaceWith(newSubmitButton);

  newSubmitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    if (newSubmitButton.disabled) {
      return;
    }

    const nameInput = document.getElementById("participant-name");

    if (!nameInput) {
      return;
    }

    const name = nameInput.value.trim();


    /* =========================
       NAME VALIDATION
    ========================= */

    if (!name) {
      if (error) {
        error.textContent = "Please enter your name.";
        error.hidden = false;
      }

      nameInput.focus();
      return;
    }


    /* =========================
       ANSWER VALIDATION
    ========================= */

    const answers = test.questions.map((_, index) =>
      form.querySelector(
        `input[name="q${index}"]:checked`
      )
    );

    const firstMissing = answers.findIndex(
      (answer) => !answer
    );

    if (firstMissing !== -1) {
      if (error) {
        error.textContent =
          `Please answer question ${firstMissing + 1} before submitting.`;

        error.hidden = false;
      }

      const missingQuestion =
        form.querySelectorAll(".question")[firstMissing];

      if (missingQuestion) {
        missingQuestion.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      return;
    }


    /* =========================
       CALCULATE SCORE
    ========================= */

    if (error) {
      error.hidden = true;
    }

    const numericAnswers = answers.map(
      (answer) => Number(answer.value)
    );

    const score = numericAnswers.reduce(
      (sum, value) => sum + value,
      0
    );

    const range = test.ranges.find(
      (rangeItem) =>
        score >= rangeItem.min &&
        score <= rangeItem.max
    );


    /* =========================
       CREATE PAYLOAD
    ========================= */

    const payload = {
      testId: id,
      testName: test.title,
      name,
      answers: numericAnswers,
      score,
      level: range ? range.label : ""
    };


    /* =========================
       SUBMIT
    ========================= */

    newSubmitButton.disabled = true;
    newSubmitButton.textContent = "Submitting…";

    try {
      await submitResult(payload);
    } catch (submissionError) {
      console.error(
        "Submission error:",
        submissionError
      );
    }


    /* =========================
       SAVE RESULT LOCALLY
    ========================= */

    sessionStorage.setItem(
      "testResult",
      JSON.stringify({
        id,
        name,
        score
      })
    );


    /* =========================
       GO TO RESULTS
    ========================= */

    window.location.href =
      `results.html?id=${encodeURIComponent(id)}`;
  });
}


/* =========================
   GOOGLE SHEETS
========================= */

async function submitResult(payload) {
  if (!SHEETS_ENDPOINT) {
    console.info(
      "Google Sheets submission disabled."
    );

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

    console.info(
      "Result submitted successfully."
    );
  } catch (error) {
    /*
     * The result should still be shown even if
     * Google Sheets submission fails.
     */
    console.error(
      "Google Sheets submission failed:",
      error
    );
  }
}


/* =========================
   RESULTS PAGE
========================= */

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
  } catch (error) {
    console.error(
      "Could not read saved result:",
      error
    );

    saved = null;
  }


  /* =========================
     INVALID RESULT
  ========================= */

  if (
    !test ||
    !saved ||
    saved.id !== id
  ) {
    results.innerHTML = `
      <p class="eyebrow">MANOBHAAV</p>

      <h1>No result available</h1>

      <p class="muted">
        Complete a test first.
      </p>

      <div class="result-actions">
        <a
          class="button primary"
          href="index.html"
        >
          Choose a test
        </a>
      </div>
    `;

    return;
  }


  /* =========================
     FIND RESULT RANGE
  ========================= */

  const range = test.ranges.find(
    (rangeItem) =>
      saved.score >= rangeItem.min &&
      saved.score <= rangeItem.max
  );


  /* =========================
     DISPLAY RESULT
  ========================= */

  results.innerHTML = `
    <p class="eyebrow">
      YOUR RESULT
    </p>

    <h1>
      ${escapeHtml(test.title)}
    </h1>

    <p class="result-name">
      ${escapeHtml(saved.name)}
    </p>

    <div class="score">
      ${saved.score}<span>/${test.maxScore}</span>
    </div>

    <h2>
      ${escapeHtml(
        range ? range.label : "Result"
      )}
    </h2>

    <p class="result-description">
      ${escapeHtml(
        range
          ? range.description
          : "Your score has been calculated."
      )}
    </p>

    <p class="note">
      ${escapeHtml(test.note)}
    </p>

    ${renderInterventions(test.interventions)}

    <div class="result-actions">
      <a
        class="button primary"
        href="test.html?id=${encodeURIComponent(id)}"
      >
        Retake test
      </a>

      <a
        class="button secondary"
        href="index.html"
      >
        All tests
      </a>
    </div>
  `;
}


/* =========================
   INTERVENTIONS
========================= */

function renderInterventions(interventions) {
  if (
    !interventions ||
    !interventions.length
  ) {
    return "";
  }

  return `
    <div class="interventions">

      <p class="eyebrow">
        BUILD ON THIS
      </p>

      <h2>
        Ways to Strengthen Self-Efficacy
      </h2>

      <div class="intervention-list">

        ${interventions
          .map(
            (item) => `
              <div class="intervention-item">

                <h3>
                  ${escapeHtml(item.title)}
                </h3>

                <p>
                  ${escapeHtml(item.description)}
                </p>

              </div>
            `
          )
          .join("")}

      </div>

    </div>
  `;
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderTest();
  renderResults();
});
