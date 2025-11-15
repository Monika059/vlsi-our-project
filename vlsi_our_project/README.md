<<<<<<< HEAD
=======




# Findings
- **[README.md](cci:7://file:///e:/project/README.md:0:0-0:0)**: Located at project root [README.md](cci:7://file:///e:/project/README.md:0:0-0:0). Full contents below.

```markdown
>>>>>>> dbeb7303d1a195842f36421c0215c764d016576a
# AI-powered VLSI Design Assistant 🔬

An intelligent educational platform designed for Electronics and Communication Engineering students to master VLSI design and Verilog coding with AI-powered assistance.

## 🎯 Key Features

- **🔐 Secure Google Authentication**: Sign in securely with your Google account
- **🤖 Real-time Error Detection**: Instant syntax and semantic error identification in Verilog code
- **🐛 Intelligent Debugging**: AI-powered suggestions to fix common and complex issues
- **⚡ Code Optimization**: Automated recommendations for better design practices
- **📊 Waveform Visualization**: Interactive waveform viewer for simulation results
- **📚 Educational Guidance**: Context-aware explanations and learning resources
- **💻 Interactive Code Editor**: Syntax highlighting and auto-completion for Verilog
- **🔧 Simulation Integration**: Built-in support for Icarus Verilog and other simulators

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Icarus Verilog (optional, for simulation)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Set up Google OAuth 2.0**

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Navigate to **APIs & Services** > **Credentials**
   
   d. Click **Create Credentials** > **OAuth 2.0 Client ID**
   
   e. Configure the OAuth consent screen if prompted
   
   f. Select **Web application** as the application type
   
   g. Add authorized JavaScript origins:
      - `http://localhost:5173`
      - `http://localhost:5000`
   
   h. Add authorized redirect URIs:
      - `http://localhost:5173`
   
   i. Copy the **Client ID** (you'll need this in step 4)

<<<<<<< HEAD
3. **Install Backend Dependencies**
=======
   * Also we have the github,facebook authentication.

4. **Install Backend Dependencies**
>>>>>>> dbeb7303d1a195842f36421c0215c764d016576a
```bash
cd backend
pip install -r requirements.txt
```

4. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

5. **Set up Environment Variables**

   **Backend** - Create a `.env` file in the `backend` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:5173
   ```

   **Frontend** - Create a `.env` file in the `frontend` directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

2. **Start the Frontend Development Server** (in a new terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.12  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

3. **Access the Application**
Open your browser and navigate to `http://localhost:5173`

You'll see the login page with **"AI-powered VLSI Design Assistant"** and a Google Sign-In button.

## 📚 Usage Guide

### Writing Verilog Code

1. Use the built-in code editor to write your Verilog modules
2. Get real-time syntax highlighting and error detection
3. Click "Analyze Code" to get AI-powered insights

### Debugging

1. Paste or write your Verilog code
2. The AI will identify errors and provide explanations
3. Get step-by-step fixes with educational context

### Simulation & Waveform Viewing

1. Write your testbench
2. Click "Simulate" to run the code
3. View interactive waveforms in the visualization panel

### Learning Mode

- Hover over suggestions to see detailed explanations
- Access educational resources for complex concepts
- Get guided tutorials for common design patterns

## 🏗️ Architecture

```
project/
├── backend/              # Python Flask API
│   ├── app.py           # Main application
│   ├── verilog_parser.py # Verilog analysis engine
│   ├── ai_assistant.py   # AI integration
│   └── simulator.py      # Simulation wrapper
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   └── utils/       # Utilities
│   └── public/
└── examples/            # Sample Verilog files
```

## 🛠️ Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Monaco Editor for code editing
- Recharts for waveform visualization
- Lucide React for icons

**Backend:**
- Python Flask
- OpenAI API for AI assistance
- PyVerilog for parsing (optional)
- Icarus Verilog for simulation

## 📖 Educational Focus

This tool is specifically designed for students learning:
- Digital Logic Design
- Verilog HDL
- VLSI Design Fundamentals
- RTL Design Principles
- Testbench Development
- Timing Analysis Basics

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built by Hack Nova team to empower the next generation of chip designers.
<<<<<<< HEAD
=======
```

# Status
- ✅ Provided the contents of [README.md](cci:7://file:///e:/project/README.md:0:0-0:0).
>>>>>>> dbeb7303d1a195842f36421c0215c764d016576a
