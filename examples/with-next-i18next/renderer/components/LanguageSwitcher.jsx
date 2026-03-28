import Link from 'next/link'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import i18next from '../../next-i18next.config.cjs'

const localeNames = {
  de: 'Deutsch',
  en: 'English',
}
export default function LanguageSwitcher() {
  const {
    i18n: { language: locale },
  } = useTranslation()
  const { pathname } = useRouter()

  useEffect(() => {
    window.ipc.setLocale(locale)
    console.log('locale:', locale)
  }, [locale])

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {i18next.i18n.locales.map((locale_) => {
        return (
          <Link
            key={locale_}
            passHref
            href={pathname.replace('[locale]', locale_)}
          >
            {localeNames[locale_]}
          </Link>
        )
      })}
    </div>
  )
}
