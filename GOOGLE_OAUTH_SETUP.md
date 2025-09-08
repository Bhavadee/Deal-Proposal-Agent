# Google OAuth Setup Guide

## 🚀 Complete Setup Checklist

### 1. Google Cloud Console Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create or select a project

### 2. Enable Required APIs
- [ ] **Google Drive API**: APIs & Services > Library > Search "Google Drive API" > Enable
- [ ] **People API**: APIs & Services > Library > Search "People API" > Enable

### 3. Configure OAuth Consent Screen
- [ ] Go to APIs & Services > OAuth consent screen
- [ ] Choose **External** user type
- [ ] Fill in required fields:
  - App name: "AI Proposal Generator"
  - User support email: your-email@example.com
  - Developer contact: your-email@example.com
- [ ] Add scopes:
  - `https://www.googleapis.com/auth/drive.readonly`
  - `https://www.googleapis.com/auth/userinfo.email` 
  - `https://www.googleapis.com/auth/userinfo.profile`

### 4. Create OAuth 2.0 Credentials
- [ ] Go to APIs & Services > Credentials
- [ ] Click "Create Credentials" > "OAuth 2.0 Client IDs"
- [ ] Application type: **Web application**
- [ ] Name: "AI Proposal Generator Web Client"
- [ ] **Authorized JavaScript origins**: 
  - `http://localhost:3001`
- [ ] **Authorized redirect URIs**: 
  - `http://localhost:4000/api/auth/google/callback`

### 5. Update Environment Variables
Replace these values in your `.env` file:

```bash
GOOGLE_CLIENT_ID=your_actual_client_id_from_google_console
GOOGLE_CLIENT_SECRET=your_actual_client_secret_from_google_console
SESSION_SECRET=generate_a_long_random_string_here
```

### 6. Generate Session Secret
Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 7. Test the Integration
1. Start backend: `npm run dev` (should run on port 4000)
2. Start frontend: `cd frontend && npm run dev` (should run on port 3001)
3. Navigate to http://localhost:3001/drive
4. Click "Sign in with Google"

## 🔧 Current Configuration
- Backend URL: http://localhost:4000
- Frontend URL: http://localhost:3001
- OAuth Callback: http://localhost:4000/api/auth/google/callback

## 🚨 Important Notes
- Make sure both URLs (localhost:3001 and localhost:4000) are added to Google Console
- The redirect URI must EXACTLY match what's in Google Console
- Keep your Client Secret secure and never commit it to version control

## 📝 Scopes Explanation
- `drive.readonly`: Read-only access to Google Drive files
- `userinfo.email`: Access to user's email address  
- `userinfo.profile`: Access to user's basic profile info (name, picture)

## 🐛 Troubleshooting
- **"redirect_uri_mismatch"**: Check that your redirect URI exactly matches Google Console
- **"access_denied"**: Make sure OAuth consent screen is properly configured
- **CORS errors**: Ensure frontend URL is in authorized origins
