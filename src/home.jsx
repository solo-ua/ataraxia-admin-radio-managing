import React from 'react'
import './css/common.css';
import './css/main.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Filler from './filler-components';
const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {data} = location.state || {};  
    return (
    <div id='home'>
        <div id='home-bg'></div>
        <h1 className='indent'>Welcome {(data)? data.admin_username : 'Back'}</h1>
        <div id="menue">
            <div>
                <button className="slide-button styled">
                ➤ Radio Hosts
                </button>
                <div className="slide-menue">
                    <ul>
                        <li onClick={() => { navigate('/new-hosts') }}>New host</li>
                        <li onClick={() => { navigate('/select-items-hosts') }}>Edit existing hosts</li>
                        <li onClick={() => { navigate('/remove-hosts') }}>Remove a host</li>
                    </ul>
                </div>
            </div>
            <div>
                <button className="slide-button styled">
                ➤  Stations
                </button>
                <div className="slide-menue bg-2">
                    <ul>
                        {/* <li id="">New station</li> */}
                        <li onClick={() => { navigate('/new-stations') }}>New station</li>
                        <li onClick={() => { navigate('/select-items-stations') }}>Edit existing station</li>
                        <li onClick={() => { navigate('/remove-stations') }}>Remove a station</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className='div-filler'>
            <Filler />
        </div>
    </div>
  )
}

export default Home
