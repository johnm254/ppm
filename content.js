// src/content.js: ALL text lives here. Short on purpose.
// Chat scenes are max 3 bubbles each, taken from the real chat. No long threads.

export const content = {
  name: "Faith",

  gate: { line: "Faith, I made something for you.", button: "Open" },

  // SCENE 1: how it started (3 bubbles)
  start: {
    title: "1 September",
    bubbles: [
      { from: "me",  text: "Hey" },
      { from: "her", text: "hey" },
      { from: "me",  text: "How are you 😌" }
    ],
    after: "One word each. I wanted the next one."
  },

  // SCENE 2: the fun part (2 bubbles)
  playful: {
    title: "The picture that wasn't you",
    bubbles: [
      { from: "her", text: "bythaa dp ni mm nilikuwa nakuchezea tu😂😂" },
      { from: "me",  text: "That laughter imeninice" }
    ],
    after: "That laugh got me first."
  },

  // SCENE 3: photos (add as many as you have, 6 to 10)
  photos: [
    // { src: "/photos/01.jpg", caption: "[short caption in your voice]" },
  ],

  // SCENE 4: the hard day (3 bubbles, honest, not hidden)
  hardDay: {
    title: "19 October",
    bubbles: [
      { from: "her", text: "Please don't hurt me again 😔" },
      { from: "me",  text: "I won't, I promise you that" },
      { from: "her", text: "I hear u" }
    ],
    after: "I hurt you that day. I'm not pretending I didn't."
  },

  // SCENE 5: the line that matters (one quiet screen)
  safe: {
    her: "I am safe around you",
    after: "Best thing anyone has ever said about me. I'll protect it."
  },

  // SCENE 6: the letter
  letter: [
    "Faith,",
    "It started on 1 September with one word. I said \"Hey\" and you said \"hey.\" I had no idea I'd want every reply after it.",
    "You first said \"Nakupenda\" as a joke, and I took it seriously anyway. Then you meant it, and I felt it.",
    "I know I hurt you when I hesitated, and that you asked me not to hurt you again. I'm still keeping that promise.",
    "You told me you feel safe around me. I'll protect that.",
    "You said we're both stuck with each other. I'd like to stay stuck. So I built you this, because I make things, and nothing I make matters more than you.",
    "Faith, I have one last thing to ask you...",
    "John"
  ],

  finale: {
    prompt: "Tap the heart",
    question: "Faith, will you be mine, not just for now, but for the long run?",
    questionSub: "Let's grow this love into something beautiful, together.",
    yes: "Yes 💛",
    notYet: "Let me think"
  },

  songNote: "Our song"
};
