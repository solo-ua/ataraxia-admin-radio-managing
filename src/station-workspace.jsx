import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import './css/common.css';
import './css/radio.css';
import './css/editing-workplace.css';

const StationWorkspace = () => {
    const [errorLogs, newErrorLog] = useState(['Woohoo! All clean']);
    const location = useLocation();
    const navigate = useNavigate();
    // const [station, setSelectedStation] = useState([]); 
    const [hosts, setHosts] = useState([]); // used for host selection dropdown menu
    let updateHostID = 0; // used to keep track of the current selected host ids the stations correspond to
    let changesApplied = true; // to display the final message that the updated values were successfull
    // Destructuring the selectedItems from location.state
    const { selectedItems = [] } = location.state || {}; // the existing radio hosts
   
    const [errorProof, errorProofIs] = useState(true); // for displaying error logs
    // this is used to test the radio
    const audioRef = useRef(null); //to preview station audio

    // get all the hosts for binding stations with the host
    useEffect(() => { 
        const fetchHosts = async () => { 
            try {
                const response = await fetch('http://obesecat.atwebpages.com/radio-services/radioHosts.php');
                const data = await response.json();
                console.log(data.hosts);
                if (data.hosts.length > 0) {
                    setHosts(data.hosts); 
                } else {
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, `No Radio Hosts found`]);
                }
            } catch (e) {
                newErrorLog((prevErrorLogs) => [...prevErrorLogs, e.toString()]);
            }}
        fetchHosts();
    },[]);


    // checks syntax of the values entered by the user before confirmation
    const checkSyntax = (event) => {
        const fieldName = event.target.name;
        if((!event.target.value.trim())&&(fieldName!='idStation')){
            errorProofIs(false);
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, `All fields must be filled.`]);
        }
        const value = event.target.value;
        errorProofIs(true);
        switch (fieldName) {
            case "name":
                if(value.length<4){
                    errorProofIs(false);
                    event.target.value = '';
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, `Name should have appropriate legnth. At least 5 characters.`]);
                }
            ;break;
            case "idStation":
                try {
                    if (value.trim()) { //makes sure it's not null or just whitespace
                        if (!/^\d+$/.test(value)) { //for digits
                            throw new Error('Station ID can only contain digits.');
                        }
                    }
                } catch (e) {
                    errorProofIs(false);
                    event.target.value = ''; // Clears the invalid value
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, e.message]); // Logs the error message
                }
            ;break;
            case "url":
                const regexUrl = /^(https?:\/\/)/;
                if(regexUrl.test(value)){ 
                    errorProofIs(false);
                    event.target.value = '';
                    newErrorLog((prevErrorLogs) => [...prevErrorLogs, 'Enter a valid URL link']);
                }
            ;break;
            }
        }
        
        // updates the values before sending a put request
    const updateValues = () => {
        const items = Array.from(document.querySelectorAll('.mainItem-s'));
        const updateStation = {
            idSS: 0,
            fieldsToUpdate: ['idHostedBy',],
            newValues:[updateHostID,]
        };
        const updatedStationData = {};
        items.forEach((item) => { 
            // Get textareas within the current items
            // we extract attributes of each element and organise them as valid data objects
            const attributeElements = Array.from(item.querySelectorAll('.editData')); 
            updateStation.idSS = item.id;
            
            attributeElements.forEach((attribute) => {
                const { name, value } = attribute; // extracting the name and value of each textarea as attribute and value
                updateStation.fieldsToUpdate.push(name);
                updateStation.newValues.push(value);  
            });
            applyChanges(updateStation);
        });
        console.log(updateStation);
        applyChanges(updateStation);
        console.log(changesApplied);
        if(changesApplied){
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, 'Stations have been updated successfully!']);
            setTimeout(() => {
                alert('Stations were successfully updated. You will now be redirected.')
                navigate('/home');
            }, 500);
        }
    }
    
    // upon confirmation, the changes are applied
    const confirm = () => {
        if(errorProof){
            updateValues();
        }
    };

    // sends a put request submitting the altered radio host
    // TODO edit this code for stations
    const applyChanges = async (hostData) => {
        console.log(JSON.stringify(hostData));
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/editStations.php`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(hostData), 
            });
            const data = await response.json(); //parse the response body as JSON
            if(data.status=='error'){
                newErrorLog((prevErrorLogs) => [...prevErrorLogs, response.message]);
                changesApplied = false;
            }
        } catch (e) {
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, e.toString()]);
        }
    };
    

    // reset changes of the specific host
    const revertChanges = (event) => { 
        console.log('reverting...');
        const dataToRevert = Array.from(event.target.closest('.mainItem-s').querySelectorAll('.editData')); 
        console.log(dataToRevert);
        dataToRevert.forEach(input => {
            console.log(input);
            input.value = input.defaultValue;
        });
    };

    // remove element
    const removeElement = (event) => { 
        const host = event.target.closest('.mainItem-s');
        host.remove();
        audioRef.current.pause(); // inccase the user was playing the host they removed
    }

    const testStream = (station) => {
        //stop and reset the previous audio before changing the source
        try{
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            //update src
            audioRef.current.src = station.url;
            //and now play it yippee 
            audioRef.current.play()
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, `🎧NOW PLAYING🎧 Station: ${station.name}`]);
        } catch(e){
            newErrorLog((prevErrorLogs) => [...prevErrorLogs, `Invalid URL of the station: ${station.name}`]);
        }
    };

    return (
    <div className="home-workspace">
        <h1>Station Workspace</h1>
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
            {/* <button className="button button-clear" >Clear</button> */}
        </div>

        <div className="chosen-items">
    {selectedItems.length > 0 ? (
        selectedItems.map((station, index) => (
            updateHostID = station.idHostedBy,
            <div className="mainItem-s" id={station.idSS} key={index}>
                <div className="menu-scrollable-horizontal">
                    {/* <a onClick= {() => {testStream(station.idStation);}} id="stream" className="icon-horizontal">▷</a> */}
                    <a  onClick={(e) => {
                        const parent = e.target.closest('.mainItem-s');
                        const streamUrl = parent.querySelector('textarea[name="streamUrl"]').value;
                        testStream({ ...station, url: streamUrl });
                    }} id="stream" className="icon-horizontal">▷</a>
                    <a onClick={revertChanges} id="revert" className="icon-horizontal">↩</a>
                    <a onClick={removeElement} id="remove" className="icon-horizontal">⨂</a>
                </div>
                <div className="fields">
                    <textarea onBlur={checkSyntax} name="name" title="Station's name" className="editData corner1" defaultValue={station.name}></textarea>
                    <textarea onBlur={checkSyntax} name="idStation" title="Station ID" className="editData" defaultValue={station.idSS}></textarea>
                    <textarea onBlur={checkSyntax} name="streamUrl" title="Streaming URL" className="editData" defaultValue={station.url}></textarea>
                    <select
                        className="editData-selector corner2"
                        name="idHostedBy"
                        onChange={(e) => {
                            updateHostID=e.target.value;
                        }}
                    >
                        {hosts.length > 0 ? (
                            hosts.map((host) => (
                                <option
                                    selected = {station.idHostedBy===host.idHost? station.idHostedBy : 0    }
                                    className="option-s"
                                    key={host.idHost}
                                    value={host.idHost}
                                >
                                    {host.idHost} - {host.name}
                                </option>
                            ))
                        ) : (
                            <option className="option-s" value="">
                                No Hosts Found
                            </option>
                        )}
                    </select>
                </div>
            </div>
                ))
            ) : (
                <p>No stations hosts selected.</p>
            )}
        </div>

        <div className="static-editing-bar">
            <button className="button-discard button" onClick={() => { navigate('/search-hosts') }}>Discard</button>
            <i className="note">These changes apply to all items</i>
            <button className="button-commit button" onClick={confirm}>Commit</button>
        </div>
        <div style={{visibility: "hidden"}}>
                <audio ref={audioRef} controls>
                    <source />
                </audio>
        </div>
    </div>
    );
};
export default StationWorkspace;