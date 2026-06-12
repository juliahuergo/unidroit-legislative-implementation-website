import { useState, useEffect } from "react"


function Card({ entry }) {
  return (
    <div className="bg-blue-50 rounded-lg shadow p-6 mb-4">
      <p><span className="font-semibold">Title: </span>{entry.text_title}</p>
      <p><span className="font-semibold">Jurisdiction: </span>{entry.jurisdiction}</p>
      <p><span className="font-semibold">Legal system: </span>{entry.legal_system}</p>
      <p><span className="font-semibold">Promulgating body: </span>{entry.promulgating_body}</p>
      <p><span className="font-semibold">Date: </span>{entry.date}</p>
      <p><span className="font-semibold">Status: </span>{entry.status}</p>
      <p> <a href={entry.link} target="_blank">View document</a></p>
      <p><span className="font-semibold">Language: </span>{entry.text_language}</p>
      {entry.jurisdiction === "United States" && <p><span className="font-semibold">US states enacted: </span>{entry.states_usa}</p>}
      <p><span className="font-semibold">UNIDROIT instrument: </span>{entry.principle_title}</p>
      <p><span className="font-semibold">Subtitle: </span>{entry.subtitle}</p>
      <p><span className="font-semibold">Principle number: </span>{entry['num principle/article']}</p>
      <p><span className="font-semibold">Type: </span>{entry.type}</p>
      <p><span className="font-semibold">Sections: </span>{entry.sections}</p>
      <p><span className="font-semibold">Summary: </span>{entry.summary}</p>
      <p><span className="font-semibold">Notes: </span>{entry.notes}</p>
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
    fetch("/result.json")
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
      <div className="bg-blue-900 text-white px-8 py-6">
        <h1 className="text-3xl font-bold">Unidroit Implementation Database</h1>
        <p className="text-blue-200 mt-1 text-sm">Legislative implementation of UNIDROIT soft-law instruments worldwide</p>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* Search bar */}
        <div className="max-w-2xl mt-6 mx-auto">
          <input
            type="text"
            placeholder="Search by jurisdiction, legislative text, Unidroit principle..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-500"
          />
        </div>

        <div className="flex gap-8 mt-6">

          <aside className="w-64 shrink-0">

            {/* Dropdowns */}
            <div>
              <p>Select by jurisidiction:</p>
              <select className="w-full"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}>
                <option value="">All jurisdictions</option>
                {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
              </select>

              <hr className="mt-5"></hr>

              <p className="mt-5">Select by legislative text</p>
              <select className="w-full"
                      value={text}
                      onChange={(e) => setText(e.target.value)}>
                <option value="">All legislative texts</option>
                {texts.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <hr className="mt-5"></hr>

              <p className="mt-5">Select by Unidroit instrument</p>
              <select className="w-full"
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}>
                <option value="">All UNIDROIT instruments</option>
                {instruments.map(i => <option key={i} value={i}>{i}</option>)}
              </select>

              <select className="w-full"
                      value={principle}
                      onChange={(e) => setPrinciple(e.target.value)}>
                <option value="">And a specific one:</option>
                {principles.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <hr className="mt-5"></hr>
            </div>

            {/* Checkboxes */}
            <div>
              {/* STATUS */}
              <p className="mt-5">Status</p>
              {statusOptions.map(s => (
                <label key={s} className="block">
                  <input
                    type="checkbox"
                    checked={statuses.includes(s)}
                    onChange={() => setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  />
                  {" "}{s}
                </label>))}

              {/* LANGUAGE */}
              <p className="mt-5">Language of text</p>
              {langOptions.map(s => (
                <label key={s} className="block">
                  <input
                    type="checkbox"
                    checked={languages.includes(s)}
                    onChange={() => setLanguages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  />
                  {" "}{s}
                </label>))}

              {/* SYSTEM */}
              <p className="mt-5">Legal system</p>
              {systemOptions.map(s => (
                <label key={s} className="block">
                  <input
                    type="checkbox"
                    checked={systems.includes(s)}
                    onChange={() => setSystems(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  />
                  {" "}{s}
                </label>))}

              {/* Date range */}
              <p className="mt-5">Date of implementation</p>
              <div>
                <input
                  type="number"
                  placeholder="From year"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  className="w-full border border-gray-500"
                />
                <input
                  type="number"
                  placeholder="To year"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  className="w-full border border-gray-500"
                />
              </div>
            </div>

          </aside>

          <main className="flex-1">

            {/* Results */}
            <div className="mt-8">
              <h2 className="mr-3 bg-amber-200">Here are the results:</h2>
              <label className="block mt-2">
                Sort by date:{" "}
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="">No sorting</option>
                  <option value="asc">Oldest first</option>
                  <option value="desc">Newest first</option>
                </select>
              </label>

              {sortedEntries.map(entry => <Card entry={entry} key={entry.id} />)}
            </div>

          </main>

        </div>

      </div>

    </div>
  )
}


export default App
