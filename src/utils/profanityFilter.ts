/**
 * Profanity Filter Utility
 * Detects inappropriate language in user input
 */

// Common inappropriate words (partial list - extend as needed)
const PROFANITY_LIST = [
  // Offensive words (masked for code)
  'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch', 'bastard',
  'dick', 'piss', 'cock', 'pussy', 'whore', 'slut', 'fag', 'retard',
  'idiot', 'stupid', 'dumb', 'moron', 'imbecile',
  // Add more as needed
  'sex', 'porn', 'xxx', 'nude', 'naked',
  // Variations with numbers
  'sh1t', 'fck', 'fuk', 'btch', 'a55', 'a$$',
  // Offensive phrases
  'go to hell', 'screw you', 'piss off', 'shut up',
];

// Pattern-based detection for variations
const PROFANITY_PATTERNS = [
  /f+u+c+k+/i,
  /s+h+i+t+/i,
  /b+i+t+c+h+/i,
  /a+s+s+h+o+l+e+/i,
  /d+a+m+n+/i,
  /p+i+s+s+/i,
  /c+r+a+p+/i,
  /\bf+\*+c+k+\b/i,
  /\bs+\*+i+t+\b/i,
  /\ba+\*+s+\b/i,
];

/**
 * Check if text contains profanity
 * @param text - The text to check
 * @returns Object with hasProfanity boolean and array of found words
 */
export function detectProfanity(text: string): { 
  hasProfanity: boolean; 
  foundWords: string[];
  cleanText?: string;
} {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, foundWords: [] };
  }

  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];

  // Check against word list
  for (const word of PROFANITY_LIST) {
    // Use word boundary regex to match whole words
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundWords.push(word);
    }
  }

  // Check against patterns
  for (const pattern of PROFANITY_PATTERNS) {
    const matches = lowerText.match(pattern);
    if (matches) {
      foundWords.push(...matches);
    }
  }

  // Remove duplicates
  const uniqueWords = [...new Set(foundWords)];

  return {
    hasProfanity: uniqueWords.length > 0,
    foundWords: uniqueWords,
  };
}

/**
 * Filter and censor profanity in text
 * @param text - The text to filter
 * @returns Censored text with profanity replaced by asterisks
 */
export function censorProfanity(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let censored = text;

  // Replace words from list
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(regex, (match) => '*'.repeat(match.length));
  }

  // Replace pattern matches
  for (const pattern of PROFANITY_PATTERNS) {
    censored = censored.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return censored;
}

/**
 * Validate text for submission
 * @param text - The text to validate
 * @param fieldName - Name of the field (for error messages)
 * @returns Validation result with error message if invalid
 */
export function validateText(text: string, fieldName: string = 'Text'): {
  isValid: boolean;
  error?: string;
} {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  const { hasProfanity, foundWords } = detectProfanity(text);

  if (hasProfanity) {
    return {
      isValid: false,
      error: `${fieldName} contains inappropriate language. Please remove offensive words and try again.`,
    };
  }

  return { isValid: true };
}

/**
 * Get a user-friendly error message for profanity detection
 */
export function getProfanityErrorMessage(fieldName: string = 'Your message'): string {
  return `${fieldName} contains inappropriate or offensive language. Please use respectful language and try again.`;
}

/**
 * Check if text contains special characters
 * Allows: letters, numbers, spaces, basic punctuation (. , ! ? - ' ")
 * @param text - The text to check
 * @returns Object with hasSpecialChars boolean and array of found characters
 */
export function detectSpecialCharacters(text: string): {
  hasSpecialChars: boolean;
  foundChars: string[];
} {
  if (!text || typeof text !== 'string') {
    return { hasSpecialChars: false, foundChars: [] };
  }

  // Allow: letters (any language), numbers, spaces, and basic punctuation: . , ! ? - ' "
  // Disallow: * @ # $ % ^ & ( ) [ ] { } < > | \ / ~ ` + = _ ; :
  const allowedPattern = /^[a-zA-Z0-9\s.,!?\-'"]+$/;
  
  if (allowedPattern.test(text)) {
    return { hasSpecialChars: false, foundChars: [] };
  }

  // Find all special characters
  const specialChars = text.match(/[^a-zA-Z0-9\s.,!?\-'"]/g) || [];
  const uniqueChars = [...new Set(specialChars)];

  return {
    hasSpecialChars: uniqueChars.length > 0,
    foundChars: uniqueChars,
  };
}

/**
 * Validate description text (checks both profanity and special characters)
 * @param text - The text to validate
 * @param fieldName - Name of the field (for error messages)
 * @returns Validation result with error message if invalid
 */
export function validateDescription(text: string, fieldName: string = 'Description'): {
  isValid: boolean;
  error?: string;
} {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check for profanity first
  const { hasProfanity } = detectProfanity(text);
  if (hasProfanity) {
    return {
      isValid: false,
      error: `${fieldName} contains inappropriate language. Please use respectful language.`,
    };
  }

  // Check for special characters
  const { hasSpecialChars, foundChars } = detectSpecialCharacters(text);
  if (hasSpecialChars) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters (${foundChars.join(', ')}). Please use only letters, numbers, and basic punctuation.`,
    };
  }

  return { isValid: true };
}
