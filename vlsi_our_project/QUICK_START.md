# Quick Start Guide 🚀

Get up and running in 5 minutes!

## Prerequisites Check

```bash
node --version    # Need v18+
python --version  # Need 3.9+
```

## 1. Google OAuth Setup (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project → "VLSI Assistant"
3. APIs & Services → Credentials → Create OAuth Client ID
4. Add origins: `http://localhost:5173` and `http://localhost:5000`
5. Copy the Client ID

## 2. Get API Keys (1 minute)

- **OpenAI**: https://platform.openai.com/api-keys
- Copy your API key (starts with `sk-...`)

## 3. Backend Setup (1 minute)

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
```

## 4. Frontend Setup (1 minute)

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 5. Run! (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open:** http://localhost:5173

## Done! 🎉

You should see the login page. Click "Sign in with Google" and start coding!

---

### Troubleshooting

**Google button not showing?**
- Check `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`

**API errors?**
- Check `OPENAI_API_KEY` in `backend/.env`
- Verify you have OpenAI credits

**Port conflicts?**
- Change `PORT=5001` in `backend/.env`
- Update proxy in `frontend/vite.config.ts`

---

For detailed setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
