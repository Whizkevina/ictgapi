import React from "react";
import logo from "./app_icon.png";
import { Navbar, Nav, Container } from "react-bootstrap";
const Navigation = () => {
  return (
    /*Navigation bar, bootstrap is in use,
        It contains direct links to the Home and Livestream page
        It is responsive for all devices */
    <div>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            <img src={logo} alt="unit-logo" width="50" height="50" /> Living Faith Church Worldwide
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#livestream">LiveStream</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navigation;
