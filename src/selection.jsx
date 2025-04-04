import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './css/common.css';
import './css/radio.css';

const SelectionComponent = ({ title, fetchDataCallback, navigateToNextPage }) => {
    const [fetchedItems, setFetchedItems] = useState([]);
    const [errors, setDetectedErrors] = useState({
        visible: true,
        error: '',
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [borderRadius, setBorderRadius] = useState('40px');
    const [displayItems, setDisplayItems] = useState([]); 
    const [isloading, setload] = useState(true);
    const navigate = useNavigate();
    const itemsRef = useRef(); 
    
  useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetchDataCallback(); // This will return a list of items
                if (response) {
                    setFetchedItems(response); // update the fetched items
                    setDisplayItems(response); // update the items to be displayed
                    setload(false); // Set loading to false after data is fetched
                    setDetectedErrors({ visible: true, error: '' });
                }else{
                    setDetectedErrors({ visible: true, error: 'Ensure you are connected to the internet.' });
                    setload(false); // Set loading to false in case of error
                }
            } catch (e) {
                setDetectedErrors({ visible: true, error: 'Ensure you are connected to the internet.' });
                setload(false); // Set loading to false in case of error
            }
        };

        fetchItems();
    }, [fetchDataCallback]); 

    const navigateToWorkspace = () => {
        if (selectedItems.length > 0) {
            console.log(title);
            if (title === 'Radio Hosts') {
                setSelectedItems(prevItems => {
                    const updatedItems = prevItems.map(item => ({
                        idHost: item.id,
                        name: item.name,
                        country: item.attributes.find(attr => attr.name === 'Hosting Country')?.value || '',
                        fetchTrackInfo: item.attributes.find(attr => attr.name === 'URL for fetching track info')?.value || '',
                        pathTT: item.attributes.find(attr => attr.name === 'Path to track title')?.value || '',
                        pathTA: item.attributes.find(attr => attr.name === 'Path to track artist')?.value || '',
                        pathTC: item.attributes.find(attr => attr.name === 'Path to track album cover')?.value || '',
                    }));
                    console.log(updatedItems);
                    navigate(navigateToNextPage, { state: { selectedItems: updatedItems } });
                    return updatedItems;
                });
            } else {
                setSelectedItems(prevItems => {
                    const updatedItems = prevItems.map((item) => ({
                        idSS: item.id,
                        name: item.name,
                        idHostedBy: item.attributes.find(attr => attr.name === 'ID of the radio hosting this station')?.value || '',
                        url: item.attributes.find(attr => attr.name === 'Stream URL')?.value || '',
                    }));
                    console.log(updatedItems);
                    navigate(navigateToNextPage, { state: { selectedItems: updatedItems } });
                    return updatedItems;
            });
            }
        } else {
            alert('No items selected');
        }
    };

    const handleSearch = (event) => { 
        const query = event.target.value;
        if(query.trim()){
            //ensure id isnt null and convert ints to string
            const filteredItems = fetchedItems.filter((item) => {
                const id = item.id !== null ? String(item.id) : ""; 
                const name = item.name !== null ? String(item.name) : ""; 
                // now we map through every attribute, extract its value, and check if the query search matches
                const attributes = item.attributes.map((attribute, index) => {
                    return attribute.value !== null ? String(attribute.value) : ""; 
                 });
                return (
                    id.includes(query) ||
                    name.includes(query) ||
                    attributes.some((value) => value.includes(query)) 
                );
            });
            if(filteredItems.length>0){ //if filter detects any matches...
                setDisplayItems(filteredItems);
            }else{ //if there are no results we hide the cache results and display error message
                setDetectedErrors({visible:false,error:'No results found.'});
            }
        }else{ //if the search bar is empty we display all of the results 
            setDetectedErrors({visible:true,error:''});
            setDisplayItems(fetchedItems);
        }
        updateUI(selectedItems);
    };

    const addToSelected = (event, item) => {    
        setSelectedItems((prevSelected) => {
            const isAlreadySelected = prevSelected.some((i) => i.id === item.id);
            // Toggle the item in the selected list
            const updatedItems = isAlreadySelected
                ? prevSelected.filter((i) => i.id !== item.id) // Remove if selected
                : [...prevSelected, item]; // Add if not selected
    
            //call updateUI with the new state
            updateUI(updatedItems);
            return updatedItems; //update state
        });
    };

    const updateUI = (selectedItems) => {
        // Get all displayed `.item` divs
        const parentDiv = itemsRef.current;
        const displayDivs = Array.from(parentDiv.querySelectorAll('.item'));
    
        displayDivs.forEach((item) => {
            const itemID1 = item.id; // Get the item ID from the DOM
            const found = selectedItems.some((selectedItem) => {
                const itemID2 = String(selectedItem.id);
                return itemID1 === itemID2;
            });
            // Add or remove the 'selected-item' class based on the match
            item.classList.toggle('selected-item', !!found);
        });
    };
    


    return (
        <div className="home-selection">
            <div className="static-bar">
                <h1>Manage {title}</h1> {/* Either radio hosts or stations */}
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
                {displayItems.length > 0 ? (
                    <div id="items" ref={itemsRef} className={errors.visible ? "" : "hide"}>
                        {displayItems.map((item) => (
                            <div
                                className="item"
                                key={item.id}
                                id={item.id}
                                name = {item.name}
                                onClick={(event) => addToSelected(event, item)}
                            >
                                <div title='Name' className="data">{item.name}</div>
                                <div title='ID' className="data">{item.id}</div>
                                {item.attributes.map((attribute, index) => (
                                    <div key={index} title={attribute.name} className="data">
                                        {attribute.value}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="loading" style={{visibility: isloading? "visible":"hidden"}}>Loading...</p>
                )}
            </div>

            <div className="helpers">
                {selectedItems.length==1? `Selected 1 item` : `Selected ${selectedItems.length} items`}
            </div>
        </div>
    );
};
export default SelectionComponent
