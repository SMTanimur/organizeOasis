export function convertToSlug(Text: string): string {
  return Text.toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export const removeDuplicates = (inputArray: any[]) => {
  const sortedArray = inputArray.sort((a, b) =>
    a.toString() > b.toString() ? 1 : a.toString() < b.toString() ? -1 : 0
  );

  let lastSeen = undefined;
  return sortedArray.reduce((sum, element) => {
    if (lastSeen !== element.toString()) {
      sum.push(element);
    }
    lastSeen = element.toString();
    return sum;
  }, []);
};
