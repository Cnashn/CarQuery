"use client"

import { useState } from "react"
import { ChatPanel } from "./chat-panel"
import { SearchSnapshot } from "./search-snapshot"
import { ResultsTable } from "./results-table"

export interface CarQuery {
  make: string
  model: string
  city: string
  color?: string
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
type ConfirmStatus = "idle" | "requested" | "confirmed"

const initialQuery: CarQuery = {
  make: "",
  model: "",
  city: "",
  color: "",
}

export function CarQueryDashboard() {
  const [carQuery, setCarQuery] = useState<CarQuery>(initialQuery)
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle")
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>("idle")
  const [selectedSources, setSelectedSources] = useState<string[]>(["cars.ca", "clutch.ca"])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your CarQuery assistant. Tell me what car you're looking for — include the make, model, and color. For example: \"Gray Audi A5\"",
    },
  ])
  const [results, setResults] = useState<CarListing[]>([])
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasBasics = !!(carQuery.make && carQuery.model && carQuery.color)
  const readyToSearch = hasBasics && confirmStatus === "confirmed"

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
      Prius: "Prius",
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
      // Tesla
      "model 3": "Model 3",
      "model y": "Model Y",
      "model x": "Model X",
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
      focus: "Focus",
      fiesta: "Fiesta",
      fusion: "Fusion",
      escape: "Escape",
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
      "718": "718",
    }
    for (const [key, value] of Object.entries(models)) {
      if (lowerInput.includes(key)) {
        parsed.model = value
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
      const trimmed = input.trim().toLowerCase()

      // If user starts a new query after confirming, reset confirmation
      if (confirmStatus === "confirmed" && trimmed !== "y" && trimmed !== "yes") {
        setConfirmStatus("idle")
      }

      // Handle confirmation replies
      if (confirmStatus === "requested" && (trimmed === "y" || trimmed === "yes")) {
        setConfirmStatus("confirmed")
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "Confirmed. Click Search when you're ready.",
          },
        ])
        setSearchStatus("idle")
        return
      }

      if (confirmStatus === "requested" && (trimmed === "n" || trimmed === "no")) {
        setConfirmStatus("idle")
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "No problem. Tell me the make, model, and color again.",
          },
        ])
        setSearchStatus("idle")
        return
      }

      const parsed = parseCarQuery(input)
      const nextQuery = { ...carQuery, ...parsed }
      setCarQuery(nextQuery)

      const hasAllBasics = !!(nextQuery.make && nextQuery.model && nextQuery.color)
      let responseText = ""
      if (hasAllBasics) {
        responseText = `Ready to search for ${nextQuery.color} ${nextQuery.make} ${nextQuery.model}${
          nextQuery.city ? ` in ${nextQuery.city}` : ""
        }. Confirm? Reply Y or N.`
        setConfirmStatus("requested")
      } else if (parsed.make || parsed.model || parsed.city || parsed.color) {
        const missing: string[] = []
        if (!parsed.make && !carQuery.make) missing.push("make")
        if (!parsed.model && !carQuery.model) missing.push("model")
        if (!parsed.color && !carQuery.color) missing.push("color")
        if (missing.length > 0) {
          responseText = `I've updated your search. Still need: ${missing.join(", ")}. What else can you tell me?`
        } else {
          responseText = `Search updated! You're ready to search when you want.`
        }
      } else {
        responseText =
          'I couldn\'t quite understand that. Try something like "Black Hyundai Accent" or use one of the quick chips below!'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
      }
      setMessages((prev) => {
        const next = [...prev, assistantMessage]

        return next
      })
      setSearchStatus("idle")
    }, 800)
  }

  const handleSearch = async () => {
    if (!readyToSearch) return
    if (selectedSources.length === 0) {
      setErrorMessage("Select at least one source")
      return
    }

    setSearchStatus("searching")
    setResults([])
    setErrorMessage(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...carQuery, sources: selectedSources }),
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
            selectedSources={selectedSources}
            onToggleSource={(source) =>
              setSelectedSources((prev) =>
                prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
              )
            }
            onSearch={handleSearch}
          />
          <ResultsTable results={results} searchStatus={searchStatus} readyToSearch={readyToSearch} />
        </div>
      </div>
    </div>
  )
}
