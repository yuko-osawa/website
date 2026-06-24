.PHONY: help build up down sheets test-sheets logs shell clean deepclean archive

# Default target
help:
	@echo ""
	@echo "Workshop Site — Local Dev"
	@echo ""
	@echo "  make build        Build the Docker image (run once, or after Gemfile changes)"
	@echo "  make up           Start Jekyll dev server at http://localhost:4000"
	@echo "  make down         Stop all containers"
	@echo "  make sheets       Download CSVs from Google Sheets and convert to YAML"
	@echo "  make test-sheets  Check connectivity to all Google Sheets URLs in .env"
	@echo "  make logs         Tail Jekyll server logs"
	@echo "  make shell        Open a shell inside the Jekyll container"
	@echo "  make clean        Remove generated _data/*.csv and _data/*.yml files"
	@echo "  make deepclean    Remove all gitignored files (generated + debug artifacts)"
	@echo "  make archive      Create a tar.gz of repository-worthy files in /tmp/"
	@echo ""

# Build the Docker image
build:
	docker compose build

# Start Jekyll dev server (builds image if needed)
up:
	@if [ ! -f .env ]; then \
		echo "WARNING: .env not found — copying from .env.example"; \
		cp .env.example .env; \
	fi
	docker compose up jekyll

# Stop containers
down:
	docker compose down

# Fetch sheets and convert — requires .env with real URLs
sheets:
	@if [ ! -f .env ]; then \
		echo "ERROR: .env not found. Copy .env.example to .env and fill in your sheet URLs."; \
		exit 1; \
	fi
	docker compose run --rm sheets

# Test Google Sheets connectivity
test-sheets:
	@./scripts/test-sheets.sh

# Tail logs
logs:
	docker compose logs -f jekyll

# Shell inside Jekyll container
shell:
	docker compose run --rm --entrypoint bash jekyll

# Remove generated data files
clean:
	rm -f _data/*.csv _data/*.yml

# Remove everything excluded from git (generated + debug artifacts)
# Safe to run before a commit — leaves only what belongs in the repository
deepclean: clean
	rm -rf _site/ .jekyll-cache/ .jekyll-metadata
	rm -rf .csv-cache/
	rm -rf node_modules/
	rm -rf .bundle/ vendor/
	rm -rf .claude/ .playwright-mcp/
	rm -f *.png *.swp *.swo .DS_Store

# Create a tar.gz of the repository-worthy files (mirrors .gitignore exclusions)
# Output: /tmp/training-$(date).tar.gz
archive:
	@ARCHIVE=/tmp/training-$$(date +%Y%m%d-%H%M%S).tar.gz; \
	tar czf "$$ARCHIVE" \
		--exclude='.env' \
		--exclude='_site' \
		--exclude='.jekyll-cache' \
		--exclude='.jekyll-metadata' \
		--exclude='.csv-cache' \
		--exclude='_data/*.yml' \
		--exclude='_data/*.csv' \
		--exclude='.bundle' \
		--exclude='vendor' \
		--exclude='node_modules' \
		--exclude='.DS_Store' \
		--exclude='*.swp' \
		--exclude='*.swo' \
		--exclude='.claude' \
		--exclude='.playwright-mcp' \
		--exclude='*.png' \
		--exclude='CLAUDE.md' \
		. ; \
	echo "Archive created: $$ARCHIVE"
