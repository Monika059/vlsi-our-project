import { useState } from 'react'
import { Cpu, Github, BookOpen, LogOut, User, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }
  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-lg">
                <Cpu className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI-powered VLSI Design Assistant</h1>
                <p className="text-sm text-gray-400">Your Personal Mentor for Verilog & Digital Design</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsTutorialOpen(true)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <BookOpen size={20} />
                <span className="hidden md:inline">Tutorials</span>
              </button>
              <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Github size={20} />
                <span className="hidden md:inline">GitHub</span>
              </a>

              {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
                  <div className="flex items-center gap-2">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name ?? 'User avatar'}
                        className="w-8 h-8 rounded-full border-2 border-primary-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <span className="text-white text-sm hidden md:inline">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsTutorialOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close tutorial"
            >
              <X size={20} />
            </button>

            <div className="p-6 space-y-4 text-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Project Title</h2>
                <p className="text-primary-300 font-semibold">AI-Driven VLSI Design Assistant for Students</p>
              </div>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Overview</h3>
                <p>
                  This project presents an AI-powered web application designed to serve as a personal mentor for Electronics and Communication Engineering (ECE) students learning VLSI (Very Large Scale Integration) design. The assistant empowers students by simplifying the complex and challenging process of digital circuit design, providing intelligent support for writing, debugging, optimizing Verilog code, and simulating circuits.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Problem Statement</h3>
                <p>
                  VLSI design education poses significant challenges for students, who must transition from theoretical knowledge to practical implementation. Beginners face difficulties with writing and debugging Verilog, understanding timing diagrams, and navigating complex Electronic Design Automation (EDA) tools, which are often expensive and not user-friendly for students. These hurdles slow student progress and limit effective learning.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Vision</h3>
                <p>
                  To create an AI-driven personal mentor that simplifies the VLSI design learning journey, making complex concepts accessible and providing interactive, real-time feedback. This platform aims to bridge the gap between classroom theory and hands-on-practice seamlessly, fostering deeper understanding and skill development.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Key Features</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-300">
                  <li><span className="font-semibold text-white">Real-time Error Detection:</span> Automatically detects syntax and logic errors in uploaded Verilog code, making debugging efficient.</li>
                  <li><span className="font-semibold text-white">AI-Powered Optimization Suggestions:</span> Provides intelligent recommendations to enhance code efficiency and circuit performance.</li>
                  <li><span className="font-semibold text-white">Automated Visualization:</span> Generates timing diagrams and waveforms automatically to help students grasp circuit behavior visually.</li>
                  <li><span className="font-semibold text-white">Simplified Educational Explanations:</span> Presents clear, easy-to-understand guidance instead of cryptic error logs.</li>
                  <li><span className="font-semibold text-white">Hardware Deployment Support:</span> Optionally enables deployment of designs on FPGA and microcontroller platforms such as Xilinx, Intel, STM32, and Arduino for real-world testing.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Innovation and Impact</h3>
                <p>
                  This project uniquely combines VLSI design, artificial intelligence, and education into a cohesive platform tailored for students. It prioritizes simplicity and clarity while enabling practical, career-aligned skills development. The result is a potential revolution in teaching digital design across academic institutions worldwide.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Technical Architecture</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-300">
                  <li><span className="font-semibold text-white">Backend:</span> Developed using Python frameworks Flask and FastAPI. AI functionalities employ PyTorch and TensorFlow.</li>
                  <li><span className="font-semibold text-white">Simulation:</span> Incorporates Icarus Verilog and Verilator for compiling and verifying designs.</li>
                  <li><span className="font-semibold text-white">Frontend:</span> Uses React.js with Monaco Editor for code editing and WaveDrom/GTKWave for waveform visualization.</li>
                  <li><span className="font-semibold text-white">Hardware Integration:</span> Supports FPGA and microcontroller targets for hardware implementation.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Team</h3>
                <p>
                  The project is developed by a dedicated team of four 2nd-year ECE students passionate about simplifying VLSI education and enabling peers to achieve mastery in chip design.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Conclusion</h3>
                <p>
                  The AI-Driven VLSI Design Assistant is an educational breakthrough that empowers students to design, debug, optimize, simulate, and deploy digital circuits with confidence. It addresses critical educational gaps and offers a scalable vision for the future of VLSI learning.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
