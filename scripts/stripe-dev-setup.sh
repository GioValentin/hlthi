#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Initialize an empty string for error messages
errors=""

# Check if script is being run from root directory
if [ ! -f ./pnpm-workspace.yaml ]; then
  errors+="Error: This script must be run from the root of the workspace\n"
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
  errors+="Error: Node is not installed. Please install Node.js before running this script.\n"
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  errors+="Error: pnpm is not installed. Please install pnpm before running this script.\n"
fi

# If there were any errors, print them and exit
if [ -n "$errors" ]; then
  echo -e $errors
  exit 1
fi

# Print versions for diagnostics
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

# Function to display progress message
function display_progress() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Display progress messages

# Execute ./setup.ts with ts-node
display_progress "Executing ./ottehr-setup.ts with ts-node..."
pnpx ts-node --project tsconfig.base.json ./scripts/stripe-setup.ts
