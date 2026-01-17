"use client"

import { useState } from "react"
import { ChatPanel } from "./chat-panel"
import { SearchSnapshot } from "./search-snapshot"
import { ResultsTable } from "./results-table"

export interface CarQuery {
  make: string
  model: string
  city: string
  yearMin: string
  yearMax: string
  color?: string
  maxMileage?: string
  radiusKm?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface CarListing {
  id: string
  title?: string | null
  year?: number | null
  make?: string | null
  model?: string | null
  color?: string | null
  mileage_km?: number | null
  price_cad?: number | null
  location?: string | null
  source: string
  listing_url: string
}

export type SearchStatus = "idle" | "chatting" | "searching"

const initialQuery: CarQuery = {
  make: "",
  model: "",
  city: "",
  yearMin: "",
  yearMax: "",
  color: "",
  maxMileage: "",
  radiusKm: "",
}

export function CarQueryDashboard() {
  const [carQuery, setCarQuery] = useState<CarQuery>(initialQuery)
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your CarQuery assistant. Tell me what car you're looking for — include the make, model, and city. For example: \"Red Honda Civic in Ottawa\"",
    },
  ])
  const [results, setResults] = useState<CarListing[]>([])
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const readyToSearch = !!(carQuery.make && carQuery.model && carQuery.city)

  const parseCarQuery = (input: string): Partial<CarQuery> => {
    const parsed: Partial<CarQuery> = {}
    const lowerInput = input.toLowerCase()

    // Parse color
    const colors = ["red", "blue", "black", "white", "silver", "grey", "gray", "green", "yellow", "orange"]
    for (const color of colors) {
      if (lowerInput.includes(color)) {
        parsed.color = color.charAt(0).toUpperCase() + color.slice(1)
        break
      }
    }

    // Parse make
    const makes: Record<string, string> = {
      honda: "Honda",
      acura: "Acura",
      "alfa romeo": "Alfa Romeo",
      audi: "Audi",
      bmw: "BMW",
      buick: "Buick",
      cadillac: "Cadillac",
      chevrolet: "Chevrolet",
      chevy: "Chevrolet",
      chrysler: "Chrysler",
      dodge: "Dodge",
      fiat: "Fiat",
      ford: "Ford",
      genesis: "Genesis",
      gmc: "GMC",
      hyundai: "Hyundai",
      infiniti: "Infiniti",
      jaguar: "Jaguar",
      jeep: "Jeep",
      kia: "Kia",
      "land rover": "Land Rover",
      lexus: "Lexus",
      lincoln: "Lincoln",
      mazda: "Mazda",
      mercedes: "Mercedes-Benz",
      mini: "MINI",
      mitsubishi: "Mitsubishi",
      nissan: "Nissan",
      porsche: "Porsche",
      ram: "Ram",
      scion: "Scion",
      smart: "Smart",
      subaru: "Subaru",
      tesla: "Tesla",
      toyota: "Toyota",
      volkswagen: "Volkswagen",
      vw: "Volkswagen",
      volvo: "Volvo",
    }
    for (const [key, value] of Object.entries(makes)) {
      if (lowerInput.includes(key)) {
        parsed.make = value
        break
      }
    }

    // Parse model
    const models: Record<string, string> = {
      // Common Honda
      civic: "Civic",
      "civic type r": "Civic Type R",
      accord: "Accord",
      odyssey: "Odyssey",
      ridgeline: "Ridgeline",
      "s2000": "S2000",
      // Toyota
      camry: "Camry",
      corolla: "Corolla",
      rav4: "RAV4",
      "4runner": "4Runner",
      "prius": "Prius",
      // BMW
      z4: "Z4",
      z3: "Z3",
      "1 series": "1 Series",
      "2 series": "2 Series",
      "3 series": "3 Series",
      "4 series": "4 Series",
      "5 series": "5 Series",
      "7 series": "7 Series",
      m2: "M2",
      m3: "M3",
      m4: "M4",
      m5: "M5",
      x1: "X1",
      x3: "X3",
      x5: "X5",
      x6: "X6",
      // Audi
      a3: "A3",
      a4: "A4",
      a5: "A5",
      a6: "A6",
      a7: "A7",
      q3: "Q3",
      q5: "Q5",
      q7: "Q7",
      q8: "Q8",
      rs3: "RS3",
      rs5: "RS5",
      s3: "S3",
      s4: "S4",
      s5: "S5",
      "s5 sportback": "S5 Sportback",
      s6: "S6",
      sq5: "SQ5",
      tt: "TT",
      tts: "TTS",
      // Mercedes / others
      cla: "CLA",
      glc: "GLC",
      gle: "GLE",
      glb: "GLB",
      // Ford
      mustang: "Mustang",
      "mustang mach-e": "Mustang Mach-E",
      bronco: "Bronco",
      "f-150": "F-150",
      explorer: "Explorer",
      edge: "Edge",
      // Chevy
      camaro: "Camaro",
      corvette: "Corvette",
      tahoe: "Tahoe",
      suburban: "Suburban",
      traverse: "Traverse",
      trailblazer: "Trailblazer",
      trax: "Trax",
      volt: "Volt",
      blazer: "Blazer",
      equinox: "Equinox",
      "silverado 1500": "Silverado 1500",
      // Cadillac
      ats: "ATS",
      ct4: "CT4",
      ct5: "CT5",
      ct6: "CT6",
      cts: "CTS",
      escalade: "Escalade",
      lyric: "Lyriq",
      xt4: "XT4",
      xt5: "XT5",
      xt6: "XT6",
      // Acura
      ilx: "ILX",
      integra: "Integra",
      mdx: "MDX",
      rdx: "RDX",
      tlx: "TLX",
      // Nissan
      altima: "Altima",
      maxima: "Maxima",
      rogue: "Rogue",
      qashqai: "Qashqai",
      sentra: "Sentra",
      z: "Z",
      // Hyundai / Kia / Genesis
      elantra: "Elantra",
      sonata: "Sonata",
      tucson: "Tucson",
      santa: "Santa Fe",
      kona: "Kona",
      ioniq: "Ioniq",
      ev6: "EV6",
      ev9: "EV9",
      stinger: "Stinger",
      telluride: "Telluride",
      g70: "G70",
      g80: "G80",
      gv70: "GV70",
      // Subaru
      crosstrek: "Crosstrek",
      forester: "Forester",
      outback: "Outback",
      wrx: "WRX",
      // VW
      golf: "Golf",
      "golf gti": "Golf GTI",
      jetta: "Jetta",
      passat: "Passat",
      tiguan: "Tiguan",
      atlas: "Atlas",
      // Mazda
      "cx-3": "CX-3",
      "cx-5": "CX-5",
      "cx-30": "CX-30",
      "mx-5": "MX-5",
      // Others
      giulia: "Giulia",
      macan: "Macan",
      cayenne: "Cayenne",
      "911": "911",
    }
    for (const [key, value] of Object.entries(models)) {
      if (lowerInput.includes(key)) {
        parsed.model = value
        break
      }
    }

    // Handle EV special case
    if (lowerInput.includes("ev") || lowerInput.includes("electric")) {
      parsed.make = "Tesla"
      parsed.model = "Model 3"
    }

    // Parse city
    const cities = ["ottawa", "toronto", "vancouver", "montreal", "calgary", "edmonton", "winnipeg", "halifax"]
    for (const city of cities) {
      if (lowerInput.includes(city)) {
        parsed.city = city.charAt(0).toUpperCase() + city.slice(1)
        break
      }
    }

    return parsed
  }

  const handleSend = (input: string) => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])
    setSearchStatus("chatting")

    // Simulate processing delay
    setTimeout(() => {
      const parsed = parseCarQuery(input)
      setCarQuery((prev) => ({ ...prev, ...parsed }))

      let responseText = ""
      if (parsed.make && parsed.model && parsed.city) {
        responseText = `Got it! I've set up a search for ${parsed.color ? parsed.color + " " : ""}${parsed.make} ${parsed.model} in ${parsed.city}. Click the Search button when you're ready!`
      } else if (parsed.make || parsed.model || parsed.city) {
        const missing: string[] = []
        if (!parsed.make && !carQuery.make) missing.push("make")
        if (!parsed.model && !carQuery.model) missing.push("model")
        if (!parsed.city && !carQuery.city) missing.push("city")
        if (missing.length > 0) {
          responseText = `I've updated your search. Still need: ${missing.join(", ")}. What else can you tell me?`
        } else {
          responseText = `Search updated! You're ready to search when you want.`
        }
      } else {
        responseText =
          'I couldn\'t quite understand that. Try something like "Red Honda Civic in Ottawa" or use one of the quick chips below!'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setSearchStatus("idle")
    }, 800)
  }

  const generateMockResults = (): CarListing[] => {
    const baseResults: CarListing[] = []
    const sources: ("cargurus.ca" | "autotrader.ca")[] = ["cargurus.ca", "autotrader.ca"]

    for (let i = 0; i < 8; i++) {
      const year = carQuery.yearMin
        ? Number.parseInt(carQuery.yearMin) + Math.floor(Math.random() * 5)
        : 2019 + Math.floor(Math.random() * 6)

      baseResults.push({
        id: `listing-${i}`,
        year,
        make: carQuery.make,
        model: carQuery.model,
        color: carQuery.color || ["Black", "White", "Silver", "Blue", "Red"][Math.floor(Math.random() * 5)],
        mileage: Math.floor(Math.random() * 120000) + 15000,
        price: Math.floor(Math.random() * 25000) + 15000,
        location: carQuery.city,
        source: sources[i % 2],
        listingUrl: `https://${sources[i % 2]}/listing/${i}`,
      })
    }

    return baseResults.sort((a, b) => a.price - b.price)
  }

  const handleSearch = async () => {
    if (!readyToSearch) return

    setSearchStatus("searching")
    setResults([])
    setErrorMessage(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carQuery),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || "Search failed")
      }

      const data = (await response.json()) as { results: CarListing[]; elapsedMs?: number }
      setResults(data.results || [])
      setSearchTime(data.elapsedMs ? data.elapsedMs / 1000 : null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed"
      setErrorMessage(message)
    } finally {
      setSearchStatus("idle")
    }
  }

  return (
    <div className="flex h-screen">
      <ChatPanel messages={messages} searchStatus={searchStatus} readyToSearch={readyToSearch} onSend={handleSend} />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-[360px]">
        <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          <SearchSnapshot
            carQuery={carQuery}
            readyToSearch={readyToSearch}
            searchStatus={searchStatus}
            resultsCount={results.length}
            searchTime={searchTime}
            errorMessage={errorMessage || undefined}
            onSearch={handleSearch}
          />
          <ResultsTable results={results} searchStatus={searchStatus} readyToSearch={readyToSearch} />
        </div>
      </div>
    </div>
  )
}
