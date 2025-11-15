# Installation Commands - Copy & Paste Guide

This file contains all commands you need to copy and paste to set up the project.

## 📋 Step-by-Step Commands

### 1. Install Backend Dependencies

```bash
cd backend
pip install flask==3.0.0 flask-cors==4.0.0 openai==1.12.0 python-dotenv==1.0.0 pyverilog==1.3.0 regex==2023.12.25 requests==2.31.0
```

Or use requirements.txt:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Create Backend .env File

**Windows PowerShell:**
```powershell
cd backend
New-Item -Path .env -ItemType File
notepad .env
```

**Windows CMD:**
```cmd
cd backend
type nul > .env
notepad .env
```

**macOS/Linux:**
```bash
cd backend
touch .env
nano .env
```

**Paste this content into .env:**
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
PORT=5000
FLASK_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
IVERILOG_PATH=iverilog
VVP_PATH=vvp
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- @react-oauth/google
- @monaco-editor/react
- axios
- lucide-react
- recharts
- tailwindcss
- And all other dependencies

### 4. Create Frontend .env File

**Windows PowerShell:**
```powershell
cd frontend
New-Item -Path .env -ItemType File
notepad .env
```

**Windows CMD:**
```cmd
cd frontend
type nul > .env
notepad .env
```

**macOS/Linux:**
```bash
cd frontend
touch .env
nano .env
```

**Paste this content into .env:**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 5. Start Backend Server

**Windows:**
```bash
cd backend
python app.py
```

**macOS/Linux:**
```bash
cd backend
python3 app.py
```

### 6. Start Frontend Server (New Terminal)

```bash
cd frontend
npm run dev
```

### 7. Open Application

```
http://localhost:5173
```

## 🔧 Optional: Install Icarus Verilog

### Windows
1. Download from: http://bleyer.org/icarus/
2. Run installer
3. Add to PATH during installation

### macOS (using Homebrew)
```bash
brew install icarus-verilog
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install iverilog
```

### Verify Installation
```bash
iverilog -v
```

## 🧪 Test Commands

### Test Backend
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "VLSI Design Assistant API",
  "version": "1.0.0"
}
```

### Test Frontend
Open browser to: `http://localhost:5173`

Should see the login page with "AI-powered VLSI Design Assistant"

## 🔄 Restart Commands

### Kill Processes if Ports are Busy

**Windows - Kill Port 5000:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Windows - Kill Port 5173:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

**macOS/Linux - Kill Port 5000:**
```bash
lsof -ti:5000 | xargs kill -9
```

**macOS/Linux - Kill Port 5173:**
```bash
lsof -ti:5173 | xargs kill -9
```

## 📦 Complete Fresh Install (All Commands)

Copy and paste this entire block:

```bash
# Backend Setup
cd backend
pip install -r requirements.txt

# Create backend .env (then edit with your keys)
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "PORT=5000" >> .env
echo "ALLOWED_ORIGINS=http://localhost:5173" >> .env

# Frontend Setup
cd ../frontend
npm install

# Create frontend .env (then edit with your Google Client ID)
echo "VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" > .env

# Start Backend (in one terminal)
cd ../backend
python app.py

# Start Frontend (in another terminal)
cd ../frontend
npm run dev
```

## 🎯 Quick Verification Checklist

After installation, verify:

```bash
# Check Python version
python --version  # Should be 3.9+

# Check Node version
node --version    # Should be 18+

# Check npm version
npm --version     # Should be 9+

# Check if backend dependencies installed
cd backend
pip list | grep flask

# Check if frontend dependencies installed
cd frontend
npm list react

# Check if .env files exist
cd backend
ls -la .env  # or dir .env on Windows

cd ../frontend
ls -la .env  # or dir .env on Windows
```

## 🚨 Common Issues & Fixes

### Issue: `pip: command not found`
```bash
# Try pip3 instead
pip3 install -r requirements.txt

# Or use python -m pip
python -m pip install -r requirements.txt
```

### Issue: `npm: command not found`
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### Issue: Permission denied
```bash
# macOS/Linux - Use sudo
sudo pip install -r requirements.txt

# Or use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Issue: Port already in use
```bash
# Change backend port in backend/.env
PORT=5001

# Update frontend proxy in frontend/vite.config.ts
# Change target to 'http://localhost:5001'
```

## 🎓 Development Workflow

### Daily Startup
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Update Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt --upgrade

# Frontend
cd frontend
npm update
```

### Clear Cache
```bash
# Frontend
cd frontend
rm -rf node_modules
rm package-lock.json
npm install

# Backend
cd backend
pip cache purge
pip install -r requirements.txt
```

## 📝 Environment Variables Reference

### Backend .env
| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| OPENAI_API_KEY | Yes | sk-proj-... | Your OpenAI API key |
| PORT | No | 5000 | Backend server port |
| FLASK_ENV | No | development | Flask environment |
| ALLOWED_ORIGINS | Yes | http://localhost:5173 | CORS allowed origins |
| IVERILOG_PATH | No | iverilog | Path to iverilog |
| VVP_PATH | No | vvp | Path to vvp |

### Frontend .env
| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| VITE_GOOGLE_CLIENT_ID | Yes | 123...apps.googleusercontent.com | Google OAuth Client ID |

## 🔐 Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or login
3. Navigate to API Keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Paste in `backend/.env`

### Google Client ID
1. Go to https://console.cloud.google.com/
2. Create new project
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized origins: `http://localhost:5173`
6. Copy Client ID
7. Paste in `frontend/.env`

## ✅ Installation Complete!

Once all commands are executed:
1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. Open browser to http://localhost:5173
4. Sign in with Google
5. Start coding Verilog!

---

**Need Help?** Check SETUP_GUIDE.md for detailed instructions.
