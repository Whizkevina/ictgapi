import background from './imagee.jpg';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Container } from "react-bootstrap";
import React, {useEffect, useState} from 'react';
import ReactPlayer from 'react-player';
// import React, { useEffect } from 'react'; // Import the useEffect hook
const LiveService = () => {
    const [info, setInfo] = useState({});
    //url equals the API link
    const url = `https://ftapp.lfcww.org/api/Dashboard/togglelivestreamstate`;
    const getInfo = async()=>{
      try {
        const response = await fetch(url);
         const data = await response.json()
         setInfo(data);
      } catch (error) {
          console.error(error);
      } 
    }

    // ...

    useEffect(() => {
      getInfo();
    }); // Remove the empty dependency array


    return (
       //background image
       //import the Navigation component in the LiveStream component
        //Create a container for the react video player
         //import the Footer component in the LiveStream component
          //{info.LiveStreamUrl} and other codes similar to this is gotten from the API
       <div style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>   
        <Navigation />
            <div className='boxed'>
            <Container className= 'center'>
            {info.LiveStreamUrl && <ReactPlayer url= {info.LiveStreamUrl} className='border' width="100%" height="100%"/>}
            </Container>
            <p className='information'>SERVICE TITLE: <span className='span'>{info.LiveStreamTitle}</span></p>
            <p className='information'> ONLINE WORSHIPPERS COUNT: <span className='span'>{info.OnlineUsersCount}</span></p>
            </div>
        <Footer />
       </div>
        
     );
}
 
export default LiveService;