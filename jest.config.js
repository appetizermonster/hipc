'use strict';

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: './test/.+.spec.tsx?',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test',
    '<rootDir>/examples'
  ],
  modulePaths: ["<rootDir>/src/"]
};
