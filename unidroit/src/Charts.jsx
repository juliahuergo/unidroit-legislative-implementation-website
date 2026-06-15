import plotlyFactory from "react-plotly.js/factory"
import Plotly from "plotly.js-dist-min"

// react-plotly.js is a CommonJS package: depending on the bundler, the import is
// either the factory function itself or an object wrapping it under .default
const createPlotlyComponent = plotlyFactory.default || plotlyFactory

// Build the <Plot> component from the minified Plotly bundle (smaller than full plotly.js)
const Plot = createPlotlyComponent(Plotly)

// Read a CSS custom property so colours and fonts have a single source of truth
// (defined in index.css) rather than being duplicated as literals here.
const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

const TEAL = cssVar("--color-unidroit", "#014154")
const CHART_FONT = cssVar("--font-sans", "sans-serif")

// One bar chart in a card. Horizontal bars suit long labels (instruments, jurisdictions);
// vertical bars suit numeric axes like years (numericLabels sorts by label instead of count).
export function CountBarChart({ title, counts, horizontal = true, numericLabels = false }) {
  const pairs = Object.entries(counts).sort(
    numericLabels ? (a, b) => Number(a[0]) - Number(b[0]) : (a, b) => b[1] - a[1]
  )
  const labels = pairs.map(([key]) => key)
  const values = pairs.map(([, count]) => count)

  const data = horizontal
    ? [{ type: "bar", orientation: "h", x: values, y: labels, marker: { color: TEAL } }]
    : [{ type: "bar", x: labels, y: values, marker: { color: TEAL } }]

  const layout = {
    height: horizontal ? Math.max(160, 60 + labels.length * 32) : 300,
    margin: { l: horizontal ? 10 : 50, r: 20, t: 10, b: 40 },
    xaxis: horizontal ? { tickformat: ".0f" } : { type: "category" },
    yaxis: horizontal ? { autorange: "reversed", automargin: true } : { tickformat: ".0f" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { size: 12, color: "#44403c", family: CHART_FONT },
  }

  return (
    <div className="rounded-sm border border-stone-200 border-l-[3px] border-l-unidroit bg-white p-5">
      <h3 className="font-serif text-base font-semibold text-stone-900">{title}</h3>
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%" }}
      />
    </div>
  )
}
