/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Indica que observe todos los archivos en src con extensión js, jsx, ts o tsx
    './public/index.html', // Incluye también el archivo index.html si es necesario
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
