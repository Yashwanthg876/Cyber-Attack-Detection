/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080C14",      // Deep near-black background
          card: "#0F1626",    // Dark navy card background
          border: "#1E293B",  // Slate border
          input: "#131C2E",   // Input backgrounds
          text: "#F8FAFC",    // Pure white/gray text
          muted: "#94A3B8",   // Muted slate text
        },
        brand: {
          primary: "#3B82F6", // Electric blue
          glow: "#00F0FF",    // Neon cyan glow accent
          success: "#10B981", // Matrix green
          warning: "#F59E0B", // Amber alert
          danger: "#EF4444",  // Critical incident red
          purple: "#8B5CF6",  // Secondary purple accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.4)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
