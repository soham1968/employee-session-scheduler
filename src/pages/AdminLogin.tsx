import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import AppNavbar from "../components/Navbar";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // State for success message
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reset error and success
    setError(null);
    setSuccess(null);

    // Validate fields
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Perform login logic here (e.g., validate credentials with backend)
      const response = await fetch("http://localhost:5000/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail: email, password }), // Changed 'email' to 'mail'
      });
      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect
        setSuccess(`Welcome, ${data.name}!`); // Assuming `data.name` contains the admin's name
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", email);
        // const adminEmail = localStorage.getItem("adminEmail");
        // alert(adminEmail);
        setTimeout(() => {
          navigate("/Admin"); // Redirect to admin page
        }, 2000); // Delay to show the alert
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred.");
      }
    }
  };

  return (
    <>
      <AppNavbar />
      <Container className="my-5 pt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg">
              <Card.Body>
                <Card.Title className="mb-4">Admin Login</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100">
                    Login
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminLogin;
