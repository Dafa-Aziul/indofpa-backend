export const getInterpretasi = (value, config) => {
  if (value === null || value === undefined) return null;
  if (!config?.interpretasi) return null;

  for (const rule of config.interpretasi) {
    const min = Number(rule.min);
    const max = Number(rule.max);
    if (value >= min && value <= max) {
      return {
        label: rule.label,
        range: `${min} - ${max}`
      };
    }
  }

  return null;
};
