#!/bin/bash

# CRITICAL WARNING: This script rewrites Git history
# 
# REQUIREMENTS before running:
# 1. All team members must be notified
# 2. All team members must push their pending changes
# 3. All team members must agree to rebase their work
# 4. Take a backup of your repository first
#
# This should ONLY be run if:
# - This is a private repository OR
# - All collaborators are coordinated and ready to handle the rebase
#
# For public/shared repositories, it's often better to:
# - Rotate the keys immediately
# - Document the security incident
# - Move forward rather than rewrite history

echo "⚠️  CRITICAL WARNING: This will rewrite Git history!"
echo ""
echo "Before proceeding, confirm:"
echo "1. ✓ All team members have been notified"
echo "2. ✓ All team members have pushed their changes"  
echo "3. ✓ All team members agree to rebase their work"
echo "4. ✓ You have a backup of the repository"
echo ""
echo "If you're unsure about ANY of the above, STOP and:"
echo "- Just rotate the Supabase keys instead"
echo "- Keep the history and move forward securely"
echo ""
read -p "Type 'I UNDERSTAND THE RISKS' to continue: " confirm

if [ "$confirm" != "I UNDERSTAND THE RISKS" ]; then
    echo ""
    echo "Aborted. Good choice!"
    echo ""
    echo "Instead, please:"
    echo "1. Rotate your Supabase keys immediately"
    echo "2. Update .env.local with new keys"
    echo "3. Deploy with new keys"
    exit 1
fi

echo ""
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
