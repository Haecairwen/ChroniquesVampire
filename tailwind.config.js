module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        night: {
          50: '#f4f4f6',
          100: '#e5e5ea',
          200: '#c9c9d2',
          300: '#a3a3b2',
          400: '#76768a',
          500: '#54546a',
          600: '#3d3d4f',
          700: '#2a2a38',
          800: '#1c1c26',
          900: '#121119',
          950: '#09090d',
        },
        blood: {
          50: '#fdf2f2',
          100: '#fbe1e2',
          200: '#f6c1c4',
          300: '#ed969c',
          400: '#e0636d',
          500: '#cc3d49',
          600: '#ab2530',
          700: '#841c25',
          800: '#5e151b',
          900: '#3f1014',
          950: '#260a0c',
        },
        gilt: {
          50: '#fbf8ee',
          100: '#f6ecce',
          200: '#ecd89c',
          300: '#ddbd66',
          400: '#cda042',
          500: '#b8842f',
          600: '#966725',
          700: '#75501f',
          800: '#583c1b',
          900: '#443018',
          950: '#271a0c',
        },
        parchment: {
          50: '#fdfcf7',
          100: '#f8f1de',
          200: '#ecdfc0',
          300: '#dcc89c',
          400: '#c7ab78',
          500: '#ad8e5d',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"EB Garamond"', 'serif'],
      },
      borderColor: {
        DEFAULT: '#2a2a38',
      },
      maxHeight: {
        '1/3': '33.333333%',
        '2/5': '40%',
        '1/2': '50%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
