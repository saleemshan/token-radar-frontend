const LOCAL_STORAGE_KEY = 'tokenSearchHistory';

export function saveTokenSearchHistory(token: TokenSearchHistory): void {
  let history = getTokenSearchHistory() || [];
  const exists = history.some(
    (item) => item.address === token.address && item.chain === token.chain,
  );
  if (!exists) {
    history.push(token);
    if (history.length > 5) {
      // history.shift(); // Remove the oldest entry
      history = history.slice(-5);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }
}

export function deleteTokenSearchHistory(
  address: string,
  chain: ChainId,
): void {
  const history = getTokenSearchHistory() || [];
  const updatedHistory = history.filter(
    (item) => !(item.address === address && item.chain === chain),
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
}

export function deleteAllTokenSearchHistory(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function getTokenSearchHistory(): TokenSearchHistory[] | null {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? (JSON.parse(data) as TokenSearchHistory[]) : null;
}
