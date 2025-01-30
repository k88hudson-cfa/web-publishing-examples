import React, {useEffect, useState} from "https://esm.sh/react@19";
import ReactDOMClient from "https://esm.sh/react-dom@19/client";
import * as d3 from "https://esm.sh/d3@7";
import htm from "https://esm.sh/htm@3?dev";

const html = htm.bind(React.createElement);

const CSV_URL =
"https://www.cdc.gov/wcms/vizdata/cfa/RtEstimates/flu/flu_timeseries_data.csv";
const IFRAME_URL = "https://www.cdc.gov/cfa-modeling-and-forecasting/rt-estimates/state-rt-timeseries/chart-flu.html";

function LocationSelector({ options, location, setLocation }) {
  return html`
    <select value=${location} onChange=${(e) => setLocation(e.target.value)}>
      ${options.map((value) => html`<option value=${value} key=${value}>${value}</option>`)}
    </select>
  `;
}

function App() {
  let [locationOptions, setLocationOptions] = useState(["United States"]);
  let [location, setLocation] = useState("United States");
  let [data, setData] = useState([]);

  async function loadData() {
    const data = await d3.csv(CSV_URL);
    setData(data);
    setLocationOptions([...new Set(data.map((d) => d.state))]);
  }
  useEffect(() => {
    loadData();
  }, []);

  let selectedData = data.filter((d) => d.state === location)
  let iframeHash = `#flu-${encodeURIComponent(location)}`;

  return html`
    <h1>Rt estimates for ${selectedData[0]?.state}</h1>
    <${LocationSelector} options=${locationOptions} location=${location} setLocation=${setLocation} />
    <div>
      <iframe height="300" width="400" src=${IFRAME_URL + iframeHash}></iframe>
</div>
  `;
}

ReactDOMClient.createRoot(document.getElementById("root")).render(
  React.createElement(App, {}, null)
);

