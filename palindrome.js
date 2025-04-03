/**
 * Checks if a string is a palindrome (reads the same backward as forward).
 * @param {string} str - The input string.
 * @returns {boolean} - True if the string is a palindrome, false otherwise.
 */
function isPalindrome(str) {
    if (!str || typeof str !== 'string') return false;
    const normalized = str.replace(/[\W_]/g, '').toLowerCase();
    return normalized === reverse(normalized);
  }