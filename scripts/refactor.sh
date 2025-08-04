#!/bin/bash

# Comprehensive Refactoring and Optimization Script
# This script runs the comprehensive refactoring process

set -e

echo "🚀 Starting comprehensive refactoring and optimization..."

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please ensure npm is installed."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the refactoring script
echo "🔧 Running refactoring analysis and optimization..."
node scripts/refactor-optimize.js

echo "✅ Refactoring and optimization completed!"
echo "📋 Check the generated reports for details and recommendations."