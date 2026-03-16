import Link from "next/link";
import RecentTrips from "../components/RecentTrips";
import { MdFlightTakeoff, MdDirectionsRun } from "react-icons/md";
import { FaBolt, FaCloudRain } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <header className="relative z-20 flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-12 backdrop-blur-md bg-white/5">
        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight group cursor-pointer">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
            <MdFlightTakeoff className="text-2xl text-white" />
          </div>
          <div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              GenAI
            </span>
            <span className="text-white"> Trip Planner</span>
          </div>
        </div>
        <nav className="flex gap-6 items-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors duration-200"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 active:scale-95"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center">
          <div className="mb-6 animate-bounce">
            <MdFlightTakeoff className="text-7xl text-blue-400 mx-auto drop-shadow-lg" />
          </div>
          <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
            Plan Your Dream Trip in Seconds
          </h1>
          <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            AI-powered personalized itineraries that account for travel times,
            weather, and smart local recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/plan-trip"
              className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Start Planning Now
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              View Dashboard
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              How it Works
            </h2>
            <p className="text-center text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
              Powered by advanced AI to create unforgettable travel experiences
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:border-blue-400/50 transition-all transform group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                    <FaBolt className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    AI-Powered Itineraries
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our advanced AI creates optimized daily schedules based on
                    your preferences, ensuring you make the most of every
                    moment.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:border-purple-400/50 transition-all transform group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <MdDirectionsRun className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    Smart Time Management
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    We automatically adjust for travel times between
                    destinations so you never rush and always arrive on time.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:border-cyan-400/50 transition-all transform group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                    <FaCloudRain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    Weather Adaptive
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Plans are intelligently adjusted based on real-time weather
                    forecasts, suggesting indoor activities when it rains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RecentTrips />
      </main>

      <footer className="relative z-10 border-t border-white/10 py-12 text-center text-sm text-gray-400 backdrop-blur-md bg-white/5">
        <p>
          © {new Date().getFullYear()} GenAI Trip Planner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
