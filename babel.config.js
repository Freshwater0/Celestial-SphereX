module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@components': './src/components',
        '@pages': './src/pages',
        '@services': './src/services',
        '@contexts': './src/contexts',
        '@utils': './src/utils'
      }
    }],
    ['@babel/plugin-transform-modules-commonjs', {
      allowTopLevelThis: true
    }],
    ['@babel/plugin-proposal-class-properties', { 
      loose: true 
    }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        '@babel/preset-react'
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', {
          allowTopLevelThis: true
        }]
      ]
    }
  },
  sourceMaps: true,
  comments: false,
  ignore: ["node_modules"]
};
