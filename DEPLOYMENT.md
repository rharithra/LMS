# 🚀 Deployment Guide

## Environment Variables Required

### For Production Deployment:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-change-this
PORT=5001
REACT_APP_API_URL=https://yourdomain.com/api
```

### For Database:
- **SQLite** (current): Works for small deployments
- **PostgreSQL** (recommended): Better for production

## Deployment Options

### 1. Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Custom domain: Project Settings → Domains
4. Auto-deploys on git push

### 2. Railway
1. Connect GitHub at railway.app
2. Add PostgreSQL database addon
3. Set environment variables
4. Custom domain available

### 3. Render
1. Deploy backend as "Web Service"
2. Deploy frontend as "Static Site"
3. Add environment variables
4. Connect custom domain

## Custom Domain Setup

### DNS Configuration:
```
Type: CNAME
Name: www
Value: your-deployment-url.vercel.app

Type: A
Name: @
Value: [Deployment IP]
```

### SSL Certificate:
- Automatically provided by Vercel/Railway/Render
- No additional configuration needed

## Pre-deployment Checklist:
- [ ] Update JWT_SECRET to secure value
- [ ] Set REACT_APP_API_URL to your domain
- [ ] Configure CORS for your domain
- [ ] Test all features work
- [ ] Set up production database
- [ ] Configure email settings (if using)

## Database Migration:
If switching from SQLite to PostgreSQL:
1. Export data from SQLite
2. Set up PostgreSQL on Railway/Render
3. Import data to new database
4. Update DATABASE_URL environment variable 