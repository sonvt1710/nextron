import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { getBaseConfigPreload } from '../get-base-config-preload'

export const getPreloadConfig = async () => {
  const config: webpack.Configuration = merge(await getBaseConfigPreload(), {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
      }),
      new webpack.LoaderOptionsPlugin({
        debug: true,
      }),
    ],
  })

  return config
}
