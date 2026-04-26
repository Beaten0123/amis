import { provides } from 'vitest/globals';

// Provide Jest globals for libraries that depend on them
provides('jest', {
  fn: () => {},
  fns: {},
  mocks: {}
});

// Load jest-canvas-mock after globals are set
import 'jest-canvas-mock';
