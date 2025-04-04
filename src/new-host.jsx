import React, { useRef, useState, useEffect  } from 'react';
import './css/inserting-workspace.css';
import { div, text } from 'framer-motion/client';
import { useNavigate } from 'react-router-dom';

const NewHosts = () => {
    const [validated, setValidated] = useState(false);
    const itemsRef = useRef();
    const initRender = useRef(true);
    const itemRef = useRef();
    const itemAdderRef = useRef();
    // const inputsRef = useRef([]);
    const navigate = useNavigate();
    const refs = useRef([]); // for new windows created
    const scrollToTop = useRef();
    let [topRef, setTopValue] = useState(0);
    
    let updateHostID = 0;
    const audioRef = useRef(null); //to preview station audio
    const [windows, addNewWindow] = useState([]);
    const [stations, setNewRadios] = useState([]);
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
            case 'country':
                if (!value.trim() || !/^[A-Z]{2}$/.test(value)) {
                    e.target.classList.add('border-warning');
                    e.target.value = '';
                    setVerification(false);
                } else {
                    e.target.classList.remove('border-warning');
                    setVerification(true);
                }
                break; 
            case 'trackTitle':
                if (!value.trim()) {
                    e.target.classList.add('border-warning');
                    setVerification(false);
                } else {
                    e.target.classList.remove('border-warning');
                    setVerification(true);
                }
                break;
            case 'trackArtist':
                if (!value.trim()) {
                    e.target.classList.add('border-warning');
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
            alert('Ensure all fields are correct and filled. Remove any empty windows.');
        }else{
            try{
                const items = Array.from(itemsRef.current.querySelectorAll('.new-item')); 
                const newRadios = { hosts: [] };
            
                items.forEach((item) => { 
                    const newRadio = {};
                    const fields = Array.from(item.querySelectorAll('.input'));
            
                    fields.forEach((field) => {  
                        const { name, value } = field; 
                        if (value.trim()) {
                            newRadio[name] = value; //add the value if not empty
                        } else {
                            throw new Error('Empty field detected. Ensure there are no empty templates and all fields are filled.'); //throw error
                        }
                    });
                    newRadios.hosts.push(newRadio);
                });
                insert(newRadios); 
                setNewRadios(newRadios); 
            }catch(e){
                alert(e);
                return;
            }
        }
    };
    
    // for inserting
    const insert = async(newRadios) => {
        console.log(JSON.stringify(newRadios));
        // TODO fix the heading after deployment
        console.log('data sent');
        try {
            const response = await fetch(`http://obesecat.atwebpages.com/radio-services/insertRadioHosts.php`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(newRadios), // The object containing the data
            });
            const data = await response.json(); //parse the response body as JSON
            if(data.status=='error'){
                alert(data.message);
            }else if(data.status==='success'){
                setTimeout(() => {
                    alert('Hosts were successfully added. You will now be redirected.')
                    navigate('/home');
                }, 1000);
            }
        } catch (e) {
            alert('Ensure there are no empty templates and you have a stable internet connection.'); 
        }
    };
    
    // add component for additional windows 
    const addComponent = () => {
        setVerification(false);
        console.log('Added a new window');
        const newWindow = (
            <div
                key={windows.length+1}
                ref={(newRef) => (refs.current[windows.length+1] = newRef)}
                className="new-item transformed"
                // TODO add empty attribute
            >
                <button className={`txt-box btn-s`} onClick={(e) => { e.target.closest('.new-item').remove();}}>⨉</button>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Radio host's name"
                    name="name"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Country hosting the radio"
                    name="country"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="URL to fetch track's info"
                    name="getTrackInfoUrl"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track title"
                    name="trackTitle"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track artist"
                    name="trackArtist"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track cover"
                    name="trackCover"
                ></textarea>
                {/* <button className="txt-box btn transformed" onClick={(e) => testStream(e)} >Validate URL</button> */}
            </div>
        );
        addNewWindow((prevWindows) => [...prevWindows, newWindow]);
        setTopValue((prevTop) => prevTop + 17); //update the value of the window that is being added
        refs.current[windows.length].scrollIntoView({behavior:"smooth",block:"start"});
    };

    const transform = () => {
        addComponent();
    };

    return (
        <div className="main-newStation">
        <div className="static-bar-new">
            <h1>New Radio Host</h1>
        </div>
        <div className='tip'>
            Submit new radio hosts here!
            All fields, except for path to album, should be filled with relevant data.
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
                <button className={`txt-box btn-s`} onClick={(e) => { e.target.closest('.new-item').remove();}}>⨉</button>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Radio host's name"
                    name="name"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Country hosting the radio"
                    name="country"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="URL to fetch track's info"
                    name="getTrackInfoUrl"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track title"
                    name="trackTitle"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track artist"
                    name="trackArtist"
                ></textarea>
                <textarea
                    className="txt-box input transformed"
                    onBlur={(e) => { validate(e) }}
                    placeholder="Path to track cover"
                    name="trackCover"
                ></textarea>
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

export default NewHosts;
