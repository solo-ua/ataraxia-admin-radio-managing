import { Routes, Route } from 'react-router-dom';
import SelectRadioHosts from './oldComponents/radio-selection.jsx';
import Workspace from './radio-workspace.jsx';
import Home from './home.jsx';
import SelectStations from './oldComponents/station-selection.jsx';
import StationWorkspace from './station-workspace.jsx';
import NewStation from './new-station.jsx';
import NewHosts from './new-host.jsx';
import RemoveHosts from './remove-radio.jsx';
import RemoveStations from './remove-station.jsx';
import Login from './admin-login.jsx';
import EditExistingItem from './edit-existing-item.jsx';
function App() {
  return (
    <div>
      <div id='main-header'>
        {/* TODO add later */}
      </div>
    <Routes>
      <Route path="/" element={<Login />} />      
      <Route path="/home" element={<Home />} />      
      <Route path="/select-items-hosts" element={<EditExistingItem item = 'hosts' />} />      
      <Route path="/select-items-stations" element={<EditExistingItem item = 'station' />} />      
      <Route path="/search-hosts" element={<SelectRadioHosts />} />      
      <Route path="/radio-workspace" element={<Workspace />} />
      <Route path="/station-workspace" element={<StationWorkspace />} />
      <Route path="/search-station" element={<SelectStations />} />
      <Route path="/new-stations" element={<NewStation />} />
      <Route path="/new-hosts" element={<NewHosts />} />
      <Route path="/remove-stations" element={<RemoveStations />} />
      <Route path="/remove-hosts" element={<RemoveHosts />} />
    </Routes>
      <div id='main-footer'>
        {/* TODO add later */}
      </div>
    </div>
  );
}

export default App;
