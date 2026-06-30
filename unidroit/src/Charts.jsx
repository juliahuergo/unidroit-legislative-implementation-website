import { useState, useEffect } from "react"
import Plotly from "plotly.js-dist-min"
import createPlotlyComponent from "react-plotly.js/factory"
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)
const BLUE_SCALE = [
    [0,   "#cbe3e8"],   
    [0.5, "#3a8ca0"],   
    [1,   "#014154"],   
]

function countBy(rows, key){
    const counts = {}
    for (const row of rows) {
        counts[key(row)] = (counts[key(row)] || 0) + 1
    }
        
    return (
        counts
    )
}


function Charts({data}) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const FIELDS = {
        instrument:   { label: "Instrument",        get: r => r.principle_title },
        principle:    { label: "Provision", get: r => r.subtitle },
        text:         { label: "Legislative text",  get: r => r.text_title },
        jurisdiction: { label: "Jurisdiction",      get: r => r.jurisdiction },
    }

    const [leftField, setLeftField] = useState("instrument")
    const [rightField, setRightField] = useState("text")

    const leftGet = FIELDS[leftField].get
    const rightGet = FIELDS[rightField].get

    const leftList = [...new Set(data.map(leftGet))]
    const rightList = [...new Set(data.map(rightGet))]

    const yPos = (i, n) => (n <= 1 ? 0.5 : i / (n - 1))
    const leftPos = {}, rightPos = {}
    leftList.forEach((n, i) => { leftPos[n] = [0, yPos(i, leftList.length)] })
    rightList.forEach((n, i) => { rightPos[n] = [1, yPos(i, rightList.length)] })

    const pairs = [...new Set(data.map(r => leftGet(r) + "|||" + rightGet(r)))]

    const edgeX = [], edgeY = []
    for (const pair of pairs) {
        const [l, rr] = pair.split("|||")
        edgeX.push(leftPos[l][0], rightPos[rr][0], null)
        edgeY.push(leftPos[l][1], rightPos[rr][1], null)
    }

    const leftDegree = countBy(data, leftGet)
    const rightDegree = countBy(data, rightGet)
    const short = s => (s.length > 32 ? s.slice(0, 30) + "..." : s)

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)")
        const handler = e => setIsMobile(e.matches)
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const countJurisdiction = countBy(data, row => row.jurisdiction)
    const keysJurisdictions = Object.keys(countJurisdiction)
    const valsJurisdictions = Object.values(countJurisdiction)

    const coordsByJurisdiction = {}
    for (const row of data){
        coordsByJurisdiction[row.jurisdiction] = [row.lat, row.lon]
    }

    const countDates = countBy(data, row => row.date.split("/").at(-1))
    const keysYears = Object.keys(countDates)
    const valsYears = Object.values(countDates)

    const countInstruments = countBy(data, row => row.principle_title)
    const keysInstruments = Object.keys(countInstruments)
    const valsInstruments = Object.values(countInstruments)

    const countPrinciples = countBy(data, row => row.subtitle)
    const keysPrinciples = Object.keys(countPrinciples)
    const valsPrinciples = Object.values(countPrinciples)

    const countSystems = countBy(data, row => row.legal_system)
    const keysSystems = Object.keys(countSystems)
    const valsSystems = Object.values(countSystems)


    return (
        <div className="overflow-x-auto">
            <div className="flex flex-wrap items-center gap-4 mt-6 mb-2 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                    Left 
                    <select value={leftField} onChange={e => setLeftField(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 bg-white">
                            {Object.entries(FIELDS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
                    </select>
                </label>
                <span className="text-gray-400">↔</span>
                <label className="flex items-center gap-2">
                    Right
                    <select value={rightField} onChange={e => setRightField(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 bg-white">
                            {Object.entries(FIELDS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
                    </select>
                </label>

            </div>

            {leftField === rightField ? (
                <p className="text-sm text-gray-500 mt-2">
                    Pick two different fields to see connections.
                </p>
            ) : (
                <Plot
                    data={[
                        {type: "scatter", mode: "lines", x: edgeX, y: edgeY,
                            line: {color: "#cbd5e1", width: 1}, hoverinfo: "none"},
                        {type: "scatter", mode: "markers" + (isMobile ? "" : "+text"),
                            x: leftList.map(n => leftPos[n][0]), y: leftList.map(n => leftPos[n][1]),
                            text: leftList.map(short), customdata: leftList.map(n => leftDegree[n]),
                            textposition: "middle left", textfont: {size: 10},
                            marker: {size: leftList.map(n => 10 + leftDegree[n] * 3), color: "#014154"},
                            hovertemplate: "%{text}<br>Connections:%{customdata}<extra></extra>"
                        },
                        {type: "scatter", mode: "markers" + (isMobile ? "" : "+text"),
                            x: rightList.map(n => rightPos[n][0]), y: rightList.map(n => rightPos[n][1]),
                            text: rightList.map(short), customdata: rightList.map(n => rightDegree[n]),
                            textposition: "middle right", textfont: {size: 10},
                            marker: {size: rightList.map(n => 8 + rightDegree[n] * 3), color: "#3a8ca0"},
                            hovertemplate: "%{text}<br>Connections:%{customdata}<extra></extra>"
                        }
                    ]}
                    layout={{
                        title: {text: `${FIELDS[leftField].label} ↔ ${FIELDS[rightField].label}` },
                        showlegend: false, hovermode: "closest",
                        xaxis: {visible: false, range: [-0.8, 1.8]},
                        yaxis: {visible: false},
                        margin: {l: 20, r: 20, t: 50, b: 20},
                    }}
                    useResizeHandler
                    style={{width: "100%", height: isMobile ? "400px" : "650px", minWidth: isMobile ? "0px" : "600px"}}
                />
            )
            }

            <Plot
                data={[{type:"bar", orientation: "h", x: valsJurisdictions, y: keysJurisdictions,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsJurisdictions,
                        colorscale: BLUE_SCALE,
                        showscale: false
                    }
                }]}
                layout={{title: {text: !isMobile ? "Jurisdictions with the most connections to Unidroit"
                                                : "Jurisdictions v. <br>connections"                               
                },
                        xaxis: {title: {text: "Number of implementations"}},
                        yaxis: {title: {text: "Jurisdiction", standoff: 20}, categoryorder: "total ascending", automargin: true
                        },
                        autosize: true
                }}
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px", minWidth: isMobile ? "0px" : "600px" }}
            />

            <Plot
                data={[{type:"bar", orientation: "v", x: keysYears, y: valsYears,
                    hovertemplate: "Year: %{x}<br>Implementations: %{y}<extra></extra>",
                    marker:{
                        color: valsYears,
                        colorscale: BLUE_SCALE,
                        showscale: false
                    }
                }]}
                layout={{title: {text: isMobile ? "Year v. implementations"
                                                : "Number of implementations per year"
                },
                        xaxis: {title: {text: "Year"}},
                        yaxis: {title: {text: "Number of implementations", standoff: 20}}
                }}
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px" }}
            />


            <Plot
                data={[{type:"bar", orientation: "h", x: valsInstruments, y: keysInstruments,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsInstruments,
                        colorscale: BLUE_SCALE,
                        showscale: false
                    }
                }]}
                layout={{title: {text: isMobile ? "Instruments v. implementations"
                                                : "Most implemented Unidroit instruments"
                },
                        xaxis: {title: {text: isMobile ? "Nº of implementations": "Number of implementations"}},
                        yaxis: {title: {text: "Instrument", standoff: 20}, 
                                categoryorder: "total ascending", 
                                automargin: true,
                                showticklabels: !isMobile
                        }
                }}               
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "250px" : "500px", minWidth: isMobile ? "0px" : "600px" }}
            />

            {isMobile && (
                <p className="text-xs text-gray-400 italic text-center mb-4">
                    Tap a bar to see the Unidroit instrument
                </p>
            )}

            <Plot
                data={[{type:"bar", orientation: "h", x: valsPrinciples, y: keysPrinciples,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsPrinciples,
                        colorscale: BLUE_SCALE,
                        showscale: false
                    }
                }]}
                layout={{title: {text: isMobile ? "Provisions <br> v. implementations"
                                                : "Most implemented Unidroit provisions"},
                        xaxis: {title: {text: isMobile ? "Nº of implementations"
                                                        : "Number of implementations"}},
                        yaxis: {title: {text: "Provision", standoff: 20}, 
                                categoryorder: "total ascending", 
                                automargin: true,
                                showticklabels: !isMobile
                        }
                }}    
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px", minWidth: isMobile ? "0px" : "600px"}}
            />

            {isMobile && (
                <p className="text-xs text-gray-400 italic text-center mb-4">
                    Tap a bar to see the Unidroit provision
                </p>
            )}

            <Plot
                data={[{type: "pie", labels: keysSystems, values: valsSystems,
                    hovertemplate: "%{label}<br>%{value} implementations (%{percent})<extra></extra>"
                }]}
                layout={{title: {text: isMobile ? "Legal systems that <br> have implemented Unidroit" : "Legal systems that have implemented Unidroit"}}}
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px", minWidth: isMobile ? "0px" : "600px"}}
            />

            <Plot
                data={[{type: "scattergeo", 
                    lat: keysJurisdictions.map(j =>  coordsByJurisdiction[j]?.[0]),
                    lon: keysJurisdictions.map(j => coordsByJurisdiction[j]?.[1]),
                    customdata: valsJurisdictions,
                    text: keysJurisdictions, 
                    marker: {
                        size: valsJurisdictions, 
                        color: valsJurisdictions,
                        sizemode: "area", 
                        sizeref: 2* Math.max(...valsJurisdictions) / (40**2),
                        sizemin: 4,
                        colorscale: BLUE_SCALE, 
                        showscale: !isMobile, 
                        colorbar: {title: {text: "Number of implementations"}}
                    },
                    hovertemplate: "%{text}<br>Implementations: %{customdata}<extra></extra>"
                }]}
                layout={{title: {text: isMobile ? "Jurisdictions implementing <br> Unidroit instruments" : "Jurisdictions implementing Unidroit instruments"}, 
                        geo: {projection: {type: "natural earth"}}
            }}
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px", minWidth: isMobile ? "0px" : "600px"}}
            />
        </div>
    )
}

export default Charts
