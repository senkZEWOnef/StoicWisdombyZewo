# 🚀 Deployment Guide

## Current Issue
Your frontend is deployed to Netlify but tries to connect to `localhost:5001` which doesn't exist in production.

## Quick Solution: Deploy Backend to Railway

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 2. Deploy Backend
```bash
# Create a new repo for your backend
cd server
git init
git add .
git commit -m "Initial backend deployment"
git remote add origin https://github.com/yourusername/eudaimon-backend.git
git push -u origin main
```

### 3. Connect to Railway
- In Railway dashboard, click "New Project"
- Select "Deploy from GitHub repo"
- Choose your backend repo
- Railway will auto-detect Node.js and deploy

### 4. Add Environment Variables in Railway
- Go to your project → Variables tab
- Add:
  ```
  DATABASE_URL=your-neon-database-url
  JWT_SECRET=your-secret-key-change-in-production
  NODE_ENV=production
  ```

### 5. Update Netlify Environment Variables
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Add:
  ```
  VITE_API_URL=https://your-railway-app.railway.app
  ```

### 6. Redeploy Frontend
- In Netlify, go to Deploys → Trigger Deploy

## Alternative: Quick Test with ngrok

If you just want to test quickly:

```bash
# Install ngrok
npm install -g ngrok

# In terminal 1: Start your server
cd server
node index.js

# In terminal 2: Create public tunnel
ngrok http 5001
```

Then set `VITE_API_URL=https://your-ngrok-url.ngrok.io` in Netlify.

## Production-Ready Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Database      │
│   (Netlify)     │────│   (Railway)      │────│    (Neon)       │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

Your Neon database is already set up correctly and will work with any deployed backend.