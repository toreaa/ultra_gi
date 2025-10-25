module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin must be last
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@database': './src/database',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
            '@store': './src/store',
            '@theme': './src/theme',
            '@constants': './src/constants',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
