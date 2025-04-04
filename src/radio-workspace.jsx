import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import './css/common.css';
import './css/radio.css';
import './css/editing-workplace.css';

const Workspace = () => {
    const [errorLogs, newErrorLog] = useState(['Woohoo! All clean']);
    const location = useLocation();
    const navigate = useNavigate();
    const [station, setSelectedStation] = useState('');
    // Destructuring the selectedItems from location.state
    const [errorProof, errorProofIs] = useState(true);
    // this is used to test the radio
    const audioRef = useRef(null);
    
    const selectedItems = location.state?.selectedItems ?? []; 


    // checks syntax of the values entered by the user before confirmation
    const checkSyntax = (event) => {
        const fieldName = event.target.name;
        if(!event.target.value.trim()){
            errorProofIs(false);
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, `All fields must be filled.`]);
        }
        const value = event.target.value;
        errorProofIs(true);
        switch (fieldName) {
            case "title":
                if(value.length<4){
                    errorProofIs(false);
                    event.target.value = '';
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, `Title should have appropriate legnth. At least 5 characters.`]);
                }
            case "country":
                const countryregex = /^[A-Z]{2}$/;
                if(!countryregex.test(value)){
                    errorProofIs(false);
                    event.target.value = '';
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, 'Country should have a valid country code: A-Z Upper case with two characters max.']);

                }
        }
    }

    // updates the values before sending a put request
    const updateValues = () => {
        const items = Array.from(document.querySelectorAll('.mainItem-r'));
        console.log('items-->' , items);
        const updatedhostData = {};
        items.forEach((item) => { 
            // Get textareas within the current .host item
            const attributeElements = Array.from(item.querySelectorAll('.editData')); 
    
            attributeElements.forEach((attribute) => {
                const { name, value } = attribute; // extracting the name and value of each textarea
                updatedhostData[name] = value; //sets the attribute as the textarea's name, and assigns the value
            });
            applyChanges(updatedhostData);
        });
        newErrorLog((prevErrorLogs) => [...prevErrorLogs, 'Hosts have been updated successfully!']);
        setTimeout(() => {
            alert('Hosts were successfully updated. You will now be redirected.')
            navigate('/home');
        }, 500);
    }

    // upon confirmation, the changes are applied
    const confirm = () => {
        console.log('clicked');
        if(errorProof){
            console.log('no errors');
            updateValues();
        }
    };

    // sends a put request submitting the altered radio host
    const applyChanges = async (hostData) => {
        console.log(
            JSON.stringify(hostData)
        );
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/editRadioHosts.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hostData), // The object containing the data
            });    
        } catch (e) {
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, e.toString()]);
        }
    };

    // reset changes of the specific host
    const revertChanges = (event) => { 
        console.log('reverting...');
        const dataToRevert = Array.from(event.target.closest('.mainItem-r').querySelectorAll('.editData')); 
        console.log(dataToRevert);
        dataToRevert.forEach(input => {
            console.log(input);
            input.value = input.defaultValue;
        });
    };

    // remove element
    const removeElement = (event) => { 
        const host = event.target.closest('.mainItem-r');
        host.remove();
        audioRef.current.pause(); // inccase the user was playing the host they removed
    }

    const testStream = async (currentId) => {
        console.log('host id: ', currentId);
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/stationByHost.php?id=${encodeURIComponent(currentId)}`);
            const result = await response.json();
            console.log(result);
            if(result.status == 'error'){
                newErrorLog((prevErrorLogs) => [...prevErrorLogs, 'Current radio host has no defined stations.']);
            }else{
                setSelectedStation(result.stations[0]);
            }
        } catch (error) {
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, error]);
        }
    };

    useEffect(() => {
        if (station && audioRef.current) {
            //stop and reset the previous audio before changing the source
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            //update src
            audioRef.current.src = station.url;
            //and now play it yippee 
            audioRef.current.play()
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, `🎧NOW PLAYING🎧 Station: ${station.name}`]);
        }
    }, [station]);  

    return (
    <div className="home-workspace">
        <h1>Workspace</h1>
        <h2>The following items were selected</h2>

        <div className="static-editing-sidebar">
            <h2>Log</h2>
            <div className="errorlog-contents">
                {errorLogs.length > 0 && (
                    errorLogs.map((error, index) => (
                        <i key={index} className="editing-errors">{error}</i>
                    ))
                )}
            </div>
            {/* <button className="button button-clear">Clear</button> */}
        </div>

        <div className="chosen-items">
        {console.log("Final Selected Items before render:", selectedItems)}    
    {selectedItems.length > 0 ? (
        
        selectedItems.map((host, index) => (
            <div className="mainItem-r" key={index}>
                    <div className="menu-scrollable-horizontal">
                        <a onClick= {() => {testStream(host.idHost);}} id="stream" className="icon-horizontal">▷</a>
                        <a onClick={revertChanges} id="revert" className="icon-horizontal">↩</a>
                        <a onClick={removeElement} id="remove" className="icon-horizontal">⨂</a>
                    </div>
                    <div className="fields">
                        <textarea onBlur={checkSyntax} name="name" title="Radio title" className="editData corner1" defaultValue={host.name}></textarea>
                        <textarea onBlur={checkSyntax} name="id" title="ID" className="editData" readOnly defaultValue={host.idHost}></textarea>
                        <textarea onBlur={checkSyntax} name="country" title="Country Code" className="editData" defaultValue={host.country}></textarea>
                        <textarea name="fetchTrackInfoUrl" title="Fetch track data URL" className="editData" defaultValue={host.fetchTrackInfo}></textarea>
                        <textarea name="trackTitle" title="JSON path to track title" className="editData" defaultValue={host.pathTT}></textarea>
                        <textarea name="trackArtist" title="JSON path to track artist" className="editData" defaultValue={host.pathTA}></textarea>
                        <textarea name="trackAlbum" title="JSON path to track album cover" className="editData corner2" defaultValue={host.pathTC? host.pathTC : 'No album cover path'}></textarea>
                    </div>
                </div>
            ))
            ) : (
                <p>No radio hosts selected.</p>
            )}
        </div>

        <div className="static-editing-bar">
            <button className="button-discard button" onClick={() => { navigate('/search-hosts') }}>Discard</button>
            <i className="note">These changes apply to all items</i>
            <button className="button-commit button" onClick={confirm}>Commit</button>
        </div>
        <div style={{visibility: "hidden"}}>
            {/*only render the audio player if a station is selected and has a url */}
                <audio ref={audioRef} controls>
                    <source  />
                </audio>
            
        </div>
    </div>
    );
};
export default Workspace;
