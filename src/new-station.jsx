import React, { useRef, useState, useEffect  } from 'react';
import './css/inserting-workspace.css';
import { div, text } from 'framer-motion/client';
import { useNavigate } from 'react-router-dom';

const NewStation = () => {
    const [validated, setValidated] = useState(false);
    const itemsRef = useRef();
    const initRender = useRef(true);
    const itemRef = useRef();
    const itemAdderRef = useRef();
    const navigate = useNavigate();
    const refs = useRef([]); // for new windows created
    const scrollToTop = useRef();
    let [topRef, setTopValue] = useState(0);
    
    let updateHostID = 0;
    const audioRef = useRef(null); //to preview station audio
    const [windows, addNewWindow] = useState([]);
    const [stations, setNewStations] = useState([]);
    const [hosts,setHosts] = useState([]);
    const [verified,setVerification] = useState(false);

    useEffect(() => { 
        const fetchHosts = async () => { 
            try {
                const response = await fetch('http://obesecat.atwebpages.com/radio-services/radioHosts.php');
                const data = await response.json();
                console.log(data.hosts);
                if (data.hosts.length > 0) {
                    setHosts(data.hosts); 
                }
            } catch (e) {
                console.log(e);
            }}
        fetchHosts();
    },[]);


    // for validation
    // TODO cleanup the code here 
    const validate = (e) => {
        const {name,value} = e.target;
        const station = {
            idHostedBy: 3,
            idStation: 0,
            name: '',
            streamUrl: '',
        }
        switch(name) {
            case 'name': 
                if (!value.trim()) {
                    e.target.classList.add('border-warning');
                    e.target.value = '';
                    setVerification(false);
                } else {
                    e.target.classList.remove('border-warning');
                    setVerification(true);
                }
                break;
            case 'idStation':
                if (!value.trim() || !/^\d+$/.test(value)) {
                    e.target.classList.add('border-warning');
                    e.target.value = '';
                    setVerification(false);
                } else {
                    e.target.classList.remove('border-warning');
                    setVerification(true);
                }
                break; 
            case 'idHostedBy':
                if (!value.trim()) {
                    e.target.classList.add('border-warning');
                    // TODO fix
                    // e.target.attribute('isEmpty') = true;
                    setVerification(false);
                } else {
                    e.target.classList.remove('border-warning');
                    setVerification(true);
                }
                break;
            
        }
    };

    // organise data and prepare it for submission
    const prepare = () => { 
        if(!verified){
            alert('Ensure all fields are correct');
        }else{
            try{
                const items = Array.from(itemsRef.current.querySelectorAll('.new-item')); 
                const newStations = { stations: [] };
                items.forEach((item) => { 
                    const newStation = {};
                    const fields = Array.from(item.querySelectorAll('.input')); //extract every field and assign value
            
                    fields.forEach((field) => {
                        const { name, value } = field; 
                        if (value.trim()) {   //if the value is empty we throw error
                            newStation[name] = value; 
                        } else {
                            throw new Error('Empty field detected. Ensure there are no empty templates and all fields are filled.'); //throw error
                        }
                    });
                    newStations.stations.push(newStation);
                });
                insert(newStations); //submit new stations
                setNewStations(newStations); 

            }catch(e){
                console.log('ass');
                alert(e);
                return;
            }
        }
    };

    // for testing stream
    const testStream = (e) => {
        try {
            e.preventDefault();
            const textarea = e.target.previousElementSibling;
            console.log(textarea.value);
            const url = textarea.value;
        
            //stop previous audio before changing the source
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        
            // Update audio source
            audioRef.current.src = url;
        
            //handle the errors
            audioRef.current.onerror = () => {
                alert('Invalid URL.');
            };
        
            //play the audio and catch potential errors 
            audioRef.current
                .play()
                .catch((err) => {
                    console.log('error with audioplayer:' + err);
                });
        } catch (err) {
            alert('Ensure you are connected to the internet.');
        }
        
    };
    
    // for inserting
    const insert = async(newStations) => {
        console.log(JSON.stringify(newStations));
        // TODO fix the heading after deployment
        console.log('data sent');
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/insertStations.php`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(newStations), // The object containing the data
            });
            const data = await response.json(); //parse the response body as JSON
            console.log(data);
            if(data.status == 'error'){
                alert(data.message);
            }else if(data.status =='success'){
                setTimeout(() => {
                    alert('Stations were successfully added. You will now be redirected.')
                    navigate('/home');
                }, 1000);
            }
        } catch (e) {
            alert('Ensure there are no empty templates and you have a stable internet connection.'); 
        }
    };
    
    // add component for additional windows 
    const addComponent = () => {
        console.log('Added a new window');
        setVerification(false);
        const newWindow = (
            <div
                key={windows.length+1}
                ref={(newRef) => (refs.current[windows.length+1] = newRef)}
                className="new-item transformed">
                <button className={`txt-box btn-s`} onClick={(e) => { e.target.closest('.new-item').remove();}}>⨉</button>
                <select className="txt-box input transformed" onBlur={(e) => { validate(e) }} name="idHostedBy" onChange={(e) => {updateHostID=e.target.value;}}>
                {hosts.length > 0 ? (
                    hosts.map((host) => (
                        <option key={host.idHost} value={host.idHost}>
                            {host.idHost} - {host.name}
                        </option>
                    ))
                    ) : (
                    <option className="option-s" value="">
                        No Hosts Found
                    </option>
                )}
                </select>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Station name"
                    name="name"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Station ID"
                    name="idStation"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Stream URL"
                    name="streamUrl"
                ></textarea>
                <button className="txt-box btn transformed" onClick={(e) => testStream(e)} >Validate URL</button>
                <button className={`txt-box btn-s`} onClick={(e) => {audioRef.current.pause()}}>🔇</button>
            </div>
        );
        addNewWindow((prevWindows) => [...prevWindows, newWindow]);
        setTopValue((prevTop) => prevTop + 17); // Update the top value for the next window
        refs.current[windows.length].scrollIntoView({behavior:"smooth",block:"start"});
    };

    const transform = () => {
        addComponent(); // Add a new window
        if(initRender.current){
            
        }
        // if (initRender.current) {
        //     // for initial transformation only
        //     initRender.current = false;
        //     itemRef.current.classList.add('transformed');
        //     setTopValue(parseFloat(window.getComputedStyle(itemRef.current).top));
        //     itemAdderRef.current.classList.add('transformed');
        //     inputsRef.current.classList.add('transformed');
        //     btnsRef.current.classList.add('transformed');
        // } else {
        //     console.log(itemAdderRef.current.style);;
        // }
    };

    return (
        <div className="main-newStation">
        <div className="static-bar-new">
            <h1>New Station</h1>
        </div>
        <div className='tip'>
            Submit new stations to existing radio hosts.
            Ensure all of the fields are filled with the relevant data and
            you may test the stream before submission!
        </div>
        <div className="bg"></div>
        <div className="frame transformed">
            <div ref={itemAdderRef} className="new-item-add transformed">
                <button onClick={transform} className={`txt-box btn transformed`}>
                    Create New
                </button>
            </div>
            <div ref={itemsRef} style={{ display: 'contents' }}>
                <div ref={itemRef} className={`new-item transformed`}>
                    <button className={`txt-box btn-s`} onClick={(e) => { e.target.closest('.new-item').remove();}}>X</button>
                    <select
                        className={`txt-box input transformed`}
                        onBlur={(e) => { validate(e) }}
                        name="idHostedBy"
                        onChange={(e) => {updateHostID=e.target.value;}}>
                         {hosts.length > 0 ? (
                            hosts.map((host) => (
                                <option key={host.idHost} value={host.idHost}>
                                    {host.idHost} - {host.name}
                                </option>
                            ))
                            ) : (
                            <option className="option-s" value="">
                                No Hosts Found
                            </option>
                        )}
                    </select>
                    <textarea
                        className={`txt-box input transformed`}
                        onBlur={(e) => { validate(e) }}
                        placeholder="Station name"
                        name="name"
                    ></textarea>
                    <textarea
                        className={`txt-box input transformed`}
                        onBlur={(e) => { validate(e) }}
                        placeholder="Station ID"
                        name="idStation"
                    ></textarea>
                    <textarea

                        className={`txt-box input transformed`}
                        onBlur={(e) => { validate(e) }}
                        placeholder="Stream URL"
                        name="streamUrl"
                    ></textarea>
                    <button
                        className={`txt-box btn transformed`}
                        onClick={(e) => {testStream(e);}}
                    >
                        Validate URL
                    </button>
                    <button className={`txt-box btn-s`} onClick={(e) => {audioRef.current.pause()}}>🔇</button>

                </div>
            {windows}
            </div>
        </div>
        <div style={{visibility: "hidden"}}>
                <audio ref={audioRef} controls>
                    <source />
                </audio>
        </div>
        <div style={{margin:'auto', width:'75vw', display:'flex', justifyContent:'space-between'}}>
            <button ref={scrollToTop} onClick={() => { itemAdderRef.current.scrollIntoView({behavior:"smooth",block:"start"}) }} className='txt-box insert'>△</button>
            <button className='txt-box insert' onClick={prepare}>Insert</button>
        </div>
    </div>
       
    );
};

export default NewStation;
