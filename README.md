# CarQuery (uOttaHack 8)

CarQuery is a chat-based used-car search tool that helps users find low-mileage vehicles by specifying make, model, color, and listing sources. It uses the Yellowcake API to extract real listings and presents results in a clean, sortable table with pricing, mileage, location, and direct links.

## Quick start (local)

Requirements: Node 18+ and npm.

1) Clone this repo and `cd` into it.  
2) Install deps: `npm install`  
3) Create `.env.local` in the project root:

   ```bash
   YELLOWCAKE_API_KEY=your_yellowcake_api_key
   ```
   Get a key at https://yellowcake.dev (sign up, create an API key).
4) Run the app: `npm run dev`
5) Open `http://localhost:3000` → click **Start searching** to open `/search`.

## How it works

- Chat gathers make, model, and color; then asks you to confirm.  
- Clicking **Search** triggers one Yellowcake request per selected source.  
- Results are normalized into a table with year, make/model, color, mileage, price, location, source, and a direct link.

## Notes

- Current sources: cars.ca (stable) and clutch.ca (can be slow).

## Preview

**Welcome screen**

![Welcome screen](public/welcome.png)

**Search page**

![Search screen](public/search.png)
