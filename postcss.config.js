module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 3,
      autoprefixer: {
        grid: true,
        flexbox: 'no-2009'
      }
    }),
    require('autoprefixer')
  ]
};
