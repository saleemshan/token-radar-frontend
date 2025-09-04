export const getScoreColor = (score: number) => {
  if (score >= 80) {
    return 'text-positive';
  }
  if (score >= 60) {
    return 'text-yellow-500';
  }
  return 'text-negative';
};

export const getTopHoldersColor = (holders?: number) => {
  if (!holders) {
    return 'text-neutral-text';
  }
  if (holders <= 25) {
    return 'text-positive';
  } else if (holders <= 40) {
    return 'text-yellow-500';
  } else {
    return 'text-negative';
  }
};

export const getInsiderColor = (insiderRate?: number) => {
  if (insiderRate === undefined) {
    return 'text-neutral-text';
  }
  if (insiderRate < 30) {
    return 'text-positive';
  } else if (insiderRate < 50) {
    return 'text-yellow-500';
  } else {
    return '!text-negative';
  }
};
