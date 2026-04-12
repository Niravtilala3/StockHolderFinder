# Stockholder Finder - Project Roadmap

**Goal:** Build a scalable, production-ready platform to track, resolve, and search Indian stock market shareholders using publicly available data.

## Phase 1: Infrastructure & API Foundation

- **Goal:** Scaffold the NestJS monorepo (API + Worker), configure the local Docker Compose environment (Postgres, Redis, Elasticsearch, MinIO), and establish shared libraries.
- **Status:** ✅ Complete

## Phase 2: Database Models & Storage Layer

- **Goal:** Define TypeORM entities (Company, Shareholder, ShareholdingPattern, Holding), set up database migrations, and implement the MinIO storage wrapper for PDF persistence.
- **Status:** ✅ Complete

## Phase 3: Data Ingestion & Worker Queue

- **Goal:** Set up BullMQ for async processing. Build the ingestion worker to download public filings (PDFs) and extract tabular data using `pdf-parse`/OCR.
- **Status:** ✅ Complete

## Phase 4: Entity Resolution Engine

- **Goal:** Implement the fuzzy matching and normalization logic (using `fuzzball`) to map extracted shareholder names to unique entities, handling salutations and typos.
- **Status:** ✅ Complete

## Phase 5: Search & Public API

- **Goal:** Index normalized data into Elasticsearch for rapid querying. Build REST endpoints for search, company ownership patterns, and individual holdings tracking.
- **Status:** ⏳ Pending
