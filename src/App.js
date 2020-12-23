import './App.css?v=2112020';
import '../node_modules/primeflex/primeflex.css';
import '../node_modules/primereact/resources/themes/bootstrap4-light-blue/theme.css';
import '../node_modules/primereact/resources/primereact.min.css';
import '../node_modules/primeicons/primeicons.css';

import Routes from "./routes";
import Topo from "./topo";

function App() {
  
  return (
    <>
    <div className="App">
      <Topo></Topo>
      <Routes>
      </Routes>
    </div>
    </>
  );
}
export default App;
