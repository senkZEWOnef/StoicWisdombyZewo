# Full-Stack Deployment on Render

Deploy your complete StoicWisdom app (frontend + backend) on Render using a single repository.

## Deployment Steps

### 1. Create Web Service on Render
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository: `StoicWisdombyZewo`

### 2. Configure Build Settings
```
Root Directory: (leave blank - use repo root)
Build Command: cd server && npm install && npm run build
Start Command: cd server && npm start
```

### 3. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_jwt_secret_key
```

### 4. Advanced Settings
- **Auto-Deploy**: Yes
- **Branch**: main

## How It Works

1. **Build Phase**: 
   - Render runs `npm run build` in the `server/` directory
   - This builds your React frontend and copies it to `server/dist/`

2. **Runtime**: 
   - Express server serves API routes AND static files from `dist/`
   - React Router handled by fallback route

3. **Benefits**:
   - ✅ Single deployment
   - ✅ No CORS issues (same domain)
   - ✅ Automatic builds
   - ✅ One URL for everything

## Local Testing
```bash
cd server
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Your app will be available at the Render URL once deployed!