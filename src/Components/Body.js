import React from 'react';
import background from './imagee.jpg';
import {Container, Nav} from 'react-bootstrap';
const Body = () => {
    return ( 
        <div style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        <Container className="height center">
        <h1>Living Faith Church Worldwide</h1>
        <p>Home of Signs and Wonders</p>
        <button>
        <Nav.Link href="/LiveStream" target='_blank'><h6 className="linkText">LIVE SERVICE</h6></Nav.Link>
        </button>
        </Container>
        </div>
     );
}
 
export default Body;