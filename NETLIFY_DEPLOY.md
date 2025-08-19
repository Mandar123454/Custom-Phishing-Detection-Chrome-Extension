# Netlify CLI Deployment Instructions

## Prerequisites
- Node.js and npm installed
- Netlify CLI installed (`npm install -g netlify-cli`)

## Steps to Deploy

1. Install Netlify CLI if you haven't already:
   ```
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```
   netlify login
   ```

3. Initialize Netlify in this project:
   ```
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts to select your team and site name

4. Deploy your site:
   ```
   netlify deploy --prod
   ```

## Manual Deployment Steps

If you prefer using the Netlify web interface:

1. Go to https://app.netlify.com/
2. Sign up or log in (can use GitHub, GitLab, or Bitbucket account)
3. Click "Import from Git" or "New site from Git"
4. Select your Git provider and authorize Netlify
5. Select your repository
6. Configure build settings:
   - Build command: (leave blank)
   - Publish directory: .
7. Click "Deploy site"
