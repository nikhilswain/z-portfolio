export async function fetchProgrammingJoke() {
  const fallbackJokes = [
    {
      setup: "Why do programmers prefer dark mode?",
      punchline: "Because light attracts bugs.",
    },
    {
      setup: "What's a programmer's favorite hangout place?",
      punchline: "The Foo Bar.",
    },
    {
      setup: "Why do Java developers wear glasses?",
      punchline: "Because they don't C#.",
    },
    {
      setup: "How many programmers does it take to change a light bulb?",
      punchline: "None. It's a hardware problem.",
    },
  ];

  try {
    const response = await fetch(
      "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    const data = await response.json();

    const joke = data[0];
    return {
      type: "joke",
      setup: joke.setup,
      punchline: joke.punchline,
    };
  } catch (error) {
    console.warn("Failed to fetch from API, using fallback joke.");

    const randomFallback =
      fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    return {
      type: "joke",
      setup: randomFallback.setup,
      punchline: randomFallback.punchline,
    };
  }
}
