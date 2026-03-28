import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { getNextronConfig } from '../../helpers/get-nextron-config'
import { getBaseConfigMain } from '../get-base-config-main'

export const getMainConfig = async () => {
  const { webpack: userWebpack } = await getNextronConfig()

  let config: webpack.Configuration = merge(await getBaseConfigMain(), {
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

  if (typeof userWebpack === 'function') {
    config = userWebpack(config, 'development')
  }

  return config
}
