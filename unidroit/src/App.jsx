import { useState, useEffect } from "react"
import Charts from "./Charts"
import Select from "react-select"

function MultiSelect({options, setter, value, label}){
  return(
    <label className="block"> 
      <span className="block mb-1.5">{label}</span> 
      <Select 
        isMulti
        options={options.map(o => ({value: o, label: o}))}
        value={value.map(v => ({value: v, label: v}))}
        onChange={selected => setter(selected.map(s => s.value))}
      />
    </label>
  )
}

function CheckBoxGroup({options, setter, value, label}){
  return (
    <div>
      <p>{label}</p>
      {options.map(option =>
        (
          <label className="block" key={option}>
            <input
              type="checkbox"
              className="mr-2 mb-1.5"
              checked={value.includes(option)}
              onChange={() => setter(
                value.includes(option)
                  ? value.filter(v => v !== option) //already selected -> we remove it
                  : [...value, option] //not selected -> we add it
              )}
            />
            {option}
          </label>
        )
      )}
    </div>
  )
}

function Field({label, value}){
  if(!value) return null
  return <p>
    <span className="font-semibold">
      {label}: 
    </span>
    {" "} {value}
  </p>
}

function ResultCard({group}){

  const STATUS_COLOURS = {
    Ongoing: "bg-slate-100 text-slate-800",
    Enacted: "bg-amber-100 text-amber-800",
    Commenced: "bg-emerald-100 text-emerald-800"
  }

  const byInstrument = Object.values(
    group.implementations.reduce((acc, impl) => {
      (acc[impl.principle_title] ??= {principle_title: impl.principle_title, connections: []}).connections.push(impl)
      return acc
    }, {})
  )

  return (
    <div className="bg-white rounded-md p-4 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition">
      <h3 className="text-lg font-bold">{group.text_title}</h3>
      <span className={`inline-block mt-2 ml-2 px-2 py-0.5 text-xs rounded ${STATUS_COLOURS[group.status] || "bg-slate-100"}`}>{group.status}</span>
      <p className="text-sm text-slate-600 mt-2">
        {group.jurisdiction} · {group.legal_system} · {group.date}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        Implements {group.implementations.length} {" "}
        {group.implementations.length === 1 ? "principle/article" : "principles/articles"} across {" "}
        {byInstrument.length} {" "}
        {byInstrument.length === 1 ? "instrument" : "instruments"} 
      </p>

      <h4 className="mt-3 text-sm uppercase text-slate-500">Implements</h4>
      {byInstrument.map(instrument => (
        <div key={instrument.principle_title} className="mt-3">
          <p className="font-semibold">{instrument.principle_title}</p>
          {instrument.connections.map(conn => (
            <div key={conn.id} className="mt-4 border-l-2 border-slate-200 pl-3">
              <p>{conn.subtitle} (Principle {conn["num principle/article"]})</p>
              <Field label="Sections" value={conn.sections}/>
              <Field label="Summary" value={conn.summary}/>
              <Field label="Notes" value={conn.notes}/>
            </div>
          ))}
        </div>
      ))}


      <h4 className="mt-3 text-sm uppercase text-slate-500">Details</h4>
      <Field label= "Promulgating body" value={group.promulgating_body}/>
      <Field label= "Language of text" value={group.text_language}/>
      <Field label= "States involved" value={group.states_usa}/>

      {group.link && <a href={group.link} rel="noopener noreferrer" target="_blank" className="text-blue-600 underline">Source</a>}
      <br/>
      {group.perma_link && <a href={group.perma_link} rel="noopener noreferrer" target="_blank">If the link doesn't work, click <span className="text-blue-600 underline">here</span> for the screenshotted document.</a>}
    </div>
  )
}

function App() {
  
  const params = new URLSearchParams(window.location.search)

  //All the objects are stored in data
  const [data, setData] = useState([])
  useEffect(() => {fetch(import.meta.env.BASE_URL + "result.json").then(r => r.json()).then(setData) }, [])

  //For the filters (all the unique available values)
  const all_jurisdictions = [...new Set(data.map(row => row.jurisdiction))]
  const all_texts = [...new Set(data.map(row => row.text_title))]
  const all_instruments = [...new Set(data.map(row => row.principle_title))]
  const all_principles = [...new Set(data.map(row => row.subtitle))]
  const all_languages = [...new Set(data.flatMap(row => row.text_language.split("/")))]
  const all_statuses = [...new Set(data.map(row => row.status))]
  const all_systems = [...new Set(data.map(row => row.legal_system))]

  

  //FROM the filters (the ones that the user chooses)
  const [jurisdictions, setJurisdictions] = useState(() => params.getAll("jurisdiction"))
  const [texts, setTexts] = useState(() => params.getAll("text"))
  const [instruments, setInstruments] = useState(() => params.getAll("instrument"))
  const [principles, setPrinciples] = useState(() => params.getAll("principle"))
  const [languages, setLanguages] = useState(() => params.getAll("language"))
  const [statuses, setStatuses] = useState(() => params.getAll("status"))
  const [systems, setSystems] = useState(() => params.getAll("system"))
  const [searched, setSearched] = useState(() => params.get("q") || "")
  const [fromYear, setFromYear] = useState(() => params.get("from") || "")
  const [toYear, setToYear] = useState(() => params.get("to") || "")
  const [sortBy, setSortBy] = useState(() => params.get("sort") || "year-desc")

  //For the visualizations/results tabs
  const [activeTab, setActiveTab] = useState("results")

  //For the phone version
  const [showFilters, setShowFilters] = useState(false)

  function clearFilters(){
    setJurisdictions([]);
    setTexts([]);
    setInstruments([]);
    setPrinciples([]);
    setLanguages([]);
    setStatuses([]);
    setSystems([]);
    setSearched("");
    setFromYear("");
    setToYear("");
  }

  useEffect(() => {
    const p = new URLSearchParams()
    jurisdictions.forEach(v => p.append("jurisdiction", v))
    texts.forEach(v => p.append("text", v))
    instruments.forEach(v => p.append("instrument", v))
    principles.forEach(v => p.append("principle", v))
    languages.forEach(v => p.append("language", v))
    statuses.forEach(v => p.append("status", v))
    systems.forEach(v => p.append("system", v))
    if (searched) p.set("q", searched)
    if (fromYear) p.set("from", fromYear)
    if (toYear) p.set("to", toYear)
    if (sortBy !== "year-desc") p.set("sort", sortBy)

    const qs = p.toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)},
    [jurisdictions, texts, instruments, principles, languages, statuses, systems, searched, fromYear, toYear, sortBy]
  )

  //Filter function (texts that pass the filters)
  const caseInsensitiveSearched = searched.toLowerCase()
  const filtered = data.filter(
    row =>
      (jurisdictions.length === 0 || jurisdictions.includes(row.jurisdiction)) &&
      (texts.length === 0 || texts.includes(row.text_title)) &&
      (instruments.length === 0 || instruments.includes(row.principle_title)) &&
      (principles.length === 0 || principles.includes(row.subtitle)) &&
      (languages.length === 0 || row.text_language.split("/").some(lang => languages.includes(lang))) &&
      (statuses.length === 0 || statuses.includes(row.status)) &&
      (systems.length === 0 || systems.includes(row.legal_system)) &&
      (searched === "" ||
        [row.summary, row.notes, row.text_title, row.jurisdiction, row.legal_system, row.promulgating_body, row.principle_title, row.subtitle].some(field => field?.toLowerCase().includes(caseInsensitiveSearched))
      ) &&
      (fromYear === "" || row.date.split("/").at(-1) >= Number(fromYear)) &&
      (toYear === "" || row.date.split("/").at(-1) <= Number(toYear))
  )


  const grouped = Object.values(
    filtered.reduce((acc, row) => {
      (acc[row.text_id] ??= {...row,
        implementations: []
      }).implementations.push(row)
        return acc
    }, {}))

  const year = g => Number(g.date.split("/").at(-1))

  const sorted = [...grouped].sort((a, b) => {
    switch (sortBy) {
      case "year-desc": return year(b) - year(a)
      case "year-asc": return year(a) - year(b)
      case "jur-asc": return a.jurisdiction.localeCompare(b.jurisdiction)
      case "conn-desc": return b.implementations.length - a.implementations.length 
      default: return 0
    }
  })

  const distinctJurisdictions = new Set(filtered.map(r => r.jurisdiction)).size
  const distinctInstruments = new Set(filtered.map(r => r.principle_title)).size


  const stats = [
    {label: "Legislative texts", value: grouped.length},
    {label: "Jurisdictions", value: distinctJurisdictions},
    {label: "Instruments", value: distinctInstruments},
    {label: "Connections", value: filtered.length}
  ]

  const arrayFilters = [
    { label: "Jurisdiction",  values: jurisdictions, setter: setJurisdictions },
    { label: "Text",          values: texts,         setter: setTexts },
    { label: "Instrument",    values: instruments,   setter: setInstruments },
    { label: "Principle",     values: principles,    setter: setPrinciples },
    { label: "Language",      values: languages,     setter: setLanguages },
    { label: "Status",        values: statuses,      setter: setStatuses },
    { label: "Legal system",  values: systems,       setter: setSystems },
  ]

  const chips = []
  for (const f of arrayFilters) {
    for (const v of f.values) {
      chips.push({
        key: `${f.label}-${v}`,
        text: `${f.label}: ${v}`,
        remove: () => f.setter(f.values.filter(x => x !== v)),
      })
    }
  }

  if (searched) chips.push({key: "search", text: `Search: "${searched}"`, remove: () => setSearched("")})
  if (fromYear) chips.push({key: "from", text: `From ${fromYear}`, remove: () => setFromYear("")})
  if (toYear) chips.push({key: "to", text: `To ${toYear}`, remove: () => setToYear("")})

  return (
    <div className="px-4 md:px-8 pb-8 pt-4 bg-slate-50 min-h-screen">
      <header className="flex items-center gap-3 pb-4 pt-0 border-b border-slate-300 mb-5">
        <a href="https://www.unidroit.org/" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3">
        <img src="/unidroit_logo.png" alt="UNIDROIT" className="h-10 md:h-15"/>
        <h1 className="text-lg md:text-2xl font-semibold ml-3 font-display">
          Soft-Law Implementation Database
        </h1>
        </a>
      </header>
      <p className="text-lg text-slate-600 mb-5 max-w-4xl">
        Catalogue of international legislative implementation of UNIDROIT's soft-law instruments.
      </p>
      
      <button
        onClick = {() => setShowFilters(!showFilters)}
        className="md:hidden mb-4 px-4 py-2 border border-slate-300 rounded-md"
      >
        {showFilters ? "Hide filters" : "Show filters"}
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-72 space-y-4`}>
          <button onClick={clearFilters} className="text-sm text-accent underline">Clear all filters</button>
          <MultiSelect options={all_jurisdictions} value={jurisdictions} setter={setJurisdictions} label="Jurisdiction"/>
          <MultiSelect options={all_texts} value={texts} setter={setTexts} label="Legislative text"/>
          <MultiSelect options={all_instruments} value={instruments} setter={setInstruments} label="Unidroit instrument"/>
          <MultiSelect options={all_principles} value={principles} setter={setPrinciples} label="Principle/Article"/>

          <CheckBoxGroup options={all_statuses} value={statuses} setter={setStatuses} label="Status"/>
          <CheckBoxGroup options={all_languages} value={languages} setter={setLanguages} label="Language"/>
          <CheckBoxGroup options={all_systems} value={systems} setter={setSystems} label="Legal system"/>

          <div>
            <p className="mb-1.5">Date</p>
            <input
              type="number"
              value={fromYear}
              onChange={e => setFromYear(e.target.value)}
              placeholder="From year"
              className="border border-slate-300 rounded-md px-2 py-1"
            />

            <input
              type="number"
              value={toYear}
              onChange={e => setToYear(e.target.value)}
              placeholder="To year"
              className="border border-slate-300 rounded-md px-2 py-1"
            />
          </div>
          
        </aside>

        <main className="flex-1">
          <input
            type="search"
            value={searched}
            onChange={e => setSearched(e.target.value)}
            placeholder="Search by jurisdiction, legislative text, UNIDROIT principle..."
            className="w-full mb-6 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="flex border-b border-slate-300">
            <button
              onClick={() => setActiveTab("results")}
              className={"px-4 py-2 rounded-t-md " +
                (activeTab === "results"
                  ? "border border-b-0 border-slate-300 -mb-px bg-slate-150"
                  : "border border-transparent text-slate-500"
                )
              }
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab("visualizations")}
              className={"px-4 py-2 rounded-t-md " +
                (activeTab === "visualizations"
                  ? "border border-b-0 border-slate-300 -mb-px bg-slate-150"
                  : "border border-transparent text-slate-500"
                )
              }
            >
              Visualizations
            </button>
          </div>

          <div className="border border-slate-300 border-t-0 p-4">
            {activeTab === "results" && (
              <>
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chips.map(chip => (
                      <button
                        key={chip.key}
                        onClick={chip.remove}
                        className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-black/10 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {chip.text}
                        <span className="text-slate-400">✕</span>
                      </button>
                    ))}
                  </div>
                )}
                {data.length === 0
                  ? (<p className="text-slate-500">Loading...</p>)
                  : grouped.length === 0
                    ? (<p className="text-slate-500">No results match these filters.</p>)
                    : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                          {stats.map(s => (
                            <div key={s.label} className="rounded-lg bg-white ring-1 ring-black/5 shadow-sm px-4 py-2">
                              <div className="text-lg font-semibold text-slate-900">{s.value}</div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                          Sort by
                          <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border border-slate-300 rounded-md px-2 py-1 bg-white"
                          >
                            <option value="year-desc">Year (newest)</option>
                            <option value="year-asc">Year (oldest)</option>
                            <option value="jur-asc">Jurisdiction (A-Z)</option>
                            <option value="conn-desc">Most connections</option>
                          </select>
                        </label>
                        {sorted.map(group => <ResultCard key={group.id} group={group}/>)}
                      </>
                    )}
              </>
            )}
            {activeTab === "visualizations" && (<Charts data={filtered}/>)}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App