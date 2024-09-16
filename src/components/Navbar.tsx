import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const isEmployeeLoggedIn =
    localStorage.getItem("employeeLoggedIn") === "true";
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("employeeLoggedIn");
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Scheduling App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isEmployeeLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/availability">
                  Availability
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : isAdminLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/admin">
                  Admin Panel
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login/employee">
                  Employee Login
                </Nav.Link>
                <Nav.Link as={Link} to="/login/admin">
                  Admin Panel
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
