# Fast Docs

## Migrating NodeJS server to Go: For Learning

- Preferred Stack: Chi + sqlc + pgx + PostgreSQL + slog
- Learning from the repo : [https://github.com/hatchet-dev/hatchet](https://github.com/hatchet-dev/hatchet)
- Before main logics, things to setup:
    1. [X] Init Go module, project structure
    2. [] Makefile + docker-compose (postgres) --skip
    3. [X] Config loading (env/godotenv)
    4. [X] slog setup
    5. [] Database migrations (goose) + first schema
    6. [] sqlc setup + codegen verified
    7. [] pgx connection pool wired up
    8. [] Chi server with request ID, loggin®g, recovery middleware
    9. [] Error handling strategy decided + helper written
    10. [] Linting (golangci-lint) + GitHub Actions workflow
    11. [] Unit test setup + GitHub Actions workflow
    12. [] First API

- Additinal Setup:
    - [] README.md with setup instructions from day one
    - [] CONTRIBUTING.md — how to run locally, PR guidelines
    - [] .env.example committed (never .env)
    - [] LICENSE file (MIT is standard for learning/open source projects)
    - [] Issue + PR templates in .github/