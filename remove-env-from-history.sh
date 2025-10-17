#!/bin/bash

# This script removes the .env file from Git history
# WARNING: This rewrites Git history and requires force push
# Only run this if you understand the implications

echo "⚠️  WARNING: This will rewrite Git history!"
echo "Make sure all team members are aware and have pushed their changes."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo "Removing .env from Git history..."

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ .env removed from Git history"
echo ""
echo "Next steps:"
echo "1. Force push to remote: git push origin --force --all"
echo "2. Force push tags: git push origin --force --tags"
echo "3. Tell all collaborators to rebase their work"
echo "4. Rotate all credentials in .env immediately"
echo ""
echo "⚠️  IMPORTANT: Rotate Supabase keys even if you don't run this script!"
echo "The old keys are in the Git history and should be considered compromised."
