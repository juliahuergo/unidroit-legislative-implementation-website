import { useState, useEffect } from "react"



function Card({ entry }) {
  return(
    <div
    className="bg-blue-50 rounded-lg shadow p-6 mb-4">
      <p><span className="font-semibold">Title: </span>{entry.text_title}</p>
      <p><span className="font-semibold">Jurisdiction: </span>{entry.jurisdiction}</p>
      <p><span className="font-semibold">Legal system: </span>{entry.legal_system}</p>
      <p><span className="font-semibold">Promulgating body: </span>{entry.promulgating_body}</p>
      <p><span className="font-semibold">Date: </span>{entry.date}</p>
      <p><span className="font-semibold">Status: </span>{entry.status}</p>
      <p>❯ <a href={entry.link} target="_blank">View document</a></p>
      <p><span className="font-semibold">Language: </span>{entry.text_language}</p>
      {entry.jurisdiction === "United States" && <p><span className="font-semibold">US states enacted: </span>{entry.states_usa}</p>}
      <p><span className="font-semibold">UNIDROIT instrument: </span>{entry.principle_title}</p>
      <p><span className="font-semibold">Subtitle: </span>{entry.subtitle}</p>
      <p><span className="font-semibold">Principle number: </span>{entry['num principle/article']}</p>
      <p><span className="font-semibold">Type: </span>{entry.type}</p>
      <p><span className="font-semibold">Sections: </span>{entry.sections}</p>
      <p><span className="font-semibold">Strength: </span>{entry.strength}</p>
      <p><span className="font-semibold">Summary: </span>{entry.summary}</p>
      <p><span className="font-semibold">Notes: </span>{entry.notes}</p>


    </div>
  )
}


function App() {
  const [searchText, setSearchText] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [text, setText] = useState("")
  const [principle, setPrinciple] = useState("")
  const [entries, setEntries] = useState([])

  useEffect(() => {
    fetch("/result.json")
      .then(res => res.json())
      .then(data => setEntries(data))
  }, [])

  return (
    <div>

    <div>
      {/* Header */}
      <div className="bg-blue-900 text-white px-8 py-6">
        <h1 className="text-3xl font-bold">Unidroit Implementation Database</h1>
        <p className="text-blue-200 mt-1 text-sm">Legislative implementation of UNIDROIT soft-law instruments worldwide
        </p>
      </div>
    
    </div>

    <div className="w-350 mt-6 max-w-2x1 mx-auto">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by jurisdiction, legislative text, Unidroit principle..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-350 border border-gray-500"
      />
    </div>
      
    <div className="ml-3 mt-5 mr-3">
      {/* Dropdowns */}
      <p>Select by jurisidiction:</p>
      <select value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}>
        <option value="" disabled>Select a jurisdiction...</option>
        <option value="United States">United States</option>
        <option value="Dubai">Dubai</option>
        <option value="Italy">Italy</option>
        <option value="Scotland">Scotland</option>
        <option value="Ukraine">Ukraine</option>
      </select>

      <hr className="mt-5"></hr>

      <p className="mt-5">Select by legislative text</p>
      <select value={text}
              onChange={(e) => setText(e.target.value)}>
        <option value="" disabled>Select a legislative text...</option>
        <option value="Amendments to the Uniform Commercial Code (UCC)">Amendments to the Uniform Commercial Code (UCC)</option>
        <option value="Digital Assets Law (DAL) — DIFC Law No. 2 of 2024">Digital Assets Law (DAL) — DIFC Law No. 2 of 2024</option>
        <option value="Decree-Law No. 25 of 17 March 2023 with Conversion Law No. 52 of 10 May 2023">Decree-Law No. 25 of 17 March 2023 with Conversion Law No. 52 of 10 May 2023</option>
        <option value="Digital Assets (Scotland) Act">Digital Assets (Scotland) Act</option>
        <option value='Law of Ukraine No. 4466-IX "On Factoring"'>Law of Ukraine No. 4466-IX "On Factoring"</option>
      </select>

      <hr className="mt-5"></hr>

      <p className="mt-5">Select by Unidroit instrument</p>
      <select value={principle}
              onChange={(e) => setPrinciple(e.target.value)}>
        <option value="" disabled>Select an instrument...</option>
        <option value="General Principles">General Principles</option>
        <option value="Control">Control</option>
        <option value="Identification of a person in control of a digital asset">Identification of a person in control of a digital asset</option>
        <option value="Innocent aquisition">Innocent aquisition</option>
        <option value="Requirements for the transfer of a receivable">Requirements for the transfer of a receivable</option>
      </select>

      <hr className="mt-5"></hr>

    </div>

    <div className="mt-8">
      {/* Results */}
      <h2 className="mr-3 bg-amber-200">Here are the results:</h2>
      {entries.map(entry => <Card entry={entry} key={entry.id}/>)}

    </div>


    </div>

    
     

      
  )
  }



  export default App