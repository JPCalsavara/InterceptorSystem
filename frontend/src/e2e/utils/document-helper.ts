export const generateValidCNPJ = () => {
    const randomDigit = () => Math.floor(Math.random() * 9);
    const n = Array.from({ length: 12 }, randomDigit);
    const mod = (arr: number[], pesos: number[]) => {
      const soma = arr.reduce((acc, curr, i) => acc + curr * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    n.push(mod(n, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    n.push(mod(n, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
    return n.join('');
};

export const generateValidCPF = () => {
    const randomDigit = () => Math.floor(Math.random() * 9);
    const n = Array.from({ length: 9 }, randomDigit);
    const mod = (arr: number[], pesos: number[]) => {
      const soma = arr.reduce((acc, curr, i) => acc + curr * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    n.push(mod(n, [10, 9, 8, 7, 6, 5, 4, 3, 2]));
    n.push(mod(n, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]));
    return n.join('');
};
