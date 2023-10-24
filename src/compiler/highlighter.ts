import { JSONSchema7 } from "json-schema";
import { EditorToken, Token } from "./types";
import * as JSONSchemaLibrary from "json-schema-library";

function sortBySimilarity(words: string[], singleWord: string): string[] {
  // Create an array of objects to store the words and their distances
  let wordDistances = words.map((word) => ({
    word: word,
    distance: levenshteinDistance(word, singleWord),
  }));

  // Sort the array by distance
  wordDistances.sort((a, b) => a.distance - b.distance);

  // Return the sorted list of words
  return wordDistances.map((wd) => wd.word);
}

function levenshteinDistance(a: string, b: string): number {
  // Create a 2D array to store the distances
  let distances = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) {
    distances[i] = new Array(b.length + 1);
  }

  // Initialize the first row and column
  for (let i = 0; i <= a.length; i++) {
    distances[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    distances[0][j] = j;
  }

  // Fill in the rest of the array
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        distances[i][j] = distances[i - 1][j - 1];
      } else {
        distances[i][j] =
          Math.min(
            distances[i - 1][j],
            distances[i][j - 1],
            distances[i - 1][j - 1]
          ) + 1;
      }
    }
  }

  // Return the final distance
  return distances[a.length][b.length];
}

export const getEditorTokens = (
  tokens: Token[],
  schema: JSONSchema7
): EditorToken[] => {
  const JSONSchema = new JSONSchemaLibrary.Draft07(schema);
  return tokens.map((token, i) => {
    const nextToken = getNextToken(i);
    switch (token.type) {
      case "identifier":
        const lastProperty =
          "/" + token.value.split(".").slice(0, -1).join("/");

        const subSchema = JSONSchema.getSchema({
          pointer: lastProperty === "/" ? "" : lastProperty,
        });

        const extraSymbols =
          subSchema &&
          subSchema.properties &&
          (Object.keys(subSchema.properties).map((p) => {
            const prefix =
              lastProperty === "/"
                ? ""
                : lastProperty.slice(1).replace(/\//, ".") + ".";
            return `${prefix}${p}`;
          }) as string[]);

        let matchingTokens: string[] =
          subSchema &&
          subSchema.properties &&
          !subSchema.properties[
            token.value.split(".")[token.value.split(".").length - 1]
          ]
            ? extraSymbols
            : [];

        matchingTokens = matchingTokens.filter(
          (v) =>
            v.length >= token.value.length &&
            v.startsWith(token.value) &&
            v !== token.value
        );

        const variant =
          nextToken?.type === "leftParen" ? "CallExpression" : undefined;
        return {
          ...token,
          variant,
          hints: sortBySimilarity(matchingTokens, token.value),
          valid: extraSymbols ? extraSymbols.includes(token.value) : true,
        };

      case "number":
        return {
          ...token,
          valid:
            token.value.split("").filter((char) => char === ".").length < 2,
        };

      case "unknown":
        return { ...token, valid: false };

      default:
        return { ...token, valid: true };
    }
  });

  function getNextToken(i: number): Token | null {
    const token = tokens[++i];
    if (!token) return null;
    if (token.type === "whitespace") return getNextToken(i);
    return token;
  }
};
