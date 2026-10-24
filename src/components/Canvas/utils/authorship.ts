export const toShortName = (name: string): string => {
  const [firstName, ...otherNames] = name.trim().split(/\s+/);
  const lastInitial = [...(otherNames.at(-1) ?? '')][0];

  return lastInitial ? `${firstName} ${lastInitial.toUpperCase()}.` : name.trim();
};
