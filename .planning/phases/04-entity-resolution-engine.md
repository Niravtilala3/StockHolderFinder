---
autonomous: true
objective: 'Implement name normalization and fuzzy matching for entity resolution.'
---

# Plan: Entity Resolution Engine

1. Install `fuzzball` for string similarity algorithms.
2. In `libs/common/src/common.service.ts`:
   - Implement `normalizeName` to strip common prefixes (Mr, Mrs, Smt, etc) and special characters.
   - Implement `calculateSimilarity` using `fuzzball.ratio`.
   - Implement `findBestMatch` to match a new extracted name against known entities using a configurable threshold.
