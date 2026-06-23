import Plotly from "plotly.js-dist-min"
import createPlotlyComponent from "react-plotly.js/factory"
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)

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
    const countJurisdiction = countBy(data, row => row.jurisdiction)
    const keysJurisdictions = Object.keys(countJurisdiction)
    const valsJurisdictions = Object.values(countJurisdiction)

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
        <div>
            <Plot
                data={[{type:"bar", orientation: "h", x: valsJurisdictions, y: keysJurisdictions,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsJurisdictions,
                        colorscale: "Blues",
                        showscale: false
                    }
                }]}
                layout={{title: {text: "Jurisdictions with the most connections to Unidroit"},
                        xaxis: {title: {text: "Number of implementations"}},
                        yaxis: {title: {text: "Jurisdiction", standoff: 20}, categoryorder: "total ascending", automargin: true
                        }
                }}
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />

            <Plot
                data={[{type:"bar", orientation: "v", x: keysYears, y: valsYears,
                    hovertemplate: "Year: %{x}<br>Implementations: %{y}<extra></extra>",
                    marker:{
                        color: valsYears,
                        colorscale: "Blues",
                        showscale: false
                    }
                }]}
                layout={{title: {text: "Number of implementations per year"},
                        xaxis: {title: {text: "Year"}},
                        yaxis: {title: {text: "Number of implementations", standoff: 20}}
                }}
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />

            <Plot
                data={[{type:"bar", orientation: "h", x: valsInstruments, y: keysInstruments,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsInstruments,
                        colorscale: "Blues",
                        showscale: false
                    }
                }]}
                layout={{title: {text: "Most implemented Unidroit instruments"},
                        xaxis: {title: {text: "Number of implementations"}},
                        yaxis: {title: {text: "Instrument", standoff: 20}, categoryorder: "total ascending", automargin: true
                        }
                }}               
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />

            <Plot
                data={[{type:"bar", orientation: "h", x: valsPrinciples, y: keysPrinciples,
                    hovertemplate: "%{y}<br>Implementations: %{x}<extra></extra>",
                    marker:{
                        color: valsPrinciples,
                        colorscale: "Blues",
                        showscale: false
                    }
                }]}
                layout={{title: {text: "Most implemented Unidroit principles/articles"},
                        xaxis: {title: {text: "Number of implementations"}},
                        yaxis: {title: {text: "Principle/Article", standoff: 20}, categoryorder: "total ascending", automargin: true
                        }
                }}    
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />

            <Plot
                data={[{type: "pie", labels: keysSystems, values: valsSystems,
                    hovertemplate: "%{label}<br>%{value} implementations (%{percent})<extra></extra>"
                }]}
                layout={{title: {text: "Legal systems that have implemented Unidroit"}}}
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />

            <Plot
                data={[{type: "scattergeo", locationmode: "country names", locations: keysJurisdictions,
                    customdata: valsJurisdictions,
                    text: keysJurisdictions, 
                    marker: {
                        size: valsJurisdictions, 
                        color: valsJurisdictions,
                        sizemode: "area", 
                        sizeref: 2* Math.max(...valsJurisdictions) / (40**2),
                        sizemin: 4,
                        colorscale: "Blues", 
                        showscale: true, 
                        colorbar: {title: {text: "Number of implementations"}}
                    },
                    hovertemplate: "%{location}<br>Implementations: %{customdata}<extra></extra>"
                }]}
                layout={{title: {text: "Jurisdictions implementing Unidroit instruments"}, 
                        geo: {projection: {type: "natural earth"}}
            }}
                useResizeHandler
                style={{ width: "100%", height: "500px" }}
            />
        </div>
    )
}

export default Charts