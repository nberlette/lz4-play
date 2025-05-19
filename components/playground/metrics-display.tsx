"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  FileDown,
  FileUp,
  BarChart2,
  History,
  Trash2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react"
import type { CompressionHistory, PerformanceMetrics } from "@/lib/types"
import { formatDate, formatBytes } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MetricsDisplayProps {
  metrics: PerformanceMetrics | null
  mode?: "compress" | "decompress"
  history?: CompressionHistory[]
  className?: string
  onClearHistory?: () => void
  onDeleteHistoryItem?: (index: number) => void
}

export function MetricsDisplay({
  metrics,
  mode = "compress",
  history = [],
  className = "",
  onClearHistory = () => {},
  onDeleteHistoryItem = () => {},
}: MetricsDisplayProps) {
  const hasHistory = history.length > 0
  const hasRealMetrics = !!metrics && hasHistory

  // State for chart data points limit
  const [chartDataPoints, setChartDataPoints] = useState<number>(10)

  // State for history pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // State for filtering
  const [showCompressData, setShowCompressData] = useState<boolean>(true)
  const [showDecompressData, setShowDecompressData] = useState<boolean>(true)
  const [versionFilter, setVersionFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Calculate metrics values or use placeholders
  const ratio = hasRealMetrics ? metrics.ratio : 0
  const duration = hasRealMetrics ? metrics.duration : 0.1
  const originalSize = hasRealMetrics ? metrics.originalSize : 0
  const resultSize = hasRealMetrics ? metrics.resultSize : 0
  const bitrate = originalSize / (duration / 1e3)
  let speed = hasRealMetrics ? metrics.speed : 0
  if (!isFinite(speed)) speed = bitrate / 1024 / 1024

  // Calculate percentage saved/increased
  const percentChange = hasRealMetrics
    ? mode === "compress"
      ? ((originalSize - resultSize) / originalSize) * 100
      : ((resultSize - originalSize) / originalSize) * 100
    : 0

  const percentChangeFormatted = hasRealMetrics
    ? `${percentChange < 0 ? "-" : "+"}${Math.abs(percentChange).toFixed(2)}%`
    : "—"

  // Create data for charts based on actual metrics

  // Get unique versions from history
  const uniqueVersions = Array.from(new Set(history.map((item) => item.version)))

  // Filter history data based on user selections
  const filteredHistory = history.filter((item) => {
    // Filter by mode
    if (!(showCompressData && item.mode === "compress") && !(showDecompressData && item.mode === "decompress")) {
      return false
    }

    // Filter by version
    if (versionFilter !== "all" && item.version !== versionFilter) {
      return false
    }

    // Filter by search term (filename)
    if (searchTerm && item.fileName && !item.fileName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const sizeData = filteredHistory.map(({ originalSize, resultSize }) => [
    {
      name: "Original",
      size: originalSize / 1024,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Result",
      size: resultSize / 1024,
      fill: "hsl(var(--chart-2))",
    },
  ])
  const efficiencyData = filteredHistory.map(({ ratio, mode }) => [
    {
      name: "Efficiency",
      efficiency: ratio * 100,
      fill: "hsl(var(--chart-3))",
    },
  ])

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  // Create history data for charts - use all filtered history but limit to chartDataPoints
  const historyChartData = filteredHistory
    .slice(0, chartDataPoints)
    .map((item, index) => ({
      index,
      time: formatDate(new Date(item.timestamp)),
      ratio: item.ratio,
      speed: item.speed,
      originalSize: item.originalSize,
      resultSize: item.resultSize,
      version: item.version,
      mode: item.mode,
      fileName: item.fileName || "unknown",
    }))
    .reverse() // Show oldest to newest

  // Create data for version comparison chart
  const versionComparisonData = uniqueVersions
    .map((version) => {
      const versionData = history.filter((item) => item.version === version)
      const avgRatio =
        versionData.length > 0 ? versionData.reduce((sum, item) => sum + item.ratio, 0) / versionData.length : 0
      const avgSpeed =
        versionData.length > 0 ? versionData.reduce((sum, item) => sum + item.speed, 0) / versionData.length : 0

      return {
        version,
        avgRatio,
        avgSpeed,
        count: versionData.length,
      }
    })
    .sort((a, b) => a.version.localeCompare(b.version))

  // Custom tooltip formatter for the historical performance chart
  const historyTooltipFormatter = (value, name, props) => {
    if (name === "ratio") return [`${value.toFixed(2)}x`, "Ratio"]
    if (name === "speed") return [`${value.toFixed(2)} MB/s`, "Speed"]
    return [value, name]
  }

  // Custom tooltip content for the historical performance chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Get the data from the payload
      // Each line in the chart has its own entry in the payload array
      const dataPoint = payload[0].payload

      // Find the ratio and speed values from the specific payload items
      const ratioItem = payload.find((p) => p.dataKey === "ratio")
      const speedItem = payload.find((p) => p.dataKey === "speed")

      const ratio = ratioItem ? ratioItem.value : null
      const speed = speedItem ? speedItem.value : null

      return (
        <div className="bg-background border rounded-md p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mb-1">
            {dataPoint.fileName || "Unknown"} ({dataPoint.mode || "unknown"})
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-xs">
              Version: <span className="font-medium">v{dataPoint.version || "?"}</span>
            </p>
            <p className="text-xs">
              Ratio: <span className="font-medium">{ratio !== null && !isNaN(ratio) ? ratio.toFixed(2) : "?"}x</span>
            </p>
            <p className="text-xs">
              Speed:{" "}
              <span className="font-medium">{speed !== null && !isNaN(speed) ? speed.toFixed(2) : "?"} MB/s</span>
            </p>
            <p className="text-xs">
              Size:{" "}
              <span className="font-medium">{dataPoint.originalSize ? formatBytes(dataPoint.originalSize) : "?"}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={cn("h-full relative", className)}>
      {!(hasRealMetrics && hasHistory) && (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-lg max-h-[700px]">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <ArrowDown className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Nothing to see here... yet!</h3>
            <p className="max-w-md text-muted-foreground">
              Performance data will be available after at least one successful compression or decompression operation.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <Badge variant="outline" className="text-xs">
                100% client-side. Your data never leaves your browser.
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className={cn(hasRealMetrics ? "" : "filter blur-[1.5px]")}>
        <CardHeader>
          <div className={cn("flex justify-between items-center", hasRealMetrics ? "" : "opacity-50")}>
            <div>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                {mode === "compress" ? "Compression" : "Decompression"} statistics and benchmarks
              </CardDescription>
            </div>
            {hasRealMetrics && (
              <Badge variant={percentChange > 50 ? "default" : percentChange > 30 ? "secondary" : "outline"}>
                {percentChangeFormatted}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent
          className={cn(hasRealMetrics ? "" : "opacity-30 pointer-events-none max-h-[600px] overflow-hidden")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="mr-4 bg-primary/10 p-2 rounded-full">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency</p>
                  <p className="text-2xl font-bold">{hasRealMetrics && ratio ? ratio.toFixed(2) : "—"}x</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="mr-4 bg-primary/10 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Throughput</p>
                  <p className="text-2xl font-bold">{hasRealMetrics && speed ? speed.toFixed(2) : "—"} MB/s</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="mr-4 bg-primary/10 p-2 rounded-full">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Input Size</p>
                  <p className="text-2xl font-bold">
                    {hasRealMetrics && originalSize ? formatBytes(originalSize) : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="mr-4 bg-primary/10 p-2 rounded-full">
                  <FileDown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output Size</p>
                  <p className="text-2xl font-bold">{hasRealMetrics && resultSize ? formatBytes(resultSize) : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="charts">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">
                  History
                  {filteredHistory?.length > 0 && <span className="ml-1 text-xs">({filteredHistory.length})</span>}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Chart data points selector */}
                <TabsContent value="charts" className="m-0 p-0">
                  <div className="flex items-center gap-2">
                    <Select
                      value={chartDataPoints.toString()}
                      onValueChange={(value) => setChartDataPoints(Number.parseInt(value))}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue placeholder="Dataset Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                        <SelectItem value="100">100 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* History filters */}
                <TabsContent value="history" className="m-0 p-0">
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Filter className="h-3.5 w-3.5 mr-1" />
                          <span>Filters</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Filter History</h4>

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Mode</h5>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-compress"
                                checked={showCompressData}
                                onCheckedChange={(c) => setShowCompressData(!!c)}
                              />
                              <Label htmlFor="filter-compress">Compress</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-decompress"
                                checked={showDecompressData}
                                onCheckedChange={(c) => setShowDecompressData(!!c)}
                              />
                              <Label htmlFor="filter-decompress">Decompress</Label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Version</h5>
                            <Select value={versionFilter} onValueChange={setVersionFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select version" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Versions</SelectItem>
                                {uniqueVersions.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    v{v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Search by Filename</h5>
                            <Input
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>

                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowCompressData(true)
                                setShowDecompressData(true)
                                setVersionFilter("all")
                                setSearchTerm("")
                              }}
                            >
                              Reset Filters
                            </Button>
                            <Button size="sm">Apply Filters</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number.parseInt(value))
                        // Reset to first page when changing items per page
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue placeholder="Per Page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Clear history button - show on all tabs if there's history */}
                {hasHistory && onClearHistory && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span>Clear</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear History</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to clear your compression history? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onClearHistory}>Clear History</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historical Performance Chart */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Historical Performance</CardTitle>
                    <CardDescription>Showing {historyChartData.length} most recent operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                          <XAxis dataKey="time" />
                          <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-4))" />
                          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-5))" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            name="Ratio"
                            dataKey="ratio"
                            stroke="hsl(var(--chart-4))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            name="Speed (MB/s)"
                            dataKey="speed"
                            stroke="hsl(var(--chart-5))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Version Comparison Chart */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Version Comparison</CardTitle>
                    <CardDescription>Average performance metrics across different versions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={versionComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="version" />
                          <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const avgRatioItem = payload.find((p) => p.dataKey === "avgRatio")
                                const avgSpeedItem = payload.find((p) => p.dataKey === "avgSpeed")

                                const avgRatio = avgRatioItem ? avgRatioItem.value : null
                                const avgSpeed = avgSpeedItem ? avgSpeedItem.value : null

                                return (
                                  <div className="bg-background border rounded-md p-3 shadow-md">
                                    <p className="font-medium">Version {label}</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                      <p className="text-xs">
                                        Avg. Ratio:{" "}
                                        <span className="font-medium">
                                          {avgRatio !== null && !isNaN(avgRatio) ? avgRatio.toFixed(2) : "?"}x
                                        </span>
                                      </p>
                                      <p className="text-xs">
                                        Avg. Speed:{" "}
                                        <span className="font-medium">
                                          {avgSpeed !== null && !isNaN(avgSpeed) ? avgSpeed.toFixed(2) : "?"} MB/s
                                        </span>
                                      </p>
                                      <p className="text-xs">
                                        Sample Count:{" "}
                                        <span className="font-medium">{payload[0].payload.count || 0}</span>
                                      </p>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="avgRatio" name="Avg. Ratio" fill="hsl(var(--chart-1))" />
                          <Bar yAxisId="right" dataKey="avgSpeed" name="Avg. Speed (MB/s)" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Compression Details</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Algorithm</span>
                        <span>LZ4 (@nick/lz4)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span>v{metrics?.version || "—"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Mode</span>
                        <span className="capitalize">{mode || "Compress"}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Processing Time</span>
                        <span>{hasRealMetrics && duration ? duration.toFixed(2) : "—"} ms</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Throughput</span>
                        <span>{hasRealMetrics && speed ? speed.toFixed(2) : "—"} MB/s</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Compression Ratio</span>
                        <span>{hasRealMetrics && ratio ? ratio.toFixed(2) : "—"}x</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Size Change</span>
                        <span>{percentChangeFormatted}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              {filteredHistory.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-left py-2 font-medium">Mode</th>
                          <th className="text-left py-2 font-medium">Version</th>
                          <th className="text-left py-2 font-medium">File</th>
                          <th className="text-left py-2 font-medium">Original Size</th>
                          <th className="text-left py-2 font-medium">Result Size</th>
                          <th className="text-left py-2 font-medium">Ratio</th>
                          <th className="text-left py-2 font-medium">Speed</th>
                          {onDeleteHistoryItem && <th className="text-right py-2 font-medium">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.map((item, index) => {
                          const actualIndex = startIndex + index
                          return (
                            <tr key={actualIndex} className={index < paginatedHistory.length - 1 ? "border-b" : ""}>
                              <td className="py-2">{formatDate(new Date(item.timestamp))}</td>
                              <td className="py-2 capitalize">{item.mode}</td>
                              <td className="py-2">v{item.version}</td>
                              <td className="py-2 max-w-[150px] truncate" title={item.fileName || "Unknown"}>
                                {item.fileName || "Unknown"}
                              </td>
                              <td className="py-2">{formatBytes(item.originalSize)}</td>
                              <td className="py-2">{formatBytes(item.resultSize)}</td>
                              <td className="py-2">{item.ratio?.toFixed(2)?.concat("x") ?? "--"}</td>
                              <td className="py-2">{item.speed?.toFixed(2) ?? "--"} MB/s</td>
                              {onDeleteHistoryItem && (
                                <td className="py-2 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDeleteHistoryItem(actualIndex)}
                                    className="h-7 w-7"
                                    title="Delete this entry"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of{" "}
                        {filteredHistory.length} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <History className="h-12 w-12 mb-4 opacity-50" />
                  <p>No compression history yet</p>
                  <p className="text-sm">Your compression operations will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  )
}
