export class DataGenerator {
  static words = [
    "quick",
    "brown",
    "fox",
    "jumps",
    "over",
    "lazy",
    "dog",
    "automation",
    "testing",
    "playwright",
    "framework",
    "random",
    "data",
    "generation",
    "useful",
    "dynamic",
    "input",
    "field",
    "verify",
    "element",
    "locator",
    "stable",
    "robust",
    "clean",
    "AI Job Search",
    "Career Flow",
  ];

  /** Returns current timestamp in MMDD-HHmmss format */
  static currentTimestamp(format: string = "MMDD-HHmmss"): string {
    const d = new Date();

    const parts: Record<string, string> = {
      YYYY: String(d.getFullYear()),
      MM: String(d.getMonth() + 1).padStart(2, "0"),
      DD: String(d.getDate()).padStart(2, "0"),
      HH: String(d.getHours()).padStart(2, "0"),
      mm: String(d.getMinutes()).padStart(2, "0"),
      ss: String(d.getSeconds()).padStart(2, "0"),
    };

    let result = format;

    for (const key in parts) {
      result = result.replace(key, parts[key]);
    }

    return result;
  }

  /** Generates a random number from the given range */
  static randomNumber(min: number, max: number): number {
    if (min > max) {
      throw new Error("min should be less than or equal to max");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Generates a random sentence with given number of words */
  static randomSentence(wordCount: number): string {
    const sentence: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      const randomWord =
        DataGenerator.words[
          Math.floor(Math.random() * DataGenerator.words.length)
        ];
      sentence.push(randomWord);
    }

    // Capitalize first letter + add full stop
    const result = sentence.join(" ");
    return result.charAt(0).toUpperCase() + result.slice(1) + ".";
  }

  static randomString(
    length: number,
    options: { letters?: boolean; numbers?: boolean; symbols?: boolean } = {
      letters: true,
      numbers: true,
      symbols: false,
    },
  ): string {
    let chars = "";

    if (options.letters)
      chars += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.numbers) chars += "0123456789";
    if (options.symbols) chars += "!@#$%^&*";

    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  static randomTags(count: number): string {
    const pool = [...DataGenerator.words];
    const selected: string[] = [];
    const take = Math.min(count, pool.length);
    for (let i = 0; i < take; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    return selected.join(",");
  }
}

