import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './css/common.css';
import './css/radio.css';
import './css/deleting-workspace.css';

const RemoveStations = () => { 
    const [stations, setStations] = useState([]);
    const [errors, setDetectedErrors] = useState({
        visible: true,
        error: '',
    });
    const [selectedStations, setSelectedStations] = useState([]);
    const [borderRadius, setBorderRadius] = useState('40px');
    const [displayStations, setDisplayResults] = useState([]); // Replace with real data fetch
    const [isloading, setload] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const itemsRef = useRef(); 
    const [popUpWindow,show] = useState();
    // const offlineTest = {
    //     hosts: [
    //         {name: 'RadioBob', country: 'DE', idHost: 1, fetchTrackInfoUrl: 'z', pathTA: '[][][]', pathTC: '[][]', pathTT:'[]'},
    //         {name: 'Rebel', country: 'UA', idHost: 2, fetchTrackInfoUrl: 'y', pathTA: '[][]', pathTC: '[][]', pathTT:'[]'},
    //         {name: 'cosmos', country: 'FR', idHost: 4, fetchTrackInfoUrl: 'x', pathTA: '[]', pathTC: '[][]', pathTT:'[]'}
    //     ]
    // };
    const offlineTest = {
        hosts: [
            {idSS: 1,name: 'RadioBob', idStation: 'DE', idHostedBy: 1, streamUrl: 'z',},
            {idSS: 2,name: 'Rebel', idStation: 'UA', idHostedBy: 2, streamUrl: 'y',},
            {idSS: 3,name: 'cosmos', idStation: 'FR', idHostedBy: 4, streamUrl: 'x'}
        ]
    }
    
    // UseEffect is used to fetch API data, it is a hook
    useEffect(() => {
        const fetchHosts = async () => { // the function itself that will get the data
            try {
                const response = await fetch('http://obesecat.atwebpages.com/radio-services/stations.php');
                const data = await response.json();
                console.log(data.stations);
                if (data.stations.length > 0) {
                    setStations(data.stations); // update the original variable
                    setDisplayResults(data.stations); // update the original variable
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
        const ids = prepare(); //we send the ids of selected stations
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/deleteStations.php`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(ids), // The object containing the data
            });
            const data = await response.json();
            if(data.status==='success'){
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
            stations: []
        };
        selectedStations.map((station) => { 
            data.stations.push(station.idSS);
        })
        console.log(data);
        return data;
    }

    //diplay delete window 
    const popUpWindowShow = (popUpVisibility) => {
        if (selectedStations.length > 0) {
            //pop up window to show "are you sure you wish to delete the following?"
            const popUpWindow = (
                <div className="bg-deletion">
                    <div className="popupwindow-deletion">
                        {/* add bg blur */}
                        <h3>Confirm Station Deletion</h3>
                        <div className="contents-delete">
                            <p className="warning">
                                Are you sure you wish to delete the following Station?
                                This action cannot be undone.
                            </p>
                            <div>
                                <ul className="listToDelete">
                                    {
                                        selectedStations.map((item)=>(
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
            alert('No stations selected');
        }
    };

    // handle search input
    const handleSearch = (event) => { 
        const searchQuery = event.target.value;
        if(searchQuery.trim()){
            console.log(event.target.value);
            setQuery(searchQuery.toLowerCase()); // Update query state    
            // Filtered results based on query
            console.log('stations:'+stations);
            //ensure idStation isnt null and convert ints to string
            const filteredStations = stations.filter((station) => {
                const idStation = station.idStation !== null ? String(station.idStation) : ""; 
                const idHostedBy = station.idHostedBy !== null ? String(station.idHostedBy) : ""; 
                const idSS = String(station.idSS); 
            
                return (
                    (station.name && station.name.toLowerCase().includes(query)) || 
                    idSS.includes(query) ||
                    idStation.includes(query) || 
                    idHostedBy.includes(query)
                );
            });
            if(filteredStations.length>0){ //if filter detects any matches...
                setDisplayResults(filteredStations);
            }else{ //if there are no results we hide the cache results and display error message
                setDetectedErrors({visible:false,error:'No results found.'});
            }
        }else{ //if the search bar is empty we display all of the results 
            setDetectedErrors({visible:true,error:''});
            setDisplayResults(stations);
        }
        updateUI(selectedStations);
    };

    const addToSelected = (event, station) => {    
        setSelectedStations((prevSelected) => {
            const isAlreadySelected = prevSelected.some((s) => s.idSS === station.idSS);
    
            // Toggle the station in the selected list
            const updatedStations = isAlreadySelected
                ? prevSelected.filter((s) => s.idSS !== station.idSS) // Remove if selected
                : [...prevSelected, station]; // Add if not selected
    
            //call updateUI with the new state
            updateUI(updatedStations);
            return updatedStations; //update state
        });
    };

    const updateUI = (selectedStations) => {
        // Get all displayed `.item` divs
        const parentDiv = itemsRef.current;
        const displayDivs = Array.from(parentDiv.querySelectorAll('.item'));
    
        displayDivs.forEach((station) => {
            const stationID1 = station.id; // Get the station ID from the DOM
            const found = selectedStations.some((selectedStation) => {
                const stationID2 = String(selectedStation.idSS);
                // const stationID2 = `${idStation}${selectedStation.idHostedBy}`;
                return stationID1 === stationID2;
            });
    
            // Add or remove the 'selected-item' class based on the match
            station.classList.toggle('selected-item', !!found);
        });
    };
    

    return (
        <div>
            {popUpWindow}
            <div className="static-bar">
                <h1>Delete Stations</h1>
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
                {displayStations.length > 0 ? (
                    <div id="items" ref={itemsRef} className={errors.visible ? "" : "hide"}>
                        {displayStations.map((station) => (
                                <div
                                className="item"
                                key={station.idSS}
                                id={station.idSS}
                                name = {station.name}
                                onClick={(event) => addToSelected(event, station)}
                            >
                                <div title="Station's ID" className="data">{station.idSS}</div>
                                <div title="ID hosted by" className="data">{station.idHostedBy}</div>
                                <div title="Station ID" className="data">{station.idStation}</div>
                                <div title="Station name" className="data">{station.name}</div>
                                <div title="url" className="data">{station.url}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{visibility: isloading? "visible":"hidden"}}>Loading...</p>
                )}
            </div>

            <div className="helpers">

                {selectedStations.length==1? `Selected 1 item` : `Selected ${selectedStations.length} items`}
            </div>
                <button style={{marginTop:'1em'}} id="button-proceed" onClick={(e) => { popUpWindowShow('visible') }}>DELETE</button>
        </div>
    );
};

export default RemoveStations;
