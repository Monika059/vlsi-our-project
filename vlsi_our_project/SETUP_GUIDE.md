# Complete Setup Guide - AI-powered VLSI Design Assistant

This guide will walk you through setting up the AI-powered VLSI Design Assistant with Google Authentication.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Icarus Verilog** (optional, for simulation) - [Download](http://iverilog.icarus.com/)

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
python --version  # Should show 3.9.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `VLSI Design Assistant`
5. Click **"Create"**

### Step 2: Enable Google+ API (if required)

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **"Enable"** (if not already enabled)

### Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: AI-powered VLSI Design Assistant
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. Skip the "Scopes" section (click **"Save and Continue"**)
7. Add test users (your email addresses that will use the app during development)
8. Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client ID"**
3. Select **"Web application"** as the application type
4. Enter a name: `VLSI Assistant Web Client`
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5173
   ```
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** - you'll need this!
   - It will look like: `1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-...`)

### Step 5: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Server Configuration
PORT=5000
FLASK_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173

# Simulation Configuration (optional)
IVERILOG_PATH=iverilog
VVP_PATH=vvp
```

**Replace** `sk-your-actual-openai-api-key-here` with your actual OpenAI API key.

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React
- React Router
- Google OAuth library
- Monaco Editor
- TailwindCSS
- And more...

### Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Replace** `your-google-client-id-here.apps.googleusercontent.com` with the Client ID you copied from Google Cloud Console.

---

## Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Running on http://127.0.0.1:5000
```

### Step 2: Start the Frontend Development Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:5173`
3. You should see the login page with **"AI-powered VLSI Design Assistant"**
4. Click the **"Sign in with Google"** button
5. Select your Google account
6. You'll be redirected to the dashboard

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure you've installed all dependencies:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Issue: Google Sign-In button not appearing

**Solutions**:
1. Check that `VITE_GOOGLE_CLIENT_ID` is set correctly in `frontend/.env`
2. Verify the Client ID is correct (copy it again from Google Cloud Console)
3. Clear browser cache and reload
4. Check browser console for errors (F12)

### Issue: "Redirect URI mismatch" error

**Solution**: 
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Make sure `http://localhost:5173` is in **Authorized redirect URIs**
4. Save and try again

### Issue: Backend API errors

**Solutions**:
1. Check that `OPENAI_API_KEY` is set correctly in `backend/.env`
2. Verify your OpenAI API key is valid
3. Check if you have API credits available
4. Look at backend terminal for error messages

### Issue: CORS errors

**Solution**: 
1. Make sure backend is running on port 5000
2. Check `ALLOWED_ORIGINS` in `backend/.env` is set to `http://localhost:5173`
3. Restart both backend and frontend servers

### Issue: Port already in use

**Solution**:

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Issue: Simulation not working

**Solution**:
1. Install Icarus Verilog from [http://iverilog.icarus.com/](http://iverilog.icarus.com/)
2. Add Icarus Verilog to your system PATH
3. Verify installation: `iverilog -v`
4. The app will use mock simulation data if Icarus Verilog is not available

---

## Testing the Application

### Test 1: Login

1. Go to `http://localhost:5173`
2. Click "Sign in with Google"
3. Authenticate with your Google account
4. You should be redirected to the dashboard

### Test 2: Code Analysis

1. In the dashboard, paste this sample code:
```verilog
module half_adder(
    input a, b,
    output sum, carry
);
    assign sum = a ^ b;
    assign carry = a & b;
endmodule
```
2. Click "Analyze Code"
3. You should see analysis results in the right panel

### Test 3: Templates

1. Click the "Templates" dropdown
2. Select "Full Adder"
3. The code should load in the editor
4. Click "Analyze Code" to verify it works

---

## Next Steps

- Explore different Verilog templates
- Try the debugging feature with intentionally broken code
- Use the optimization feature to improve your designs
- Run simulations (if Icarus Verilog is installed)
- Check out the educational resources section

---

## Support

If you encounter any issues not covered in this guide:

1. Check the main README.md
2. Review the error messages in browser console (F12)
3. Check backend terminal for Python errors
4. Ensure all environment variables are set correctly

---

## Security Notes

- Never commit `.env` files to version control
- Keep your API keys secret
- Use test accounts during development
- For production deployment, use HTTPS and proper OAuth redirect URIs

---

**Built by Hack Nova Team** 🚀
