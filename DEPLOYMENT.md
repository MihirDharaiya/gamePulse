# GamePulse Deployment Guide

## Overview
This guide will help you deploy GamePulse to Vercel with Supabase as the database.

## Prerequisites
- Vercel account (free at vercel.com)
- Supabase project (already configured)
- GitHub repository with your code

## Step 1: Prepare Your Repository

### Frontend (Next.js)
1. Your frontend is already configured with API routes in `/src/app/api/`
2. The `vercel.json` file is configured for Next.js deployment

### Backend (FastAPI)
1. The `requirements.txt` file contains all necessary dependencies
2. The `vercel.json` file is configured for Python deployment

## Step 2: Deploy Backend to Vercel

1. **Push your code to GitHub** (if not already done)
2. **Go to Vercel Dashboard** and click "New Project"
3. **Import your GitHub repository**
4. **Configure the project**:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Output Directory: Leave empty
   - Install Command: Leave empty

5. **Add Environment Variables**:
   - `SUPABASE_URL`: Your Supabase database URL
   - `STEAM_API_KEY`: Your Steam API key
   - `YOUTUBE_API_KEY`: Your YouTube API key
   - `TWITCH_CLIENT_ID`: Your Twitch client ID
   - `TWITCH_CLIENT_SECRET`: Your Twitch client secret

6. **Deploy** and note the URL (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

1. **Create another Vercel project** for the frontend
2. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: `frontend/game-pulse-frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - `BACKEND_URL`: The URL from your backend deployment (e.g., `https://your-backend.vercel.app`)

4. **Deploy** the frontend

## Step 4: Configure CORS

Update your backend `app.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-domain.vercel.app"  # Add your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Test all features:
   - Dashboard
   - Games page
   - Creators page
   - Analytics page
   - Publishers page

## Step 6: Set Up Data Fetching

Your `fetch_data.py` script can be run locally or set up as a scheduled task:

1. **Local execution**: Run `python fetch_data.py` periodically
2. **Vercel Cron Jobs**: Set up a cron job to call your data fetching endpoint
3. **External scheduler**: Use services like cron-job.org

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your frontend URL is in the CORS allow_origins list
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Database Connection**: Verify your Supabase URL is correct
4. **API Keys**: Ensure all API keys are valid and have proper permissions

### Debugging:

1. Check Vercel function logs in the dashboard
2. Use browser developer tools to check network requests
3. Verify API responses in the Network tab

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth and 100 serverless function executions per day
- **Supabase**: Free tier includes 500MB database and 50,000 monthly active users
- **API Costs**: Steam, YouTube, and Twitch APIs may have usage limits

## Next Steps

1. Set up custom domain (optional)
2. Configure analytics (Google Analytics, etc.)
3. Set up monitoring and alerts
4. Implement caching strategies
5. Add rate limiting for API endpoints 