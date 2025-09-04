export const getSlicedAddress = (
  address: string,
  value = 4,
  symbol = '...',
) => {
  if (!address) return '';
  return `${address.slice(0, value)}${symbol}${address.slice(-value)}`;
};

export const getLeadingAddress = (
  address: string,
  length = 12,
  symbol = '...',
) => {
  if (!address) return '';
  return `${address.slice(0, length)}${symbol}`;
};

export const getCapitalizeFirstLetter = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};
