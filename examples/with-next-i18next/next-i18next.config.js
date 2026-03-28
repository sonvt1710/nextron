import path from 'path'

/** @type {import('next-i18next').UserConfig} */
export default {
  i18n: {
    defaultLocale: 'en',
    locales: ['de', 'en'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath:
    typeof window === 'undefined'
      ? path.resolve('./renderer/public/locales')
      : '/locales',
}
