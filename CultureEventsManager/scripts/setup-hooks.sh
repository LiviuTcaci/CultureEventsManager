#!/bin/bash

# Create .husky directory if it doesn't exist
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run format:check
EOF

# Make the hook executable
chmod +x .husky/pre-commit

echo "Git hooks installed successfully!"
