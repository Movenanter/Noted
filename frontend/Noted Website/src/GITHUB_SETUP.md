# How to Move Noted to GitHub

## Step 1: Initialize Git Repository Locally

First, make sure you're in your project directory, then run these commands in your terminal:

```bash
# Initialize a new Git repository
git init

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit: Noted app with Mentra Live glasses integration"
```

## Step 2: Create a Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `noted-app` (or your preferred name)
   - **Description**: "AI-powered learning platform for Mentra Live glasses with timeline, highlights, and summaries"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (since you already have code)
5. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote origin (replace YOUR_USERNAME and REPOSITORY_NAME)
git remote add origin https://github.com/YOUR_USERNAME/noted-app.git

# Rename your main branch to 'main' (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Step 4: Create a README.md

```bash
# Create a comprehensive README
cat > README.md << 'EOF'
# Noted

AI-powered learning platform that transforms Mentra Live glasses recordings into searchable timelines, instant highlights, and intelligent summaries.

## Features

- **Searchable Timeline**: Navigate recordings like YouTube chapters with AI-generated transcripts
- **"Mark This" Highlights**: Voice-activated bookmarking during recording sessions
- **Auto-Summary & Digest**: AI-generated summaries with keyword highlighting and review cards

## Tech Stack

- React + TypeScript
- Tailwind CSS v4
- ShadCN/UI Components
- Mentra Live Glasses Integration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Configure Mentra Live glasses integration (see AI_INTEGRATION_SETUP.md)

## Use Cases

- **Students**: Review equation derivations with synchronized board snapshots
- **Professionals**: Revisit client meeting decisions with whiteboard notes
- **Journalists**: Search interviews by keyword to find exact quotes with image references

## Configuration

Copy `env.example` to `.env.local` and configure your API keys for AI integrations.

## License

MIT
EOF

# Add and commit the README
git add README.md
git commit -m "Add comprehensive README"
git push
```

## Step 5: Clean Up Legacy Files and Set Up .gitignore

```bash
# Remove legacy HTML files that are no longer needed
rm -f index.html flashcards.html noteworthy.html

# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Legacy HTML files (not needed for React app)
*.html
!index.html

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# temporary folders
tmp/
temp/
EOF

# Add and commit .gitignore
git add .gitignore
git commit -m "Add .gitignore and remove legacy HTML files"
git push
```

## Step 6: Set Up Package.json (if needed)

```bash
# Create package.json if it doesn't exist
cat > package.json << 'EOF'
{
  "name": "noted-app",
  "version": "1.0.0",
  "description": "AI-powered learning platform for Mentra Live glasses",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "motion": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "tailwindcss": "^4.0.0"
  },
  "keywords": [
    "ai",
    "learning",
    "mentra-live",
    "smart-glasses",
    "education",
    "react",
    "typescript"
  ],
  "author": "Your Name",
  "license": "MIT"
}
EOF

git add package.json
git commit -m "Add package.json"
git push
```

## Step 7: Optional - Set Up GitHub Actions (CI/CD)

```bash
# Create GitHub Actions workflow directory
mkdir -p .github/workflows

# Create deployment workflow
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
EOF

git add .github/
git commit -m "Add GitHub Actions deployment workflow"
git push
```

## Step 8: Access Your Repository

Your repository will be available at:
`https://github.com/YOUR_USERNAME/noted-app`

## Next Steps

1. **Enable GitHub Pages** (if you want free hosting):
   - Go to repository Settings > Pages
   - Select "GitHub Actions" as source
   - Your app will be live at `https://YOUR_USERNAME.github.io/noted-app`

2. **Set up branch protection**:
   - Go to Settings > Branches
   - Add protection rules for main branch

3. **Add collaborators**:
   - Go to Settings > Collaborators
   - Invite team members

4. **Create issues and project boards**:
   - Use GitHub Issues for bug tracking
   - Set up project boards for feature planning

## Useful Git Commands for Future Development

```bash
# Check status
git status

# Add specific files
git add filename.tsx

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## Repository Structure

Your final repository structure will look like this:

```
noted-app/
├── README.md
├── package.json
├── .gitignore
├── AI_INTEGRATION_SETUP.md
├── App.tsx
├── components/
│   ├── ui/                    # ShadCN UI components
│   ├── figma/                 # Figma integration components
│   ├── home-page.tsx
│   ├── navigation.tsx
│   ├── conversation-timeline.tsx
│   ├── highlights.tsx
│   ├── quick-summary.tsx
│   ├── contact-page.tsx
│   ├── help-page.tsx
│   └── footer.tsx
├── styles/
│   └── globals.css            # Tailwind v4 CSS
├── config/
│   └── env.ts                 # Environment configuration
├── types/
│   └── ai-integration.ts      # TypeScript definitions
├── services/
│   └── ai-service.ts          # AI integration services
├── hooks/
│   └── use-ai-generation.ts   # Custom React hooks
├── imports/                   # Figma imported assets
├── guidelines/
│   └── Guidelines.md          # Development guidelines
├── env.example               # Environment template
└── .github/workflows/        # CI/CD automation
```

Now your Noted app is ready for collaborative development on GitHub! 🚀