export const remapObjectKeys = <T>(
  obj: { [key: string]: T },
  filteredKeys: string[],
): { [key: string]: T } => {
  const newObj: { [key: string]: T } = {};
  filteredKeys.forEach((key, index) => {
    const newKey = (index + 1).toString();
    newObj[newKey] = obj[key];
  });
  return newObj;
};
