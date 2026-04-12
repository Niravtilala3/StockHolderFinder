---
autonomous: true
objective: 'Set up BullMQ, worker queues, and implement PDF scraping/text-extraction using pdf-parse.'
---

# Plan: Data Ingestion & Worker Queue

1. Install `pdf-parse` and type definitions.
2. In `apps/api/src/app.module.ts`, register BullMQ root module using `REDIS_HOST` configuration.
3. Register the `ingestion` queue in `api`.
4. In `apps/api/src/app.controller.ts`, inject the `ingestion` queue and create the `/api/v1/ingest/trigger` endpoint.
5. In `apps/worker/src/worker.module.ts`, register BullMQ root module and the `ingestion` queue.
6. Create `IngestionProcessor` decorated with `@Processor('ingestion')`.
7. Implement `process` in `IngestionProcessor`:
   - Fetch PDF from the given URL using native `fetch`.
   - Upload Buffer to `MinIO` using `StorageService`.
   - Parse Buffer to text using `pdf-parse`.
   - Return metrics / text sample to confirm successful processing.
