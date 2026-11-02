import { redirect } from "next/navigation"
import { scenarios } from "@/scenarios"

export default function Home() {
  redirect(`/${scenarios[0].slug}`)
}
