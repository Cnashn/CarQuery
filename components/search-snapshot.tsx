"use client"

import { Search, Clock, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CarQuery, SearchStatus } from "./car-query-dashboard"

interface SearchSnapshotProps {
  carQuery: CarQuery
  readyToSearch: boolean
  searchStatus: SearchStatus
  confirmStatus: "idle" | "requested" | "confirmed"
  resultsCount: number
  searchTime: number | null
  errorMessage?: string
  selectedSources: string[]
  onToggleSource: (source: string) => void
  onSearch: () => void
}

export function SearchSnapshot({
  carQuery,
  readyToSearch,
  searchStatus,
  confirmStatus,
  resultsCount,
  searchTime,
  errorMessage,
  selectedSources,
  onToggleSource,
  onSearch,
}: SearchSnapshotProps) {
  const activeFilters: string[] = []
  if (carQuery.color) activeFilters.push(carQuery.color)

  const searchDescription =
    carQuery.make && carQuery.model
      ? `${carQuery.color ? `${carQuery.color} ` : ""}${carQuery.make} ${carQuery.model}`
      : "Add make, model, and color to begin"

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-400" />
            Search Snapshot
          </CardTitle>
          <Badge variant="outline" className="text-xs border-amber-400/30 text-amber-400">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Description */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Looking for</p>
          <p className="text-foreground font-medium">{searchDescription}</p>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Active filters</p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Sources</p>
          <div className="flex flex-wrap gap-2">
            {["cars.ca", "clutch.ca"].map((source) => {
              const active = selectedSources.includes(source)
              return (
                <button
                  key={source}
                  onClick={() => onToggleSource(source)}
                  className={`rounded-full px-3 py-1 text-xs border ${
                    active
                      ? "bg-amber-400 text-slate-950 border-amber-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  {source}
                </button>
              )
            })}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Listings</p>
            <p className="text-lg font-semibold text-foreground">{resultsCount > 0 ? resultsCount : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Exec time</p>
            <p className="text-lg font-semibold text-foreground flex items-center gap-1">
              {searchTime ? `${searchTime.toFixed(1)}s` : "—"}
              {searchStatus === "searching" && <Clock className="h-3 w-3 animate-pulse text-muted-foreground" />}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sources</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                cars.ca
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                clutch.ca
              </Badge>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <Button
            onClick={onSearch}
            disabled={!readyToSearch || searchStatus === "searching"}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold"
          >
            {searchStatus === "searching" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
          {!readyToSearch && (
            <p className="text-xs text-center text-muted-foreground">
              {confirmStatus === "requested"
                ? "Reply Y or N in chat to confirm this search."
                : "Add make/model + color, then confirm to enable search."}
            </p>
          )}
          {errorMessage && (
            <p className="text-xs text-center text-amber-400">Search failed: {errorMessage}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1 pt-2">
          <p className="text-xs text-muted-foreground">Max 10 listings per site · Canada only</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            Yellowcake runs only when you click Search
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
