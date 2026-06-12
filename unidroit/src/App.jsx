import { useState, useEffect } from "react"

// Shared looks for form controls and sidebar section labels
const control = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800"
const sectionLabel = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5"


function Detail({ label, value }) {
  if (!value) return null
  return (
    <p className="text-sm text-gray-700">
      <span className="font-medium text-gray-900">{label}: </span>{value}
    </p>
  )
}


function Card({ entry }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">{entry.text_title}</h3>
        {entry.status && (
          <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">
            {entry.status}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-gray-500">
        {entry.jurisdiction}
        {entry.date && ` · ${entry.date}`}
        {entry.legal_system && ` · ${entry.legal_system}`}
        {entry.text_language && ` · ${entry.text_language}`}
      </p>

      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">UNIDROIT instrument</p>
        <p className="mt-1 text-sm font-medium text-gray-800">{entry.principle_title}</p>
        <p className="text-sm text-gray-600">
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
           className="mt-4 inline-block text-sm font-medium text-blue-900 hover:text-blue-700 hover:underline">
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


  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "result.json")
      .then(res => res.json())
      .then(data => setEntries(data))
  }, [])

  const jurisdictions = [...new Set(entries.map(e => e.jurisdiction))].sort()
  const texts = [...new Set(entries.map(e => e.text_title))].sort()
  const instruments = [...new Set(entries.map(e => e.principle_title))].sort()
  const principles = [...new Set(entries.map(e => e.subtitle))].sort()

  const statusOptions = [...new Set(entries.map(e => e.status))].sort()
  const langOptions = [...new Set(entries.flatMap(e => (e.text_language || "").split("/").map(l => l.trim())))].filter(l => l !== "").sort()
  const systemOptions = [...new Set(entries.map(e => e.legal_system))].sort()

  const getYear = (entry) => Number((entry.date || "").split("/").pop())
  const getDateValue = (entry) => {
    const parts = (entry.date || "").split("/")
    const year = Number(parts[parts.length - 1]) || 0
    const month = Number(parts[parts.length - 2]) || 0
    const day = Number(parts[parts.length - 3]) || 0
    return year * 10000 + month * 100 + day
  }

  const filteredEntries = entries.filter(entry =>
    (jurisdiction === "" || entry.jurisdiction === jurisdiction) &&
    (text === "" || entry.text_title === text) &&
    (instrument === "" || entry.principle_title === instrument) &&
    (principle === "" || entry.subtitle === principle) &&
    (
      (entry.jurisdiction && entry.jurisdiction.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.summary && entry.summary.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.text_title && entry.text_title.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.legal_system && entry.legal_system.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.promulgating_body && entry.promulgating_body.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.principle_title && entry.principle_title.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.subtitle && entry.subtitle.toLowerCase().includes(searchText.toLowerCase())) ||
      (entry.type && entry.type.toLowerCase().includes(searchText.toLowerCase()))
    ) &&
    (statuses.length === 0 || statuses.includes(entry.status)) &&
    (languages.length === 0 || (entry.text_language || "").split("/").some(l => languages.includes(l.trim()))) &&
    (systems.length === 0 || systems.includes(entry.legal_system)) &&
    (fromYear === "" || getYear(entry) >= Number(fromYear)) &&
    (toYear === "" || getYear(entry) <= Number(toYear))
  )

  const sortedEntries = sortOrder === "" ? filteredEntries : [...filteredEntries].sort((a, b) => sortOrder === "asc" ? getDateValue(a) - getDateValue(b) : getDateValue(b) - getDateValue(a))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-900 text-white px-8 py-7">
        <h1 className="text-3xl font-bold tracking-tight">UNIDROIT Implementation Database</h1>
        <p className="text-blue-200 mt-1 text-sm">Legislative implementation of UNIDROIT soft-law instruments worldwide</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* Search bar */}
        <div className="max-w-2xl mt-8 mx-auto">
          <input
            type="text"
            placeholder="Search by jurisdiction, legislative text, UNIDROIT principle..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800"
          />
        </div>

        <div className="flex gap-8 mt-8">

          <aside className="w-64 shrink-0">
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-5">

              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>

              <div>
                <label className={sectionLabel}>Jurisdiction</label>
                <select className={control}
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}>
                  <option value="">All jurisdictions</option>
                  {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              <div>
                <label className={sectionLabel}>Legislative text</label>
                <select className={control}
                        value={text}
                        onChange={(e) => setText(e.target.value)}>
                  <option value="">All legislative texts</option>
                  {texts.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={sectionLabel}>UNIDROIT instrument</label>
                <select className={control}
                        value={instrument}
                        onChange={(e) => setInstrument(e.target.value)}>
                  <option value="">All UNIDROIT instruments</option>
                  {instruments.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select className={`${control} mt-2`}
                        value={principle}
                        onChange={(e) => setPrinciple(e.target.value)}>
                  <option value="">All principles</option>
                  {principles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className={sectionLabel}>Status</label>
                <div className="space-y-1">
                  {statusOptions.map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-900"
                        checked={statuses.includes(s)}
                        onChange={() => setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      />
                      {s}
                    </label>))}
                </div>
              </div>

              <div>
                <label className={sectionLabel}>Language of text</label>
                <div className="space-y-1">
                  {langOptions.map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-900"
                        checked={languages.includes(s)}
                        onChange={() => setLanguages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      />
                      {s}
                    </label>))}
                </div>
              </div>

              <div>
                <label className={sectionLabel}>Legal system</label>
                <div className="space-y-1">
                  {systemOptions.map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-blue-900"
                        checked={systems.includes(s)}
                        onChange={() => setSystems(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      />
                      {s}
                    </label>))}
                </div>
              </div>

              <div>
                <label className={sectionLabel}>Date of implementation</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    className={control}
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className={control}
                  />
                </div>
              </div>

            </div>
          </aside>

          <main className="flex-1">

            {/* Results */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Results <span className="font-normal text-gray-400">({sortedEntries.length})</span>
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Sort by date
                <select
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-800/30"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="">No sorting</option>
                  <option value="asc">Oldest first</option>
                  <option value="desc">Newest first</option>
                </select>
              </label>
            </div>

            {sortedEntries.length === 0 ? (
              <p className="mt-12 text-center text-gray-500">No results match your search and filters.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {sortedEntries.map(entry => <Card entry={entry} key={entry.id} />)}
              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  )
}


export default App
