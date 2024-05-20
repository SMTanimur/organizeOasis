export const parsePrice = (value = '0-2600'): [number, number] => {
  return value.split('-').map((x) => parseFloat(x)) as [number, number];
};
