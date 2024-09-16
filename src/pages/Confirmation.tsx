import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Container, Row, Col } from "react-bootstrap";
import AppNavbar from "../components/Navbar";

const Confirmation: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timeout of 3 seconds before redirecting
    const timer = setTimeout(() => {
      navigate("/login/employee"); // Redirect to EmployeeLogin page
    }, 3000);

    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <AppNavbar />
      <Container className="mt-5 pt-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="text-center">
              <h1>Registration Successful!</h1>
              <p>Your employee registration has been completed successfully.</p>
              <p>You will be redirected to the login page shortly.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Confirmation;
