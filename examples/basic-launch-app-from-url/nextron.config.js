module.exports = {
  webpack: (defaultConfig) =>
    Object.assign(defaultConfig, {
      entry: {
        main: './main/main.ts',
        preload: './main/preload.ts',
      },
    }),
}
