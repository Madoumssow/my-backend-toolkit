module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  verbose: true,
  forceExit: true,
  maxWorkers: 2,
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules[/\\\\](?!(@nestjs)[/\\\\])',
  ],
};
