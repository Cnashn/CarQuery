"use client"

import { useMemo, useState } from "react"
import { ExternalLink, Loader2, Car, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { CarListing, SearchStatus } from "./car-query-dashboard"

interface ResultsTableProps {
  results: CarListing[]
  searchStatus: SearchStatus
  readyToSearch: boolean
}

export function ResultsTable({ results, searchStatus, readyToSearch }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<
    "title" | "year" | "color" | "mileage_km" | "price_cad" | "location" | "source"
  >("price_cad")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-CA").format(mileage) + " km"
  }

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortedResults = useMemo(() => {
    const copy = [...results]
    copy.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      const normalize = (val: unknown) => {
        if (typeof val === "number") return val
        if (typeof val === "string") return val.toLowerCase()
        return null
      }

      const av = normalize(aVal)
      const bv = normalize(bVal)

      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }

      const cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [results, sortKey, sortDir])

  return (
    <Card className="bg-card border-border flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Car className="h-5 w-5 text-amber-400" />
            Results
          </CardTitle>
          {results.length > 0 && (
            <p className="text-sm text-muted-foreground">Showing {results.length} listings · Updated just now</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {[
                  ["title", "Title"],
                  ["year", "Year"],
                  ["color", "Color"],
                  ["mileage_km", "Mileage"],
                  ["price_cad", "Price"],
                  ["location", "Location"],
                  ["source", "Source"],
                ].map(([key, label]) => (
                  <TableHead key={key} className="text-muted-foreground font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(key as typeof sortKey)}
                      className="flex items-center gap-1 text-foreground hover:text-amber-400 transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchStatus === "searching" ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Searching sources…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Car className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No results yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedResults.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-muted/30">
                    <TableCell className="text-foreground">
                      {listing.title || [listing.make, listing.model].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{listing.year ?? "—"}</TableCell>
                    <TableCell className="text-foreground">{listing.color || "—"}</TableCell>
                    <TableCell className="text-foreground">
                      {listing.mileage_km != null ? formatMileage(listing.mileage_km) : "—"}
                    </TableCell>
                    <TableCell className="font-semibold text-amber-400">
                      {listing.price_cad != null ? formatPrice(listing.price_cad) : "—"}
                    </TableCell>
                    <TableCell className="text-foreground">{listing.location || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          listing.source.includes("cars.ca")
                            ? "h-8 px-3 rounded-full border border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                            : listing.source.includes("clutch")
                              ? "h-8 px-3 rounded-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                              : "h-8 px-3 rounded-full border border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        }
                        onClick={() => window.open(listing.listing_url, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {listing.source}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
