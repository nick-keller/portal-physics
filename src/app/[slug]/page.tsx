import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ScenarioView } from "@/components/scenario-view"
import { getScenario, scenarios } from "@/scenarios"

export function generateStaticParams() {
  return scenarios.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const scenario = getScenario(slug)
  return { title: scenario ? `${scenario.title} · Portal physics` : "Portal physics" }
}

export default function ScenarioPage({ params }: PageProps<"/[slug]">) {
  // Params are URL data: read them inside Suspense so navigation stays instant.
  return (
    <Suspense fallback={<div className="h-dvh bg-[var(--blueprint-bg)]" />}>
      <Scenario params={params} />
    </Suspense>
  )
}

async function Scenario({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params
  if (!getScenario(slug)) notFound()
  return <ScenarioView key={slug} slug={slug} />
}
