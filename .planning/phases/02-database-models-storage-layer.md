---
autonomous: true
objective: 'Implement database layer (entities) and persistent storage (MinIO wrappers).'
---

# Plan: Database Models & Storage Layer

1. Create `Company` entity with basic market identifiers.
2. Create `Shareholder` entity to store unique normalized identities.
3. Create `ShareholdingPattern` entity storing report metadata (quarter, year, total shares).
4. Create `Holding` junction entity defining ownership specifics.
5. Create MinIO `StorageService` configuration and module to upload/retrieve PDF reports.
6. Make `database` and `storage` modules ready to export logic to `api` and `worker`.
