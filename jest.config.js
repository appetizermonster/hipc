'use strict';

module.exports = {
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '\.\/test\/.+\.spec\.tsx?',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};
