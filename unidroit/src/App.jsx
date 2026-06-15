import { useState, useEffect } from "react"
import { CountBarChart } from "./Charts"

// Count how many entries share each value of keyFn, e.g. countBy(entries, e => e.jurisdiction).
// Blank and NaN keys are skipped so they never become a chart bucket.
const countBy = (entries, keyFn) => {
  const counts = {}
  for (const entry of entries) {
    const key = keyFn(entry)
    if (key === undefined || key === null || key === "" || Number.isNaN(key)) continue
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

// Shared looks for form controls and sidebar section labels
const control = "w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-unidroit focus:ring-1 focus:ring-unidroit"
const sectionLabel = "block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5"

// Languages live slash-separated in a single field, e.g. "English / French".
// This is the one place that format is decoded.
const splitLanguages = (value) => (value || "").split("/").map((lang) => lang.trim()).filter(Boolean)

// Distinct, sorted, non-empty values — the basis for every filter's option list.
const uniqueSorted = (values) => [...new Set(values)].filter(Boolean).sort()

// Add a value to a multi-select list, or remove it if already present.
const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

// Entry fields scanned by the free-text search box.
const SEARCH_FIELDS = [
  "jurisdiction", "summary", "notes", "text_title", "legal_system",
  "promulgating_body", "principle_title", "subtitle", "type",
]

// An empty query matches everything; otherwise any field containing it matches.
const matchesSearch = (entry, query) => {
  if (query === "") return true
  const q = query.toLowerCase()
  return SEARCH_FIELDS.some((field) => (entry[field] || "").toLowerCase().includes(q))
}

// Year only, for the date-range filter.
const yearOf = (entry) => Number((entry.date || "").split("/").pop())

// Sortable integer from a "dd/mm/yyyy" (or "mm/yyyy") date; missing parts count as 0.
const dateValue = (entry) => {
  const [year = 0, month = 0, day = 0] = (entry.date || "").split("/").reverse().map((n) => Number(n) || 0)
  return year * 10000 + month * 100 + day
}


function Detail({ label, value }) {
  if (!value) return null
  return (
    <p className="text-sm text-stone-700">
      <span className="font-medium text-stone-900">{label}: </span>{value}
    </p>
  )
}


function Select({ placeholder, value, options, onChange, className = "" }) {
  return (
    <select className={`${control} ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  )
}


function CheckboxFilter({ label, options, selected, onChange }) {
  return (
    <div>
      <label className={sectionLabel}>{label}</label>
      <div className="space-y-1">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              className="accent-unidroit"
              checked={selected.includes(option)}
              onChange={() => onChange(toggle(selected, option))}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}


function Card({ entry }) {
  return (
    <div className="bg-white rounded-sm border border-stone-200 border-l-[3px] border-l-unidroit p-5 transition-colors hover:border-stone-300">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug">{entry.text_title}</h3>
        {entry.status && (
          <span className="shrink-0 rounded-sm border border-unidroit-700 text-unidroit-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
            {entry.status}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-stone-500">
        {entry.jurisdiction}
        {entry.date && ` · ${entry.date}`}
        {entry.legal_system && ` · ${entry.legal_system}`}
        {entry.text_language && ` · ${entry.text_language}`}
      </p>

      <div className="mt-3 rounded-sm border-l-2 border-unidroit bg-unidroit-50 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-unidroit">UNIDROIT instrument</p>
        <p className="mt-1 text-sm font-medium text-stone-800">{entry.principle_title}</p>
        <p className="text-sm text-stone-600">
          {entry.subtitle}
          {entry['num principle/article'] && ` (${entry.type || "Principle"} ${entry['num principle/article']})`}
        </p>
      </div>

      <div className="mt-3 space-y-1">
        <Detail label="Promulgating body" value={entry.promulgating_body} />
        {entry.jurisdiction === "United States" && <Detail label="US states enacted" value={entry.states_usa} />}
        <Detail label="Sections" value={entry.sections} />
        <Detail label="Summary" value={entry.summary} />
        <Detail label="Notes" value={entry.notes} />
      </div>

      {entry.link && (
        <a href={entry.link} target="_blank" rel="noreferrer"
           className="mt-4 inline-block text-sm font-medium text-unidroit hover:text-unidroit-700 hover:underline">
          View document →
        </a>
      )}

    </div>
  )
}


function App() {
  const [searchText, setSearchText] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [text, setText] = useState("")
  const [instrument, setInstrument] = useState("")
  const [principle, setPrinciple] = useState("")
  const [entries, setEntries] = useState([])
  const [statuses, setStatuses] = useState([])
  const [languages, setLanguages] = useState([])
  const [systems, setSystems] = useState([])
  const [fromYear, setFromYear] = useState("")
  const [toYear, setToYear] = useState("")
  const [sortOrder, setSortOrder] = useState("")
  const [activeTab, setActiveTab] = useState("results")

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "result.json")
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [])

  const jurisdictions = uniqueSorted(entries.map((e) => e.jurisdiction))
  const texts = uniqueSorted(entries.map((e) => e.text_title))
  const instruments = uniqueSorted(entries.map((e) => e.principle_title))
  const principles = uniqueSorted(entries.map((e) => e.subtitle))
  const statusOptions = uniqueSorted(entries.map((e) => e.status))
  const langOptions = uniqueSorted(entries.flatMap((e) => splitLanguages(e.text_language)))
  const systemOptions = uniqueSorted(entries.map((e) => e.legal_system))

  const filteredEntries = entries.filter((entry) =>
    (jurisdiction === "" || entry.jurisdiction === jurisdiction) &&
    (text === "" || entry.text_title === text) &&
    (instrument === "" || entry.principle_title === instrument) &&
    (principle === "" || entry.subtitle === principle) &&
    matchesSearch(entry, searchText) &&
    (statuses.length === 0 || statuses.includes(entry.status)) &&
    (languages.length === 0 || splitLanguages(entry.text_language).some((lang) => languages.includes(lang))) &&
    (systems.length === 0 || systems.includes(entry.legal_system)) &&
    (fromYear === "" || yearOf(entry) >= Number(fromYear)) &&
    (toYear === "" || yearOf(entry) <= Number(toYear))
  )

  const sortedEntries = sortOrder === ""
    ? filteredEntries
    : [...filteredEntries].sort((a, b) =>
        sortOrder === "asc" ? dateValue(a) - dateValue(b) : dateValue(b) - dateValue(a))

  // Charts are computed from the filtered entries, so they track the active filters.
  const instrumentCounts = countBy(filteredEntries, (e) => e.principle_title)
  const principleCounts = countBy(filteredEntries, (e) => e.subtitle)
  const yearCounts = countBy(filteredEntries, yearOf)
  const jurisdictionCounts = countBy(filteredEntries, (e) => e.jurisdiction)

  return (
    <div className="min-h-screen bg-paper">

      <header className="bg-white border-b-4 border-unidroit px-8 py-5 flex items-center gap-6">
        <a href="https://www.unidroit.org" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src="/unidroit_logo.png" alt="UNIDROIT — International Institute for the Unification of Private Law" className="h-14 w-auto" />
        </a>
        <div className="border-l border-stone-300 pl-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-unidroit">Implementation Database</h1>
          <p className="text-stone-500 mt-1 text-sm">Legislative implementation of UNIDROIT soft-law instruments worldwide</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* Search bar */}
        <div className="max-w-2xl mt-8 mx-auto">
          <input
            type="text"
            placeholder="Search by jurisdiction, legislative text, UNIDROIT principle..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-sm border border-stone-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-unidroit focus:ring-1 focus:ring-unidroit"
          />
        </div>

        <div className="flex gap-8 mt-8">

          <aside className="w-64 shrink-0">
            <div className="rounded-sm border border-stone-200 bg-white p-4 space-y-5">

              <h2 className="text-sm font-semibold text-stone-900">Filters</h2>

              <div>
                <label className={sectionLabel}>Jurisdiction</label>
                <Select placeholder="All jurisdictions" value={jurisdiction} options={jurisdictions} onChange={setJurisdiction} />
              </div>

              <div>
                <label className={sectionLabel}>Legislative text</label>
                <Select placeholder="All legislative texts" value={text} options={texts} onChange={setText} />
              </div>

              <div>
                <label className={sectionLabel}>UNIDROIT instrument</label>
                <Select placeholder="All UNIDROIT instruments" value={instrument} options={instruments} onChange={setInstrument} />
                <Select placeholder="All principles" value={principle} options={principles} onChange={setPrinciple} className="mt-2" />
              </div>

              <CheckboxFilter label="Status" options={statusOptions} selected={statuses} onChange={setStatuses} />
              <CheckboxFilter label="Language of text" options={langOptions} selected={languages} onChange={setLanguages} />
              <CheckboxFilter label="Legal system" options={systemOptions} selected={systems} onChange={setSystems} />

              <div>
                <label className={sectionLabel}>Date of implementation</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="From" value={fromYear} onChange={(e) => setFromYear(e.target.value)} className={control} />
                  <input type="number" placeholder="To" value={toYear} onChange={(e) => setToYear(e.target.value)} className={control} />
                </div>
              </div>

            </div>
          </aside>

          <main className="flex-1">

            {/* Tabs */}
            <div className="mb-4 flex gap-6 border-b border-stone-200">
              {[["results", "Results"], ["visualizations", "Visualizations"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === id
                      ? "border-unidroit text-unidroit"
                      : "border-transparent text-stone-500 hover:text-stone-700"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "results" && (
            <section>

            {/* Results */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Results <span className="font-normal text-stone-400">({sortedEntries.length})</span>
              </h2>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                Sort by date
                <select
                  className="rounded-sm border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-unidroit focus:ring-1 focus:ring-unidroit"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="">No sorting</option>
                  <option value="asc">Oldest first</option>
                  <option value="desc">Newest first</option>
                </select>
              </label>
            </div>

            {sortedEntries.length === 0 ? (
              <p className="mt-12 text-center text-stone-500">No results match your search and filters.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {sortedEntries.map((entry) => <Card entry={entry} key={entry.id} />)}
              </div>
            )}

            </section>
            )}

            {activeTab === "visualizations" && (
              <section>
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Visualizations <span className="font-normal text-stone-400">({sortedEntries.length} entries)</span>
              </h2>
              <p className="mt-1 text-sm text-stone-500">Charts reflect the current search and filters.</p>

              {sortedEntries.length === 0 ? (
                <p className="mt-12 text-center text-stone-500">No data matches your search and filters.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <CountBarChart title="Implementations per instrument" counts={instrumentCounts} />
                  <CountBarChart title="Implementations per principle" counts={principleCounts} />
                  <CountBarChart title="Implementations per year" counts={yearCounts} horizontal={false} numericLabels />
                  <CountBarChart title="Implementations per jurisdiction" counts={jurisdictionCounts} />
                </div>
              )}
              </section>
            )}

          </main>

        </div>

      </div>

    </div>
  )
}


export default App
