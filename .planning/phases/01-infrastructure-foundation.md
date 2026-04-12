---
autonomous: true
objective: "Set up the foundational monorepo structure, Docker environment, and base dependencies."
---
# Plan: Infrastructure Foundation

1. Create `docker-compose.yml` with Postgres, Redis, Elasticsearch, MinIO.
2. Initialize NestJS application `api` as a monorepo.
3. Create `worker` application within the monorepo.
4. Create shared libraries `database`, `common`, `storage`.
5. Install core dependencies: `@nestjs/typeorm`, `pg`, `@nestjs/bullmq`, `bullmq`, `ioredis`, `@nestjs/elasticsearch`, `@nestjs/config`.
6. Add base `.env` configuration.