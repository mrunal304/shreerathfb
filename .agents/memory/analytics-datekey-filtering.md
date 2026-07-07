---
name: Analytics dateKey filtering
description: Why getAnalytics() must filter on visits.dateKey (string) not visits.createdAt (Date)
---

## Rule
All analytics aggregation pipelines must match on `"visits.dateKey"` (stored `yyyy-MM-dd` string) rather than `"visits.createdAt"` (BSON Date object).

## Why
- `visits.dateKey` is stored as `now.toISOString().split('T')[0]` (UTC date string at submission time)
- The frontend sends `dateFrom`/`dateTo` as `yyyy-MM-dd` strings (local date via date-fns `format()`)
- Filtering by `visits.createdAt` with UTC midnight boundaries caused mismatch when the server's UTC date and the client's local date differed, or due to subtle `new Date('yyyy-MM-dd')` parsing quirks
- `visits.dateKey` string comparison (`$gte`/`$lte` on `yyyy-MM-dd`) is always exact and timezone-proof
- `getFeedback()` already used dateKey for its filter — analytics must stay consistent

## How to apply
In any new aggregate that needs a date range filter on feedback visits, always use:
```js
{ $match: { "visits.dateKey": { $gte: fromKey, $lte: toKey } } }
```
For grouping by date in trends, use `"$visits.dateKey"` as the `_id` directly — no `$dateToString` needed.

The default range (no filter provided) computes fromKey/toKey with UTC getters (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`) to stay consistent with UTC-derived dateKey values.
