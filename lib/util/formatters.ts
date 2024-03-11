export function toReadableNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function toTitleCase(str: string): string {
  return str.replace(/\b([A-Za-z])/g, (x) => x.toUpperCase());
}

export function toCurrency(num: number | string): string {
  const _num = typeof num === 'number' ? num.toString() : num;
  const parsedNum = Number.parseFloat(_num);
  const price = parsedNum.toFixed(2);

  return parsedNum > 0 ? `$${price}` : 'FREE';
}
