import React, {useEffect, useState} from "https://esm.sh/react@19";
import ReactDOMClient from "https://esm.sh/react-dom@19/client";
import htm from "https://esm.sh/htm@3?dev";

import {
  useSimulationState,
  SimulationStateProvider,
} from "./useSimulationState.js";

const html = htm.bind(React.createElement);

function DisplayWidget() {
  const { simulationState } = useSimulationState();
  const { population } = simulationState.simulation_data;
  if (simulationState.is_loading) {
    return html`<div>Loading...</div>`;
  }
  return html`
    <div>
      <h1>Population: ${population}</h1>
    </div>
  `;
}

function CommandSender() {
  const { sendCommand } = useSimulationState();
  return html`
    <button onClick=${() => sendCommand("population")}>Get Population</button>
  `;
}

function App() {
  return html`
    <${SimulationStateProvider}>
      <h1>Devtools</h1>
      <${CommandSender} />
      <${DisplayWidget} />
    </${SimulationStateProvider}>`;
}

ReactDOMClient.createRoot(document.getElementById("root")).render(
  React.createElement(App, {}, null)
);

