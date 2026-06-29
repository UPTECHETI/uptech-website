/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './src/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:         '#0A1628',
          card:       '#0F1E35',
          'card-2':   '#132030',
          accent:     '#00D4F0',
          'teal-start': '#00D4F0',
          'teal-end':   '#0082A8',
          text:       '#FFFFFF',
          'text-sec': '#7A8BA8',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
