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
  return(
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
    Ongoing: "bg-gray-100 text-gray-800",
    Enacted: "bg-yellow-100 text-yellow-800",
    Commenced: "bg-green-100 text-green-800"
  }

  //Within this text, group the connections by UNIDROIT instrument (principle_title)
  //so each instrument title shows once, with its article connections listed below
  const byInstrument = Object.values(
    group.implementations.reduce((acc, impl) => {
      (acc[impl.principle_title] ??= {principle_title: impl.principle_title, connections: []}).connections.push(impl)
      return acc
    }, {})
  )

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <h3 className="text-lg font-bold">{group.text_title}</h3>
      <span className={`inline-block mt-2 ml-2 px-2 py-0.5 text-xs rounded ${STATUS_COLOURS[group.status] || "bg-gray-100"}`}>{group.status}</span>
      <p className="text-sm text-gray-600 mt-2">
        {group.jurisdiction} · {group.legal_system} · {group.date}
      </p>

      <h4 className="mt-3 text-sm uppercase text-gray-500">Implements</h4>
      {byInstrument.map(instrument => (
        <div key={instrument.principle_title} className="mt-3">
          <p className="font-semibold">{instrument.principle_title}</p>
          {instrument.connections.map(conn => (
            <div key={conn.id} className="mt-4 border-l-2 border-gray-200 pl-3">
              <p>{conn.subtitle} (Principle {conn["num principle/article"]})</p>
              <Field label="Sections" value={conn.sections}/>
              <Field label="Summary" value={conn.summary}/>
              <Field label="Notes" value={conn.notes}/>
            </div>
          ))}
        </div>
      ))}


      <h4 className="mt-3 text-sm uppercase text-gray-500">Details</h4>
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
  //We define the variables we'll then display

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
  const [jurisdictions, setJurisdictions] = useState([])
  const [texts, setTexts] = useState([])
  const [instruments, setInstruments] = useState([])
  const [principles, setPrinciples] = useState([])
  const [languages, setLanguages] = useState([])
  const [statuses, setStatuses] = useState([])
  const [systems, setSystems] = useState([])
  const [searched, setSearched] = useState("")
  const [fromYear, setFromYear] = useState("")
  const [toYear, setToYear] = useState("")

  //For the visualizations/results tabs
  const [activeTab, setActiveTab] = useState("results")

  //For the phone version
  const [showFilters, setShowFilters] = useState(false)

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

  return (
    <div className="px-4 md:px-8 pb-8 pt-4">
      <header className="flex items-center gap-3 pb-4 pt-0 border-b border-gray-300 mb-5">
        <a href="https://www.unidroit.org/" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3">
        <img src="/unidroit_logo.png" alt="UNIDROIT" className="h-10 md:h-15"/>
        <h1 className="text-lg md:text-2xl font-semibold ml-3 font-display">
          Soft-Law Implementation Database
        </h1>
        </a>
      </header>
      <button
        onClick = {() => setShowFilters(!showFilters)}
        className="md:hidden mb-4 px-4 py-2 border border-gray-300 rounded-md"
      >
        {showFilters ? "Hide filters" : "Show filters"}
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-72 space-y-4`}>
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
              className="border border-gray-300 rounded-md px-2 py-1"
            />

            <input
              type="number"
              value={toYear}
              onChange={e => setToYear(e.target.value)}
              placeholder="To year"
              className="border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
          
        </aside>

        <main className="flex-1">
          <input
            type="search"
            value={searched}
            onChange={e => setSearched(e.target.value)}
            placeholder="Search by jurisdiction, legislative text, UNIDROIT principle..."
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab("results")}
              className={"px-4 py-2 rounded-t-md " +
                (activeTab === "results"
                  ? "border border-b-0 border-gray-300 -mb-px bg-white"
                  : "border border-transparent text-gray-500"
                )
              }
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab("visualizations")}
              className={"px-4 py-2 rounded-t-md " +
                (activeTab === "visualizations"
                  ? "border border-b-0 border-gray-300 -mb-px bg-white"
                  : "border border-transparent text-gray-500"
                )
              }
            >
              Visualizations
            </button>
          </div>

          <div className="border border-gray-300 border-t-0 p-4">
            {activeTab === "results" && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {grouped.length} legislative {grouped.length === 1 ? "text": "texts"} · {filtered.length} connections
                </p>
                {grouped.map(group => <ResultCard key={group.id} group={group}/>)}
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