const tests = {
  "gse-10": {
    title: "General Self-Efficacy Scale (GSE-10)",
    description: "Rate how true each statement is for you in general.",
    attribution: "Schwarzer, R., & Jerusalem, M. (1995).",
    instructions: "Choose one response for every statement.",
    options: [
      { text: "Not at all true", score: 1 },
      { text: "Hardly true", score: 2 },
      { text: "Moderately true", score: 3 },
      { text: "Exactly true", score: 4 }
    ],
    questions: [
      "I can always manage to solve difficult problems if I try hard enough.",
      "If someone opposes me, I can find the means and ways to get what I want.",
      "It is easy for me to stick to my aims and accomplish my goals.",
      "I am confident that I could deal efficiently with unexpected events.",
      "Thanks to my resourcefulness, I know how to handle unforeseen situations.",
      "I can solve most problems if I invest the necessary effort.",
      "I can remain calm when facing difficulties because I can rely on my coping abilities.",
      "When I am confronted with a problem, I can usually find several solutions.",
      "If I am in trouble, I can usually think of a solution.",
      "I can usually handle whatever comes my way."
    ],
    minScore: 10,
    maxScore: 40,
    ranges: [
      { min: 10, max: 20, label: "Lower self-efficacy", description: "Your score falls in the lower self-efficacy range." },
      { min: 21, max: 30, label: "Moderate self-efficacy", description: "Your score falls in the moderate self-efficacy range." },
      { min: 31, max: 40, label: "Higher self-efficacy", description: "Your score falls in the higher self-efficacy range." }
    ],
    note: "The scale's authors did not publish official clinical cut-offs. These ranges are a commonly used general-purpose convention for individual feedback."
  }
};
