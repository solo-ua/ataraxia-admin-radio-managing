import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../css/common.css';
import '../css/radio.css';

const SelectStations = () => { 
    const [stations, setStations] = useState([]);
    const [errors, setDetectedErrors] = useState({
        visible: true,
        error: '',
    });
    const [selectedStations, setSelectedStations] = useState([]);
    const [borderRadius, setBorderRadius] = useState('40px');
    // const [isVisible, setIsVisible] = useState(true);
    const [displayStations, setDisplayResults] = useState([]); // Replace with real data fetch
    const [isloading, setload] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const itemsRef = useRef(); 
    const data = {
        hosts: [
            {idSS: 1,name: 'RadioBob', idStation: 'DE', idHostedBy: 1, streamUrl: 'z',},
            {idSS: 2,name: 'Rebel', idStation: 'UA', idHostedBy: 2, streamUrl: 'y',},
            {idSS: 5,name: 'Rebel', idStation: 'UA', idHostedBy: 2, streamUrl: 'y',},
            {idSS: 4,name: 'Rebel', idStation: 'UA', idHostedBy: 2, streamUrl: 'y',},
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
                    
                // setStations(data.hosts); // update the original variable
                // setDisplayResults(data.hosts); // update the original variable
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

    // Navigate to workspace
    const navigateToWorkspace = () => {
        if (selectedStations.length > 0) {
            navigate('/station-workspace', { state: { selectedStations } });
        } else {
            alert('No stations selected');
        }
    };

    // handle search input
    const handleSearch = (event) => { 
        const searchQuery = event.target.value;
        if(searchQuery.trim()){
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
        <div className="home-selection">
            <div className="static-bar">
                <h1>Manage Stations</h1>
                <button id="button-proceed" onClick={navigateToWorkspace}>Proceed</button>
            </div>
            
            <div id="main-radio-manager">
                <div id="search">
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
                    <p className="loading" style={{visibility: isloading? "visible":"hidden"}}>Loading...</p>
                )}
            </div>

            <div className="helpers">
                {selectedStations.length==1? `Selected 1 item` : `Selected ${selectedStations.length} items`}
            </div>
        </div>
    );
};

export default SelectStations;
