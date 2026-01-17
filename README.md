# CarQuery

CarQuery is a conversational used-car search dashboard that allows users to find real vehicle listings across Canadian dealer websites using natural language. Instead of filling rigid filters, users incrementally describe what they want in a chat interface and trigger targeted web extraction only when ready.

This project was built for **uOttaHacks 2026** and demonstrates practical, production-oriented use of the **Yellowcake API** for structured web data extraction.

---

## Problem

Most used-car platforms force users into rigid filter forms and assume the user already knows exactly what they want. At the same time, aggregating car listings across multiple dealer websites is difficult due to inconsistent structures, JavaScript-heavy pages, and bot protections.

Developers typically resort to brittle, site-specific scrapers that are slow to build, expensive to maintain, and easy to break.

---

## Solution

CarQuery Live combines:
- A conversational interface for intent gathering
- On-demand, targeted web extraction using Yellowcake
- A structured, comparable results table across multiple sources

Users can iteratively refine their search through chat and only trigger extraction when enough information is present (make, model, and city).

---

## Key Design Decisions

### On-demand extraction only
Yellowcake runs **only when the user clicks Search**, not on every message. This keeps costs predictable and avoids unnecessary scraping.

### Shallow, fast extraction
Instead of deep crawling every listing page, the app extracts structured data directly from search result pages whenever possible. This dramatically reduces latency.

### Website selection matters
Some major marketplaces rely heavily on client-side rendering and bot mitigation, which can cause long extraction times or empty results. For reliability and speed, CarQuery Live prioritizes dealer platforms with accessible, structured HTML.

This is a deliberate, real-world tradeoff focused on usability.

---

## Features

- Conversational chat UI for building a car query
- Live query snapshot with active filters
- Results table with:
  - Year
  - Make / Model
  - Color
  - Mileage (km)
  - Price (CAD)
  - Location
  - Source
  - Direct listing URL
- Canada-only cities
- Maximum 10 listings per site
- Clear loading, empty, and error states

---

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (proxy to Yellowcake)
- **Data Extraction**: Yellowcake API
- **State Management**: Local React state
- **Deployment**: Vercel

---

## Yellowcake Integration

Yellowcake is used as a web extraction engine, not a traditional scraper.

Flow:
1. User builds intent via chat
2. UI validates readiness (make + model + city)
3. User clicks Search
4. Backend API route sends a single Yellowcake request
5. Yellowcake extracts structured listing data
6. Results are normalized and returned to the UI

Environment variables:
```bash
YELLOWCAKE_API_KEY=your_api_key_here
