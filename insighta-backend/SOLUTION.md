# SOLUTION.md — Stage 4B: System Optimization & Data Ingestion

## Part 1: Query Performance

### Approach
Two optimizations were applied to reduce query latency and database load:

**1. MongoDB Compound Indexes**
Added compound indexes to the Profile model matching the most common filter combinations:
- `{ gender, country_id, age_group }` — covers the most frequent multi-field queries
- `{ age }` — supports age range queries
- `{ created_at: -1 }` and `{ age: -1 }` — support sorting

Without indexes, MongoDB performs full collection scans at O(n). With indexes, filtered queries run in O(log n).

**2. Redis Caching**
Added a Redis caching layer (Upstash) that stores query results for 60 seconds. Before hitting MongoDB, the system checks Redis for a matching cache key. On cache hit, the result is returned immediately from memory.

### Before/After Comparison

| Query | Before (no cache) | After (cached) |
|-------|-------------------|----------------|
| GET /api/profiles | ~661ms | ~100ms |
| GET /api/profiles?gender=male | ~390ms | ~45ms |
| GET /api/profiles?gender=female | ~792ms | ~60ms |

### Design Decisions
- TTL set to 60 seconds — balances freshness with performance. Profile data changes infrequently so stale results for up to 60 seconds is acceptable.
- Cache is invalidated on every write (create, delete, upload) to prevent stale data.
- If Redis is unavailable, the system falls back to MongoDB queries — availability is maintained at the cost of higher latency.

---

## Part 2: Query Normalization

### Approach
Before checking the cache or executing a query, all filter parameters are normalized into a canonical form using `src/utils/normalizeQuery.js`.

**Normalization rules:**
- `gender` — lowercased and trimmed
- `age_group` — lowercased and trimmed
- `country` / `country_id` — uppercased and trimmed (both map to `country_id`)
- `min_age` / `max_age` — parsed as numbers
- `sort_by` / `order` — lowercased
- `page` / `limit` — parsed as numbers with defaults
- Keys are sorted alphabetically before JSON serialization

**Result:** "Nigerian females aged 20-45" and "Women aged 20-45 from Nigeria" produce identical filter objects and therefore identical cache keys — the second query hits the cache instead of the database.

### Design Decisions
- Deterministic — same input always produces same output, no randomness
- No AI or LLMs — pure rule-based transformation
- Keys sorted alphabetically so object key order never affects the cache key

---

## Part 3: CSV Data Ingestion

### Approach
Implemented streaming CSV ingestion at `POST /api/profiles/upload` (admin only).

**Key implementation decisions:**

**Streaming not loading into memory**
The uploaded file buffer is converted to a readable stream and piped through `csv-parser`. Rows are processed as they arrive — the entire file is never held in memory at once.

**Batch inserts of 500 rows**
Valid rows are collected into chunks of 500 and inserted using `Profile.insertMany()` with `{ ordered: false }`. This means a single bad row never blocks the rest of the batch.

**Validation per row**
Each row is validated before being added to the insert queue:
- Missing `name` → skipped as `missing_fields`
- Invalid or unrecognised `gender` → skipped as `invalid_gender`
- Negative or non-numeric `age` → skipped as `invalid_age`
- Malformed CSV row → skipped as `malformed`

**Duplicate detection**
Before each batch insert, existing profile names are checked in MongoDB. Rows with duplicate names are skipped and counted as `duplicate_name`.

**Partial failure handling**
If the upload fails midway, all rows already inserted remain in the database. The upload does not roll back. `insertMany` with `ordered: false` ensures partial batch failures don't stop processing.

**Cache invalidation**
After the upload completes, all list and search cache keys are invalidated so subsequent queries reflect the new data.

### Example Response
```json
{
  "status": "success",
  "total_rows": 2,
  "inserted": 2,
  "skipped": 0,
  "reasons": {
    "duplicate_name": 0,
    "invalid_age": 0,
    "invalid_gender": 0,
    "missing_fields": 0,
    "malformed": 0
  }
}
```

### Edge Cases Handled
- BOM (Byte Order Mark) stripped from CSV headers automatically
- Non-printable characters removed from header names
- Empty rows skipped gracefully
- Concurrent uploads supported — each upload processes independently
- File size limit: 100MB via multer configuration