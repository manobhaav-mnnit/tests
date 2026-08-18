const tests = {
  "gse-10": {
    title: "General Self-Efficacy Scale (GSE-10)",
    description: "Rate how true each statement is for you in general.",
    attribution: "Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston, Measures in health psychology: A user's portfolio. Causal and control beliefs (pp. 35–37). Windsor, UK: NFER-NELSON.",
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
    note: "The scale's authors did not publish official clinical cut-offs. These ranges are a commonly used general-purpose convention for individual feedback.",
    interventions: [
      {
        title: "Tiny wins log",
        description: "Each day, do one small task you're sure you can finish (make your bed, finish one worksheet, reply to one email). Write it down after. Self-efficacy grows from evidence you can succeed, not from motivation."
      },
      {
        title: "Break the big thing down",
        description: "Pick one task that feels too big. Split it into steps so small each one takes under 10 minutes. Do just the first step today. Momentum comes from starting, not from finishing."
      },
      {
        title: "Rename the nervous feeling",
        description: "Before a hard task, if your heart is racing, say out loud \"I'm ready\" instead of \"I'm anxious.\" Same physical feeling, different label — how you interpret your body's signals changes how capable you feel."
      },
      {
        title: "Weekly challenge task",
        description: "Once a week, pick one task slightly harder than what you're used to. Not overwhelming — just outside your comfort zone. Completing it (even imperfectly) is what builds the belief further."
      },
      {
        title: "Effort review, not outcome review",
        description: "After trying something hard, write 2 sentences on what you did well in your approach, regardless of the result. This keeps focus on your process, which you control."
      }
    ]
  }
};
