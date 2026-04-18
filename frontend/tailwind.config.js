export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      boxShadow: {
        glass: '0 30px 80px rgba(15, 23, 42, 0.5)',
        soft: '0 20px 60px rgba(15, 23, 42, 0.35)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
