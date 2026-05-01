export function classifyAge (age) {
  // Convert a numeric age into the age_group field used by profile filters.
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
};
