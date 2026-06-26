import { useState, useEffect } from "react"
import Plotly from "plotly.js-dist-min"
import createPlotlyComponent from "react-plotly.js/factory"
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)
const BLUE_SCALE = [
    [0,   "#eff6ff"],   
    [0.5, "#60a5fa"],   
    [1,   "#1e3a8a"],   
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
            <Plot
                data={[{type:"bar", orientation: "h", x: valsJurisdictions, y: keysJurisdictions,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsJurisdictions,
                        colorscale: "BLUE_SCALE",
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
                        colorscale: "BLUE_SCALE",
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
                        colorscale: "BLUE_SCALE",
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
                <p className="text-xs text-gray-400 itali text-center mb-4">
                    Tap a bar to see the Unidroit instrument
                </p>
            )}

            <Plot
                data={[{type:"bar", orientation: "h", x: valsPrinciples, y: keysPrinciples,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsPrinciples,
                        colorscale: "BLUE_SCALE",
                        showscale: false
                    }
                }]}
                layout={{title: {text: isMobile ? "Principles/Articles <br> v. implementations"
                                                : "Most implemented Unidroit principles/articles"},
                        xaxis: {title: {text: isMobile ? "Nº of implementations"
                                                        : "Number of implementations"}},
                        yaxis: {title: {text: "Principle/Article", standoff: 20}, 
                                categoryorder: "total ascending", 
                                automargin: true,
                                showticklabels: !isMobile
                        }
                }}    
                useResizeHandler
                style={{ width: "100%", height: isMobile ? "300px" : "500px", minWidth: isMobile ? "0px" : "600px"}}
            />

            {isMobile && (
                <p className="text-xs text-gray-400 itali text-center mb-4">
                    Tap a bar to see the Unidroit principle/article
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
                        colorscale: "BLUE_SCALE", 
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
