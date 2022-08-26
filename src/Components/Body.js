import React from 'react';
import background from './imagee.jpg';
import {Container, Nav} from 'react-bootstrap';
const Body = () => {
    return ( 
        <div style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        <Container className="height center">
        <h1 className="lead">Living Faith Church Worldwide</h1>
        <p className="font-weight-light">Home of Signs and Wonders</p>
        
        <Nav.Link href="/LiveStream" target='_blank'><button className="linkText btn btn-dark">LIVE SERVICE</button></Nav.Link>
        
        </Container>
        </div>
     );
}
 
export default Body;