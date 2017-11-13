'use strict';

module.exports = {
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: './test/.+.spec.tsx?',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test',
    '<rootDir>/examples'
  ]
};
