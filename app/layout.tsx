import { Metadata } from 'next'
import ThemeRegistry from './ThemeRegistry'
import './global.css'
import { fetch_kg_schema } from '@/utils/initialize'
import React from 'react'
import Head from 'next/head'

export async function generateMetadata(): Promise<Metadata> {
 
  // fetch data
  const {header} = await fetch_kg_schema()
  // optionally access and extend (rather than replace) parent metadata
  const metadata: Metadata = {
    title: header.icon.faviconTitle || header.title,
    description: 'Search for subnetworks within the ChEA-KG GRN by entering one or two TFs. The background GRN contains 131,181 signed and directed TF-TF regulatory relationships between 1559 source and 700 target human transcription factors.',
    icons: {
      icon: header.icon.favicon
    },
    openGraph: {
      title: 'ChEA-KG',
      description: 'Search for subnetworks within the ChEA-KG GRN by entering one or two TFs. The background GRN contains 131,181 signed and directed TF-TF regulatory relationships between 1,559 target and 700 source human transcription factors.',
      url: 'https://chea-kg.maayanlab.cloud/',
      siteName: 'ChEA-KG',
      images: [
        {
          url:'https://chea-kg.maayanlab.cloud/hgrnchear_logo.png',
          width: 1024,
          height: 998
        }
      ],
      locale:'en_US',
      type: 'website'
    }

  }
  return metadata
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const schema = await fetch_kg_schema()
  return (
    <html lang="en">
        <body>
          <ThemeRegistry options={{ key: 'mui' }} theme={schema.ui_theme || "cfde_theme"}>
            {children}
          </ThemeRegistry>
        </body>
    </html>
  )
}
