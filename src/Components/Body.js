import React from 'react';
import background from './imagee.jpg'; // Assuming the image filename is 'image.jpg'
import { Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const Body = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container className="height center">
        <h1 className="lead fw-bolder">Living Faith Church Worldwide</h1>
        <p className="font-weight-light fw-semibold">Home of Signs and Wonders</p>
        <Nav.Link as={Link} to="/UserCheck" target="_self" className="linkText btn btn-lg btn-success">
          LIVE SERVICE
        </Nav.Link>
      </Container>
    </div>
  );
};

export default Body;
