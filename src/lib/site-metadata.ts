import type { Metadata } from "next"

export const SITE_URL = "https://portalphysics.xyz"
export const SITE_NAME = "Portal physics"
export const SITE_DESCRIPTION = "An interactive, step-by-step demonstration of how 2D portals work."

const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "A piston slams a portal down onto a cube: does the cube plop out (A) or get launched (B)?",
}

/** Full sharing metadata for a page; child pages must pass everything since openGraph/twitter are not deep-merged. */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
}: {
  title: string
  description?: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  }
}
