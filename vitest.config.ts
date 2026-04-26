import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      './vitest.setup.ts',
      './packages/amis-core/__tests__/jest.setup.js'
    ],
    include: ['packages/**/__tests__/**/*.test.{ts,tsx,js}'],
    exclude: ['**/node_modules/**', '/.rollup.cache/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['packages/*/src/**/*'],
      exclude: ['**/*.d.ts', '**/*.test.*', '**/__mocks__/**']
    },
    snapshotFormat: {
      escapeString: false,
      printBasicPrototype: false
    }
  },
  resolve: {
    alias: {
      'amis-ui': path.resolve(__dirname, 'packages/amis-ui/src/index.tsx'),
      'amis-core': path.resolve(__dirname, 'packages/amis-core/src/index.tsx'),
      'amis-formula': path.resolve(__dirname, 'packages/amis-formula/src/index.ts'),
      'office-viewer': path.resolve(__dirname, 'packages/office-viewer/src/index.ts'),
      'amis': path.resolve(__dirname, 'packages/amis/src/index.tsx')
    }
  },
  // 保持 Jest 兼容的模块映射
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
    '\\.svg\\.js$': '<rootDir>/__mocks__/svgJsMock.js',
    // Mock monaco-editor for tests
    '^monaco-editor$': path.resolve(__dirname, '__mocks__/monaco-editor.ts')
  }
});
