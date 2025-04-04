import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './css/common.css';
import './css/radio.css';
import './css/deleting-workspace.css';

const RemoveHosts = () => { 
    const [hosts, setHosts] = useState([]);
    const [errors, setDetectedErrors] = useState({
        visible: true,
        error: '',
    });
    const [selectedRadios, setselectedRadios] = useState([]);
    const [borderRadius, setBorderRadius] = useState('40px');
    const [displayHosts, setDisplayResults] = useState([]); // Replace with real data fetch
    const [isloading, setload] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const itemsRef = useRef(); 
    const [popUpWindow,show] = useState();
    const offlineTest = {
        hosts: [
            {name: 'RadioBob', country: 'DE', idHost: 1, fetchTrackInfoUrl: 'z', pathTA: '[][][]', pathTC: '[][]', pathTT:'[]'},
            {name: 'Rebel', country: 'UA', idHost: 2, fetchTrackInfoUrl: 'y', pathTA: '[][]', pathTC: '[][]', pathTT:'[]'},
            {name: 'cosmos', country: 'FR', idHost: 4, fetchTrackInfoUrl: 'x', pathTA: '[]', pathTC: '[][]', pathTT:'[]'}
        ]
    }
    
    // UseEffect is used to fetch API data, it is a hook
    useEffect(() => {
        const fetchHosts = async () => { // the function itself that will get the data
            try {
                const response = await fetch('http://obesecat.atwebpages.com/radio-services/radioHosts.php');
                const data = await response.json();
                console.log(data.hosts);
                if (data.hosts.length > 0) {
                    setHosts(data.hosts); // update the original variable
                    setDisplayResults(data.hosts); // update the original variable
                } else {
                    setDetectedErrors({visible:false,error:'No Sations found.'});
                }
            } catch (e) {
                // batch update
                const updateErr = () => { 
                    setload(false);
                    setDetectedErrors({visible:false,error:'Ensure you are connected to the internet'});
                }
                updateErr();
            }
        }
        fetchHosts();
    }, []); // empty dependency meaning it runs only when the widget mounts

    const deleteItems = async() => { 
        const ids = prepare(); //we send the ids of selected radios
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/deleteRadioHosts.php`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(ids), // The object containing the data
            });
            const data = await response.json();
            console.log(data);
            if(data.status ==='success'){
                setTimeout(() => {
                    alert(`${data.message}, you will now be redirected`)
                    navigate('/home');
                }, 1000);
            }else{
                alert(data.message);
            }
        } catch (e) {
            console.log(e);
        }
    }

    const prepare = () => { 
        const data = {
            hosts: []
        };
        selectedRadios.map((host) => { 
            data.hosts.push(host.idHost);
        })
        console.log(data);
        return data;
    }

    //diplay delete window 
    const popUpWindowShow = (popUpVisibility) => {
        if (selectedRadios.length > 0) {
            //pop up window to show "are you sure you wish to delete the following?"
            const popUpWindow = (
                <div className="bg-deletion">
                    <div className="popupwindow-deletion">
                        {/* add bg blur */}
                        <h3>Confirm Radio Host Deletion</h3>
                        <div className="contents-delete">
                            <p className="warning">
                                Are you sure you wish to delete the following items?
                                NOTE* Radio stations associated with removed hosts will also be deleted.
                                This action cannot be undone.
                            </p>
                            <div>
                                <ul className="listToDelete">
                                    {
                                        selectedRadios.map((item)=>(
                                            <li className="selectedToDelete">
                                                {item.name}
                                            </li>
                                        ))
                                    }
                                </ul>
                                <div className="action-deletion">
                                    <button onClick={ deleteItems } className="btn confirm-deletion">Confirm</button> <button onClick={(e) => { show(null) }} className="btn cancel-deletion">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            show(popUpWindow);
        } else {
            alert('No radio hosts selected');
        }
    };

    // handle search input
    const handleSearch = (event) => { 
        const searchQuery = event.target.value;
        if(searchQuery.trim()){
           
            console.log(event.target.value);
            setQuery(searchQuery.toLowerCase()); 
           
            // Filtered results based on query
            console.log('hosts:'+hosts);
           
            //ensure pathTC isnt null and convert to string
            const filteredHosts = hosts.filter((host) => {
                const pathTC = host.pathTC !== null ? String(host.pathTC) : ""; 
                const idHost = String(host.idHost); 
            
                return (
                    idHost.toLowerCase().includes(query) || 
                    (host.name && host.name.toLowerCase().includes(query)) || 
                    host.country.toLowerCase().includes(query) || 
                    host.fetchTrackInfoUrl.toLowerCase().includes(query) ||
                    host.pathTT.toLowerCase().includes(query) ||
                    host.pathTA.toLowerCase().includes(query) ||
                    pathTC.toLowerCase().includes(query) 
                );
            });
            if(filteredHosts.length>0){ //if filter detects any matches...
                setDisplayResults(filteredHosts);
            }else{ //if there are no results we hide the cache results and display error message
                setDetectedErrors({visible:false,error:'No results found.'});
            }
        }else{ //if the search bar is empty we display all of the results 
            setDetectedErrors({visible:true,error:''});
            setDisplayResults(hosts);
        }
        updateUI(selectedRadios);
    };

    const addToSelected = (event, host) => {    
        setselectedRadios((prevSelected) => {
            const isAlreadySelected = prevSelected.some((h) => h.idHost === host.idHost);    
            const updatedRadios = isAlreadySelected
                ? prevSelected.filter((h) => h.idHost !== host.idHost) // remove if selected
                : [...prevSelected, host]; // Add if not selected
    
            //call updateUI with the new state
            updateUI(updatedRadios);
            return updatedRadios; //update state
        });
    };
    

    const updateUI = (selectedRadios) => {
        // Get all displayed `.item` divs
        const parentDiv = itemsRef.current;
        const displayDivs = Array.from(parentDiv.querySelectorAll('.item'));
    
        displayDivs.forEach((host) => {
            const hostID1 = host.id; // Get the station ID from the DOM
            const found = selectedRadios.some((selectedStation) => {
                const hostID2 = String(selectedStation.idHost);
                // const stationID2 = `${idStation}${selectedStation.idHostedBy}`;
                return hostID1 === hostID2;
            });
    
            // Add or remove the 'selected-item' class based on the match
            host.classList.toggle('selected-item', !!found);
        });
    };
    

    return (
        <div>
            {popUpWindow} {/* which will display radio hosts that will be deleted */}
            <div className="static-bar">
                <h1>Delete Radio Hosts</h1>
            </div>
            <div id="main-radio-manager">
                <div id="search">
                    {/* <div className="menu-scrollable">
                        <a href="#" className="icon">  </a>
                        <a href="#" className="icon"> </a>
                        <a href="#" className="icon"> </a>
                    </div> */}
                    <textarea
                        name="search-request"
                        id="textarea-search"
                        maxLength="500"
                        onChange={(e) => { handleSearch(e) }}
                        placeholder="Search for..."
                    ></textarea>
                </div>
            </div>

            <div id="results" style={{ borderRadius }}>
                {errors.error.trim() && (
                    <div className="error">
                        &#9888; {errors.error}
                    </div>
                )}
                {displayHosts.length > 0 ? (
                    <div id="items" ref={itemsRef} className={errors.visible ? "" : "hide"}>
                        {displayHosts.map((station) => (
                            <div
                                className="item"
                                key={station.idHost}
                                id={station.idHost}
                                name = {station.name}
                                onClick={(event) => addToSelected(event, station)}
                            >
                                <div title="Radio Host ID" className="data">{station.idHost}</div>
                                <div title="Radio's name" className="data">{station.name}</div>
                                <div title="Country of origin" className="data">{station.country}</div>
                                <div title="Url reference for fetching track information" className="data">{station.fetchTrackInfoUrl}</div>
                                <div title="JSON path to track's title" className="data">{station.pathTT}</div>
                                <div title="JSON path to track's artist" className="data">{station.pathTA}</div>
                                <div title="JSON path to track's aalbum cover" className="data">{station.pathTC}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{visibility: isloading? "visible":"hidden"}}>Loading...</p>
                )}
            </div>

            <div className="helpers">

                {selectedRadios.length==1? `Selected 1 item` : `Selected ${selectedRadios.length} items`}
            </div>
                <button style={{marginTop:'1em'}} id="button-proceed" onClick={(e) => { popUpWindowShow('visible') }}>DELETE</button>
        </div>
    );
};

export default RemoveHosts;
