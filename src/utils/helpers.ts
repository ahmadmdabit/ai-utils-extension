/**
 * Removes consecutive duplicate phrases from a string, ignoring case.
 * This is useful for cleaning up text with stuttering or copy-paste errors.
 *
 * @param text The input string.
 * @returns The string with consecutive duplicate phrases removed.
 */
export function removeDuplicatePhrases(text: string): string {
  // This regex captures a multi-word phrase (defined by non-whitespace characters \S+)
  // and then uses a backreference (\1) to find an immediate, consecutive duplicate.
  const regex = /\b(\S+(?:\s+\S+)+)\s+\1\b/gi;

  let cleanedText = text;
  let previousText;

  // Loop to handle cases like "word word word" -> "word"
  // The regex will first turn it into "word word", and the loop ensures it's run again.
  do {
    previousText = cleanedText;
    cleanedText = cleanedText.replace(regex, '$1');
  } while (cleanedText !== previousText);

  return cleanedText;
}
