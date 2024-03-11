export function toReadableNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function toTitleCase(str: string) {
  return str.replace(/\b([A-Za-z])/g, (x) => x.toUpperCase());
}

export function toCurrency(num: number | string) {
  const _num = typeof num === 'number' ? num.toString() : num;
  const parsedNum = Number.parseFloat(_num);
  const price = parsedNum.toFixed(2);

  return parsedNum > 0 ? `$${price}` : 'FREE';
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function toMonthName(num: number) {
  if (num < 0 || num > 11) {
    return monthNames[0];
  }

  return monthNames[num];
}
