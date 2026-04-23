# GyanPath Monorepo Setup

## Run these commands locally to push to GitHub:

```bash
# 1. Navigate to your project folder
cd /path/to/gyanpath

# 2. Initialize git (if not done)
git init
git branch -M main

# 3. Add remote
git remote add origin https://github.com/JadavMadhavkumar/GyanPath.git

# 4. Create README if needed
echo "# GyanPath" > README.md
echo "An educational platform for Indian students" >> README.md

# 5. Add all files
git add .

# 6. First commit
git commit -m "Initial commit: GyanPath monorepo with mobile, backend, admin, shared packages"

# 7. Push to GitHub
git push -u origin main
```

## Project Structure (Monorepo)

```
gyanpath/
├── gyanpath-mobile/     # React Native mobile app
├── gyanpath-backend/    # Node.js/Express API
├── gyanpath-admin/     # Next.js admin dashboard
├── gyanpath-shared/     # Shared types, validators, utilities
├── docs/              # Documentation
├── design.md           # UI/UX Design System
└── README.md
```

## After First Push

Your GitHub repo will have all files. Each time you make changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```