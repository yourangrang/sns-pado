module.exports = {
  content: ['./src/**/*.tsx'],
   theme: {
    extend: {
      keyframes: {
        moveForever: {
          '0%': { transform: 'translateX(-90px)' },
          '100%': { transform: 'translateX(85px)' },
        },
      },
      animation: {
        'move-forever': 'moveForever 2s linear infinite',
      },
    },
  },
  plugins: [],
}
