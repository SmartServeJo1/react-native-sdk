import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  external: [
    'react',
    'react-native',
    'react-native-live-audio-stream',
    'react-native-audio-api',
    'react-native-reanimated',
    'react-native-svg',
    'react-native-linear-gradient',
    'react-native-permissions',
  ],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.js' : '.cjs' };
  },
});
