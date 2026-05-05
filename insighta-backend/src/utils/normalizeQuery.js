// Converts any query object into a deterministic canonical form
// so that semantically identical queries always produce the same cache key.

export const normalizeQuery = (query) => {
  const normalized = {};

  // Gender — lowercase
  if (query.gender) normalized.gender = query.gender.toLowerCase().trim();

  // Age group — lowercase
  if (query.age_group) normalized.age_group = query.age_group.toLowerCase().trim();

  // Country — uppercase, support both country and country_id
  const country = query.country || query.country_id;
  if (country) normalized.country_id = country.toUpperCase().trim();

  // Age range — parse as numbers
  if (query.min_age !== undefined && query.min_age !== "") {
    normalized.min_age = Number(query.min_age);
  }
  if (query.max_age !== undefined && query.max_age !== "") {
    normalized.max_age = Number(query.max_age);
  }

  // Sorting
  if (query.sort_by) normalized.sort_by = query.sort_by.toLowerCase().trim();
  if (query.order) normalized.order = query.order.toLowerCase().trim();

  // Pagination
  normalized.page = Number(query.page) || 1;
  normalized.limit = Math.min(50, Number(query.limit) || 10);

  // Search query — lowercase and trimmed
  if (query.q) normalized.q = query.q.toLowerCase().trim();

  // Sort keys alphabetically so key order never matters
  const sorted = Object.fromEntries(
    Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b))
  );

  return sorted;
};

export const buildCacheKey = (prefix, query) => {
  const normalized = normalizeQuery(query);
  return `${prefix}:${JSON.stringify(normalized)}`;
};