import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./Hero";
import Skills from "./Skills";
import Projects from "./Project";
import About from "./About";
import Insights from "./Insights";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/insights" element={<Insights />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
