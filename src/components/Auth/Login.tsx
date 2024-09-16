import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is included

const Login: React.FC = () => {
  return (
    <Container fluid className="bg-light vh-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col md={6} lg={4}>
          <Card className="text-center shadow-lg">
            <Card.Body>
              <Card.Title className="mb-4">Login Page</Card.Title>
              <div className="mb-4">
                <p className="lead">Select your login type</p>
              </div>
              <div>
                <Link to="/login/employee">
                  <Button variant="primary" className="m-2">
                    Employee Login
                  </Button>
                </Link>
                <Link to="/login/admin">
                  <Button variant="secondary" className="m-2">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
