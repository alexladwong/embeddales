import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Widget } from "./components/Widget";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </div>
      <Widget projectId="1" />
    </>
  );
}

export default App;
