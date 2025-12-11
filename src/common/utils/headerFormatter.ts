export const formatHeader = (header: string) => {
  return header
    .replace(/([A-Z])/g, ' $1') // [A-Z] → match any uppercase letter, ( ) → capture the matched uppercase letter in group 1 ($1)
    .replace(/^./, (c) => c.toUpperCase()); // ^ → start of the string, . → match first character
};
