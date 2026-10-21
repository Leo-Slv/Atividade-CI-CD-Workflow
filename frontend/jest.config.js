const nextJest = require('next/jest');

const criarConfig = nextJest({ dir: './' });

module.exports = criarConfig({
  testEnvironment: 'node',
  collectCoverageFrom: ['lib/**/*.js'],
});
