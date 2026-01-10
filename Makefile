SHELL := /usr/bin/env bash
.DEFAULT_GOAL := run

.PHONY: check-npm env install db-up db-down prisma-postgres prisma-mongo migrate run dev help

help:
	@echo "Targets:"
	@echo "  run        Install deps, start DBs, run migrations, start dev server"
	@echo "  migrate    Run Postgres + Mongo Prisma steps"
	@echo "  db-up      docker compose up -d"
	@echo "  db-down    docker compose down"

check-npm:
	@command -v npm >/dev/null 2>&1 || { \
		echo "npm not found. Install Node.js (which bundles npm) first."; \
		exit 1; \
	}


install: check-npm
	@npm install


build: install
	@npm run build


run: install 
	@npm run dev


dev: run