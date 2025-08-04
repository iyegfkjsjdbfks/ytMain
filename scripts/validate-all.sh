#!/bin/bash

# Comprehensive Validation Script
# Runs all key checks to ensure codebase health

echo "🧪 Starting comprehensive validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

run_check() {
    local name="$1"
    local command="$2"
    
    echo -e "\n🔍 Running: $name"
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name: PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $name: FAILED${NC}"
        ((FAILED++))
    fi
}

# Core validation checks
run_check "TypeScript Compilation" "npm run type-check"
run_check "ESLint Validation" "npm run lint"
run_check "Production Build" "npm run build:optimized"
run_check "Memory-Safe Tests" "timeout 60 bash -c \"NODE_OPTIONS='--max-old-space-size=2048' npx vitest run test/services/buildUrl.test.ts\""

# Security and dependency checks
run_check "Security Audit" "npm audit --audit-level high"
run_check "Dependency Check" "npm outdated || true"

# Summary
echo -e "\n" "="*60
echo -e "📊 VALIDATION SUMMARY"
echo -e "="*60
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All validations passed! Codebase is healthy.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some validations failed. Review the issues above.${NC}"
    exit 1
fi