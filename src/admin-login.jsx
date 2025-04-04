import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css'
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [adminInfo, setAdminInfo] = useState(null);
    const navigate = useNavigate();
    const inputLgn = useRef();

    useEffect(() => { 
        // check on mount if the user has already logged in and sent them to home page
        const isLogged = sessionStorage.getItem('loggedIn');
            if(isLogged){
                const data = JSON.parse(isLogged);
                navigate('/home', { state: { data } });
            }
     },[])

    const login = async () => {
        setError(''); // Clear previous errors
        setAdminInfo(null); // Clear previous admin info

        if (!email || !password) {
        setError('Email and password are required');
        return;
        }

        try {
        const response = await fetch('http://obesecat.atwebpages.com/admins/admin-login.php', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.idAdmin) { // success
            // store session data here
            sessionStorage.setItem('loggedIn',JSON.stringify(data));
            setError('');
            console.log(data);
            navigate('/home', { state: { data } });
        } else {
            // Login failed
            setError(data.error || 'An error occurred');
        }
        } catch (err) {
        setError('Ensure you are connected to the internet.');
        }
    };


    useEffect(() => { 
        if(error.trim()){
            inputLgn.current.classList.toggle('error-detected');
        }
        
    },[error]);

    const updateUI = () => { 
        inputLgn.current.classList.remove('error-detected');
    }  

    return (
        <div className='centralise'>
        <h1>Ataraxia's Radio Manager</h1>
        <p className='subtitle'>For authorized users only!</p>

        <div className='login-win centralise' ref={inputLgn}>
            <h1 className='login-header'>Login</h1>
            <input
            type="email"
            placeholder="Admin's email"
            value={email}
            onChange={(e) => {updateUI(); setEmail(e.target.value)}}
            className='txt-box input-lgn'
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {updateUI(); setPassword(e.target.value)}}
            className='txt-box input-lgn'
            />
            <button onClick={login}
            className='txt-box input-lgn input-lgn-btn'
            >
                Login
            </button>
        </div>

        {error && <p className='login-error'>{error}</p>}
        {/* {adminInfo && (
            <div>
            <h3>Welcome, {adminInfo.admin_username}!</h3>
            <p>Email: {adminInfo.admin_email}</p>
            <p>ID: {adminInfo.idAdmin}</p>
            </div>
        )} */}
        </div>
    );
};

export default Login;