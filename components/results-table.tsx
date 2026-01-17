"use client"

import { ExternalLink, Loader2, Car } from "lucide-react"
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
                <TableHead className="text-muted-foreground font-medium">Title</TableHead>
                <TableHead className="text-muted-foreground font-medium">Year</TableHead>
                <TableHead className="text-muted-foreground font-medium">Color</TableHead>
                <TableHead className="text-muted-foreground font-medium">Mileage</TableHead>
                <TableHead className="text-muted-foreground font-medium">Price</TableHead>
                <TableHead className="text-muted-foreground font-medium">Location</TableHead>
                <TableHead className="text-muted-foreground font-medium">Source</TableHead>
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
                      <p className="text-xs">
                        {readyToSearch ? "Click Search to find listings." : "Add make/model + city, then hit Search."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((listing) => (
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
                          listing.source.includes("mycar")
                            ? "h-8 px-3 rounded-full border border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                            : "h-8 px-3 rounded-full border border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
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
