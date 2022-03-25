import React, {useEffect, useState} from 'react';
const Home = () => {
    const [info, setInfo] = useState({});
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

    useEffect(()=> {
      getInfo();
    }, []);

       return(
         <div className='container'>
            <h1>Living Faith Church International</h1>
            <p className='motto'>Home of Signs and Wonders</p>
            <p>Online User Count for current Service:{info.OnlineUsersCount}</p>
            <p>Streaming Title {info.LiveStreamTitle}</p>
      
         </div>
       );
    }
 
export default Home;