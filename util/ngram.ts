export const ngram = (string: string, n: number, linear?: boolean) => {
  const Ngram = [];
  const search = string.toLowerCase().split(" ");
  if (!linear) {
    search.forEach((str) => {
      for (let i = 0; i < str.length - n + 1; i++) {
        Ngram.push(str.substring(i, i + n));
      }
    });
  } else if (linear) {
    search.forEach((str) => {
      for (let i = 0; i + n <= str.length; i++) {
        Ngram.push(str.substring(0, n + i));
      }
    });
  }
  return Ngram;
};

export const adaptiveNgram = (string: string, errCorrection: number) => {
  const Ngram = [];
  const search = string.toLowerCase().split(" ");
  search.forEach((str) => {
    const n = str.length - errCorrection;
    if (n > 3) {
      Ngram.push(str.substring(0, 3));
    }
    for (let i = 0; i < str.length - n + 1; i++) {
      Ngram.push(str.substring(i, i + n));
    }
  });
  return Ngram;
};
