import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '../css/common.css';
import '../css/radio.css';

const SelectRadioHosts = () => { 
    const [radios, setRadioHosts] = useState([]); // initializing the radioHost as an array that will carry fetched hosts
    const [errors, setDetectedErrors] = useState(''); // initializing the errors
    const [selectedRadioHosts, setSelectedRadioHosts] = useState([]); // state to hold selected radio hosts
    const [borderRadius, setBorderRadius] = useState('40px');
    const [noSelectedHosts, setNoSelectedHosts] = useState('')
    const [isVisible, setIsVisible] = useState(true); //visiblity of the results for smoother transition
    const [displayRadioHosts, setDisplayResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const itemsRef = useRef();

    // TODO handle internet connection errors
    // UseEffect is used to fetch API data, it is a hook
    useEffect(() => {
        const fetchHosts = async () => { // the function itself that will get the data
            try {
                const response = await fetch('http://obesecat.atwebpages.com/radio-services/radioHosts.php');
                const data = await response.json();
                console.log(data.hosts);
                if (data.hosts.length > 0) {
                    setRadioHosts(data.hosts); // update the original variable
                    setDisplayResults(data.hosts); // update the original variable
                } else {
                    setDetectedErrors('No Radio Hosts found.');
                }
            } catch (e) {
                setDetectedErrors('Ensure you are connected to the internet');
            }
        }
        fetchHosts();
    }, []); // empty dependency meaning it runs only when the widget mounts

    // TODO fix selection update
    /*
        suggestion:
        save the initial DIVS that were displayed, then when the user clears the search and messes with it, 
        re-envoke the function to compare displayDivs (updated) with the initial and add the class to it 
    */
    // For the helper
    // useEffect(() => { updateUI() },[displayRadioHosts]);
    // manage selections
    const addToSelected = (event, host) => {
        // const id = selectedRadioHosts.some(selectedHost => selectedHost.idHost === host.idHost); //some function returns a boolean if one item satisfies the testing
        const id = selectedRadioHosts.findIndex( selectedHost => selectedHost.idHost == host.idHost );
        if (id!=-1) {
            // Remove from selected array
            const updatedHosts = selectedRadioHosts.filter(selectedHost => selectedHost.idHost !== host.idHost); //creating a new array excluding the existing one
            setSelectedRadioHosts(updatedHosts); //setting the selectedRadioHosts to the new array 
            // selectedRadioHosts.splice(id,1);
            updateUI(event.currentTarget, false); // Remove 'selected' class
            console.log(host.name + " removed");
        } else {
            // Add to the selected array
            setSelectedRadioHosts([...selectedRadioHosts, host]); //recreates the same array and adds one to the end
            // selectedRadioHosts.push(host);
            updateUI(event.currentTarget, true); // Add 'selected' class
            console.log(host.name + " added");
        }
        console.log(selectedRadioHosts);
    };

    // here update the UI of the selected items 
    const updateUI = (selectedRadioHosts) => {
        const parentDiv = itemsRef.current;
        console.log(parentDiv);
        const displayDivs = Array.from(parentDiv.querySelectorAll('.item'));

        // displayDivs.forEach((host)=> { 
        //     const hostId1 = host.id;
        //     const found = selectedRadioHosts.some((selectedHost)=> { 
        //         const hostId2 = String(selectedHost.idHost);
        //         return hostId1 === hostId2;
        //      });
        //      host.classList.toggle('selected-item', !!found);
        //  });
        
    };

    // the event responsible for search 
    const handleSearch = (event) => {
        const query = String(event.currentTarget.value);
        if(query.trim()){
            console.log('query: '+query);
            console.log(radios);
            const filterRadio = radios.filter((radio)=>{
                const id = radio.idHost !== null ? String(radio.idHost) : '';
                const name = radio.name !== null ? String(radio.name) : '';
                const country = radio.country !== null ? String(radio.country) : '';
                const fetchTrackInfo = radio.fetchTrackInfo !== null ? String(radio.fetchTrackInfo) : '';
                const pathTT = radio.pathTT !== null ? String(radio.pathTT) : '';
                const pathTA = radio.pathTA !== null ? String(radio.pathTA) : '';
                const pathTC = radio.pathTC !== null ? String(radio.pathTC) : '';
                
                return(
                    name.includes(searchQuery) ||
                    id.includes(searchQuery) ||
                    country.includes(searchQuery) ||
                    fetchTrackInfo.includes(searchQuery) ||
                    pathTT.includes(searchQuery) ||
                    pathTA.includes(searchQuery) ||
                    pathTC.includes(searchQuery)
                );
            });
            if(filterRadio.length>0){
                setDisplayResults(filterRadio);
            }else{
                setDetectedErrors('Whoops, nothing found!');
                setIsVisible(false);
            }
        }else{
            setDetectedErrors('');
            setIsVisible(true);
            setDisplayResults(radios);
        }
        updateUI(selectedRadioHosts);
    };

    // rerouter to the next page upon accept
    const navigateToWorkspace = () => {
        if (selectedRadioHosts.length > 0) {
            navigate('/radio-workspace', { state: { selectedRadioHosts } });
        } else {
            alert('No radio hosts selected'); 
        }
    };
    
    return (
        <div className="home-selection">
            <div className="static-bar">
                <h1>Manage Radio Hosts</h1>
                <button id="button-proceed" onClick={navigateToWorkspace}>Proceed</button>
            </div>
            
            <div id="main-radio-manager">
                <div id="search">
                    <textarea name="search-request" id="textarea-search" maxLength="500" placeholder="Search for..." onInput={handleSearch}></textarea>
                </div>
            </div>

            <div id="results" style={{ borderRadius }}>
                {errors && (
                    <div  className='error'>
                       <p style={{fontSize:'20pt'}} >&#9888;</p> 
                        {errors}
                    </div>
                )}

                {displayRadioHosts.length > 0 && (
                    <div id="items" ref={itemsRef}  className={isVisible ? "" : "hide"}>
                        {displayRadioHosts.map((host) => (
                            <div className="item" key={host.idHost} id={host.idHost} onClick={(event) => addToSelected(event, host)}>
                                <div title="Radio name" className="data">{host.name}</div>
                                <div title="Radio ID" className="data">{host.idHost}</div>
                                <div title="Country of origin" className="data">{host.country}</div>
                                <div title="Fetch track info URL" className="data">{host.fetchTrackInfo}</div>
                                <div title="JSON path of the track title" className="data">{host.pathTT}</div>
                                <div title="JSON path of the track artist" className="data">{host.pathTA}</div>
                                <div title="JSON path of the track album cover" className="data">{host.pathTC}</div>
                            </div>
                        ))}
                    </div>

                )}
            </div>

            <div className="helpers">
                Selected {selectedRadioHosts.length} items
            </div>
        </div>
    );
};

export default SelectRadioHosts;
