# YouTube Studio Clone - Makefile
# Common development tasks and commands

.PHONY: help install dev build test lint format clean docker-dev docker-prod deploy

# Default target
help:
	@echo "YouTube Studio Clone - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development server"
	@echo "  build       - Build for production"
	@echo "  preview     - Preview production build"
	@echo ""
	@echo "Testing:"
	@echo "  test        - Run all tests"
	@echo "  test-watch  - Run tests in watch mode"
	@echo "  test-ui     - Run tests with UI"
	@echo "  coverage    - Generate test coverage report"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        - Run ESLint"
	@echo "  lint-fix    - Fix ESLint issues"
	@echo "  format      - Format code with Prettier"
	@echo "  type-check  - Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  docker-dev  - Start development environment with Docker"
	@echo "  docker-prod - Start production environment with Docker"
	@echo "  docker-build- Build production Docker image"
	@echo "  docker-clean- Clean Docker images and containers"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy      - Deploy to production"
	@echo "  deploy-staging - Deploy to staging"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Clean build artifacts and dependencies"
	@echo "  update      - Update dependencies"
	@echo "  audit       - Run security audit"

# Development commands
install:
	@echo "Installing dependencies..."
	npm ci
	@echo "Dependencies installed successfully!"

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building for production..."
	npm run build
	@echo "Build completed successfully!"

preview:
	@echo "Starting preview server..."
	npm run preview

# Testing commands
test:
	@echo "Running tests..."
	npm run test

test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

test-ui:
	@echo "Running tests with UI..."
	npm run test:ui

coverage:
	@echo "Generating test coverage report..."
	npm run test:coverage
	@echo "Coverage report generated in coverage/ directory"

# Code quality commands
lint:
	@echo "Running ESLint..."
	npm run lint

lint-fix:
	@echo "Fixing ESLint issues..."
	npm run lint:fix

format:
	@echo "Formatting code with Prettier..."
	npm run format

type-check:
	@echo "Running TypeScript type checking..."
	npm run type-check

# Docker commands
docker-dev:
	@echo "Starting development environment with Docker..."
	docker-compose --profile dev up --build

docker-prod:
	@echo "Starting production environment with Docker..."
	docker-compose --profile prod up --build -d

docker-build:
	@echo "Building production Docker image..."
	docker build -t youtube-studio-clone .

docker-clean:
	@echo "Cleaning Docker images and containers..."
	docker-compose down --volumes --remove-orphans
	docker system prune -f

# Deployment commands
deploy:
	@echo "Deploying to production..."
	npm run build
	npm run deploy
	@echo "Deployment completed!"

deploy-staging:
	@echo "Deploying to staging..."
	npm run build
	npm run deploy:staging
	@echo "Staging deployment completed!"

# Maintenance commands
clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage
	rm -rf .vite
	rm -rf .turbo
	npm cache clean --force
	@echo "Cleanup completed!"

update:
	@echo "Updating dependencies..."
	npm update
	npm audit fix
	@echo "Dependencies updated!"

audit:
	@echo "Running security audit..."
	npm audit
	npm run audit:deps

# Setup commands for new developers
setup:
	@echo "Setting up development environment..."
	make install
	cp .env.example .env
	@echo "Please configure your .env file with appropriate values"
	@echo "Setup completed! Run 'make dev' to start development server"

# Performance commands
analyze:
	@echo "Analyzing bundle size..."
	npm run build:analyze

lighthouse:
	@echo "Running Lighthouse performance audit..."
	npm run lighthouse

# Database commands (if applicable)
db-migrate:
	@echo "Running database migrations..."
	npm run db:migrate

db-seed:
	@echo "Seeding database..."
	npm run db:seed

db-reset:
	@echo "Resetting database..."
	npm run db:reset

# Git hooks setup
hooks:
	@echo "Setting up Git hooks..."
	npx husky install
	npx husky add .husky/pre-commit "npm run lint-staged"
	npx husky add .husky/commit-msg "npm run commitlint"
	@echo "Git hooks configured!"

# Full setup for CI/CD
ci-setup:
	@echo "Setting up CI/CD environment..."
	make install
	make lint
	make type-check
	make test
	make build
	@echo "CI/CD setup completed!"