import React  from 'react';
import {Nav} from 'react-bootstrap';
import unitLogo from './ictgroup_logo.png';
const Footer = () => {
    return ( 
        <div className='dark'>
        <Nav defaultActiveKey="/home" className="justify-content-end centeredd">
        <Nav.Link href="https://ftwinnersictg.org/membership-application-form/" target='_blank'><h6 className="linkText">Join ICTG</h6></Nav.Link>
        <Nav.Link href="http://radio.shoutcastmedia.net:8302/stream" target='_blank'><h6 className="linkText">Domi Radio</h6></Nav.Link>
        <Nav.Link href="https://ftwinnersictg.org/download-our-mobile-apps/" target='_blank'><h6 className="linkText">Download Winners World App</h6></Nav.Link>
        <Nav.Link eventKey="disabled" disabled className="text-bold">
            <img src={unitLogo} alt="unit-logo"/> Powered by; ICTGroup, Canaanland.
        </Nav.Link>
        </Nav>
        </div>
     );
}
 
export default Footer;