import { NextResponse } from "next/server"

type YellowcakeRow = Record<string, unknown>

interface YellowcakeStreamPayload {
  success?: boolean
  data?: YellowcakeRow[]
}

async function readYellowcakeStream(stream: ReadableStream<Uint8Array>): Promise<YellowcakeStreamPayload> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let lastPayload: YellowcakeStreamPayload = {}

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const event of events) {
      const lines = event.split("\n")
      const dataLine = lines.find((line) => line.startsWith("data:"))
      const eventLine = lines.find((line) => line.startsWith("event:"))

      if (!dataLine) continue

      try {
        const payload = JSON.parse(dataLine.replace(/^data:\s*/, ""))
        lastPayload = payload

        if (eventLine?.includes("complete")) {
          return payload
        }
      } catch (error) {
        console.error("Failed to parse Yellowcake stream payload", error)
      }
    }
  }

  return lastPayload
}

function normalizeListing(item: YellowcakeRow, source: string, fallbackUrl: string) {
  const asString = (val: unknown) => (typeof val === "string" ? val : undefined)
  const toNumber = (val: unknown) => {
    if (typeof val === "number") return val
    if (typeof val === "string") {
      const num = Number.parseInt(val.replace(/\D+/g, ""), 10)
      return Number.isFinite(num) ? num : undefined
    }
    return undefined
  }

  return {
    id: asString(item.id) || crypto.randomUUID(),
    title: asString(item.title),
    year: toNumber(item.year),
    make: asString(item.make),
    model: asString(item.model),
    color: asString(item.color),
    mileage_km: toNumber(item.mileage_km),
    price_cad: toNumber(item.price_cad),
    location: asString(item.location),
    source,
    listing_url: asString(item.listing_url) || fallbackUrl,
  }
}

function buildPrompt(make: string, model: string, city: string, color?: string) {
  return [
    `Extract up to 10 car listings from this page for ${[color, make, model, city].filter(Boolean).join(" ")}.`,
    color ? `Only include listings where the color is ${color}. If color is missing or not ${color}, skip the listing.` : "",
    "For each listing, return: listing_url, title, year (number, if shown), make (if shown), model (if shown), color (if shown), mileage_km (number only, if shown), price_cad (number only, if shown), location (if shown).",
    "If a field is missing, return null. Return results as a JSON array only.",
  ].join(" ")
}

function buildTargetUrl(baseUrl: string, query: string[], _color?: string) {
  const [make, model, city] = query
  const slug = [make, model]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  try {
    const url = new URL(baseUrl)
    if (slug) {
      const cleanPath = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname
      url.pathname = `${cleanPath}/${slug}`
    }
    if (city) url.searchParams.set("q", city)
    url.searchParams.set("sortField", "price")
    url.searchParams.set("sortDirection", "DESC")
    return { url: url.toString(), origin: url.origin }
  } catch {
    return { url: baseUrl, origin: "" }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.YELLOWCAKE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing YELLOWCAKE_API_KEY" }, { status: 500 })
  }

  const body = await request.json()
  const { make, model, city, color } = body as {
    make: string
    model: string
    city: string
    color?: string
  }

  const prompt = buildPrompt(make, model, city, color)
  const startedAt = Date.now()

  const sources = [{ name: "clutch.ca", base: process.env.CLUTCH_BASE_URL || "https://clutch.ca/cars" }]

  try {
    const responses = await Promise.all(
      sources.map(async (source) => {
        const { url, origin } = buildTargetUrl(source.base, [make, model, city], color)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s safety timeout per source
        try {
          const res = await fetch("https://api.yellowcake.dev/v1/extract-stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            },
            body: JSON.stringify({
              url,
              prompt,
              authorizedURLs: [origin || new URL(url).origin],
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!res.ok || !res.body) {
            throw new Error(`Yellowcake request failed for ${source.name}`)
          }

          const payload = await readYellowcakeStream(res.body)
          const rows = Array.isArray(payload.data) ? payload.data : []
          return rows.map((row) => normalizeListing(row, source.name, url))
        } catch (error) {
          if ((error as { name?: string }).name === "AbortError") {
            console.error(`Yellowcake search timed out for ${source.name}`)
            return []
          }
          console.error(`Yellowcake search failed for ${source.name}`, error)
          return []
        }
      }),
    )

    const combined = responses.flat()
    const deduped = Object.values(
      combined.reduce<Record<string, ReturnType<typeof normalizeListing>>>((acc, item) => {
        const key = item.listing_url || item.id
        if (!acc[key]) acc[key] = item
        return acc
      }, {}),
    )

    const filtered = color
      ? deduped.filter((item) => item.color && item.color.toLowerCase().includes(color.toLowerCase()))
      : deduped

    const elapsedMs = Date.now() - startedAt
    return NextResponse.json({ results: filtered, elapsedMs })
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      return NextResponse.json({ error: "Search timed out" }, { status: 504 })
    }
    console.error("Yellowcake search failed", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
