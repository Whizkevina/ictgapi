import React from 'react';
import Navigation from "./Navigation";
import Body from "./Body";
import Footer from "./Footer";

const Home = () => {
    return ( 
      <div className="page-container">
          <Navigation />
          <Body />
          <Footer />
      </div>
     );
}
 
export default Home;