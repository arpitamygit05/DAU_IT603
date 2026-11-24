/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          deep: '#52675A',
          DEFAULT: '#52675A',
          soft: '#829581',
          pale: '#E7ECE5',
          light: '#F0F4EF',
          dark: '#3D4F44',
        },
        beige: {
          warm: '#F4EFE5',
          DEFAULT: '#F4EFE5',
          light: '#FAF6EE',
          dark: '#E8DEC8',
        },
        cream: {
          DEFAULT: '#FBF9F4',
          surface: '#FFFFFF',
        },
        dark: {
          DEFAULT: '#292D29',
          heading: '#1E231E',
          body: '#292D29',
        },
        muted: {
          DEFAULT: '#77766F',
          light: '#9E9D96',
          border: '#D8D5CC',
        },
        terracotta: {
          DEFAULT: '#C26D53',
          light: '#F7EBE8',
          dark: '#9F533C',
        },
        gold: {
          DEFAULT: '#C5A059',
          light: '#F8F4EA',
          dark: '#9E7E38',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(41, 45, 41, 0.05), 0 1px 2px rgba(41, 45, 41, 0.03)',
        'refined': '0 4px 20px -2px rgba(82, 103, 90, 0.08), 0 2px 6px -1px rgba(82, 103, 90, 0.04)',
        'elevated': '0 12px 32px -4px rgba(82, 103, 90, 0.12), 0 4px 12px -2px rgba(82, 103, 90, 0.06)',
      }
    },
  },
  plugins: [],
}
