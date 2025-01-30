import * as d3 from "https://esm.sh/d3@7";
const parseDate = d3.timeParse("%Y-%m-%d");

async function fetchData() {
  const csvUrl =
    "https://www.cdc.gov/wcms/vizdata/cfa/RtEstimates/flu/flu_timeseries_data.csv";
  const data = await d3.csv(csvUrl);
  const uniqueLocations = [...new Set(data.map((d) => d.state))];
  return [data, uniqueLocations];
}

function renderLi({ date, median }) {
  const template = document.getElementById("list-item-template");
  const element = template.content.cloneNode(true);
  element.querySelector(".date").textContent = parseDate(
    date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    day: "numeric",
    month: "short",
  });
  element.querySelector(".median").textContent = median;
  return element;
}

function renderList(location, data) {
  const listEl = document.getElementById("list");
  const locationEl = document.getElementById("location");
  const selectedData = data.filter((d) => d.state === location);

  listEl.textContent = "";
  locationEl.textContent = selectedData[0].state;
  selectedData.forEach((d) => {
    const li = renderLi(d);
    listEl.appendChild(li);
  });
}

function renderSelectEl(locations, initialValue, onSelected) {
  const locationSelectorEl = document.getElementById("location-selector");
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    locationSelectorEl.appendChild(option);
    locationSelectorEl.addEventListener("change", (e) => {
      onSelected(e.target.value);
    });
  });
  locationSelectorEl.value = initialValue;
}

async function main() {
  const location = "United States";
  const [data, uniqueLocations] = await fetchData();
  renderSelectEl(uniqueLocations, location, (newLocation) => {
    renderList(newLocation, data);
  });
  renderList(location, data);
}

main();
