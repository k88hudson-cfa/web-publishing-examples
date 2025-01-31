import React, {
  useEffect,
  useState,
  useContext,
} from "https://esm.sh/react@19";
import htm from "https://esm.sh/htm@3?dev";
const html = htm.bind(React.createElement);

const SimulationCtx = React.createContext();

export function SimulationStateProvider({ children }) {
  const [simulationState, setSimulationState] = useState({
    plan_counter: 0,
    last_command: "",
    is_loading: false,
    simulation_data: {},
  });

  async function sendCommand(command) {
    // Set loading state while we are waiting for a response
    setSimulationState({ ...simulationState, is_loading: true });

    // Send the command and retrieve the response
    // let response = await fetch(`/api/command/${command}`);
    // let data = await response.json();
    let data = { population: Math.floor(Math.random() * 1000000) };

    // This will update any components that are using the simulation state
    // Note that the plan_counter always increments
    setSimulationState({
      plan_counter: simulationState.plan_counter + 1,
      last_command: command,
      is_loading: false,
      simulation_data: data,
    });
  }

  return html`<${SimulationCtx.Provider} value=${{
    simulationState,
    sendCommand,
  }}>
      ${children}
    </${SimulationCtx.Provider}>`;
}

export const useSimulationState = () => {
  const { simulationState, sendCommand } = useContext(SimulationCtx);
  return { simulationState, sendCommand };
};
