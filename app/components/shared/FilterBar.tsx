"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface FilterBarProps {
  disciplines?: string[]
  languages?: string[]
  audiences?: string[]
  onFilter: (filters: any) => void
  showDateFilter?: boolean
  showLanguageFilter?: boolean
  showAudienceFilter?: boolean
  showDisciplineFilter?: boolean
}

export default function FilterBar({
  disciplines = ["Assessment", "Academic Honesty", "Inclusion", "Language", "Admission"],
  languages = ["English", "Russian", "Spanish", "French"],
  audiences = ["Teachers and Staff", "Students", "Parents", "Administrators", "All Stakeholders"],
  onFilter,
  showDateFilter = true,
  showLanguageFilter = true,
  showAudienceFilter = true,
  showDisciplineFilter = true,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [language, setLanguage] = useState("")
  const [audience, setAudience] = useState("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const handleFilter = () => {
    onFilter({
      searchTerm,
      discipline: discipline === "all" ? "" : discipline,
      language: language === "all" ? "" : language,
      audience: audience === "all" ? "" : audience,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    })
  }

  const handleReset = () => {
    setSearchTerm("")
    setDiscipline("")
    setLanguage("")
    setAudience("")
    setDateFrom("")
    setDateTo("")
    onFilter({})
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-secondary/30">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-secondary"
            />
          </div>
        </div>

        {showDisciplineFilter && (
          <div>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="border-secondary">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {disciplines.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showLanguageFilter && (
          <div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="border-secondary">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showAudienceFilter && (
          <div>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="border-secondary">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                {audiences.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showDateFilter && (
          <>
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-secondary"
                placeholder="From Date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-secondary"
                placeholder="To Date"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-1">
          <X className="h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleFilter} className="bg-primary hover:bg-primary/90 flex items-center gap-1">
          <Search className="h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  )
}
