import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BasicCard } from '../components/BasicCard'
import { TitleCard } from '../components/TitleCard'
import { HoverableCard } from '../components/HoverableCard'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-emotion)</title>
      </Head>
      <div>
        <TitleCard>Nextron with Emotion</TitleCard>
        <BasicCard>
          <Link href="/next">Go to next page</Link>
        </BasicCard>
        <HoverableCard>
          With <code>:hover</code>.
        </HoverableCard>
      </div>
    </React.Fragment>
  )
}
