export const extractScale = (labelSkala) => {
  const keys = Object.keys(labelSkala).map(n => Number(n));
  const min = Math.min(...keys);
  const max = Math.max(...keys);
  return { min, max };
};
