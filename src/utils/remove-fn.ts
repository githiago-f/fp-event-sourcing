export const removeFunctions = (obj: any) => {
  return Object.keys(obj).filter(key => typeof obj[key] !== 'function')
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc;
    }, {} as typeof obj);
}
