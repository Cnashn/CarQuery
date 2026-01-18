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

function buildPrompt(make: string, model: string, _city: string, color?: string) {
  const target = [color, make, model].filter(Boolean).join(" ")
  return [
    `Get up to 10 used-car listings for ${target}, preferring the lowest mileage results; return listing_url, title, year, make, model, color, mileage_km, price_cad, and location, using null for any missing fields.`,
  ].join(" ")
}

function buildTargetUrl(baseUrl: string, query: string[], _color?: string) {
  try {
    const url = new URL(baseUrl)
    return { url: url.toString(), origin: url.origin }
  } catch {
    return { url: baseUrl, origin: "" }
  }
}

function buildCarsUrl(baseUrl: string, make: string, model: string, city: string) {
  try {
    const url = new URL(baseUrl)
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
  const { make, model, city, color, sources: requestedSources } = body as {
    make: string
    model: string
    city: string
    color?: string
    sources?: string[]
  }

  const prompt = buildPrompt(make, model, city, color)
  const startedAt = Date.now()

  const allSources = [
    { name: "cars.ca", base: process.env.CARS_BASE_URL || "https://www.cars.ca/en/inventory" },
    { name: "clutch.ca", base: process.env.GOAUTO_BASE_URL || "https://www.clutch.ca/cars" },
  ]
  const sources = Array.isArray(requestedSources) && requestedSources.length > 0
    ? allSources.filter((s) => requestedSources.includes(s.name))
    : allSources

  try {
    const responses = await Promise.all(
      sources.map(async (source) => {
        const { url, origin } =
          source.name === "cars.ca"
            ? buildCarsUrl(source.base, make, model, city)
            : buildTargetUrl(source.base, [make, model, city])
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

    const elapsedMs = Date.now() - startedAt
    return NextResponse.json({ results: deduped, elapsedMs })
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      return NextResponse.json({ error: "Search timed out" }, { status: 504 })
    }
    console.error("Yellowcake search failed", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
