import React, { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import AppNavbar from "../Navbar";

interface DailyAvailability {
  available: boolean;
  start: string;
  end: string;
}

interface AvailabilityState {
  [day: string]: DailyAvailability; // Index signature
}

const AvailabilityForm: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilityState>({
    Monday: { available: false, start: "", end: "" },
    Tuesday: { available: false, start: "", end: "" },
    Wednesday: { available: false, start: "", end: "" },
    Thursday: { available: false, start: "", end: "" },
    Friday: { available: false, start: "", end: "" },
    Saturday: { available: false, start: "", end: "" },
    Sunday: { available: false, start: "", end: "" },
  });

  const [prevAvailability, setPrevAvailability] =
    useState<AvailabilityState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (day: string, field: string, value: any) => {
    setAvailability((prevState) => {
      const updatedDay = { ...prevState[day], [field]: value };

      return {
        ...prevState,
        [day]: updatedDay,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null); // Reset error

    try {
      const email = localStorage.getItem("employeeEmail");
      if (!email) {
        setError("Employee email is not set. Please log in again.");
        return;
      }

      // Define a function to check for non-empty fields
      const filterEmptyFields = (data: AvailabilityState) => {
        const filteredData: AvailabilityState = {};
        for (const day in data) {
          const { available, start, end } = data[day];
          if (available || (start && end)) {
            filteredData[day] = { available, start, end };
          }
        }
        return filteredData;
      };

      // Convert day names to lowercase and filter empty fields
      const normalizedAvailability: AvailabilityState = Object.keys(
        availability
      ).reduce((acc, day) => {
        const lowercasedDay =
          day.charAt(0).toLowerCase() + day.slice(1).toLowerCase();
        acc[lowercasedDay] = availability[day];
        return acc;
      }, {} as AvailabilityState);

      const filteredAvailability = filterEmptyFields(normalizedAvailability);

      // Only send data if there are changes
      if (Object.keys(filteredAvailability).length === 0) {
        window.alert("No valid changes detected.");
        return;
      }

      // Send data to the server including the email
      const response = await fetch(
        "http://localhost:5000/api/update-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, availability: filteredAvailability }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        window.alert("Availability updated successfully!");
        setAvailability({
          Monday: { available: false, start: "", end: "" },
          Tuesday: { available: false, start: "", end: "" },
          Wednesday: { available: false, start: "", end: "" },
          Thursday: { available: false, start: "", end: "" },
          Friday: { available: false, start: "", end: "" },
          Saturday: { available: false, start: "", end: "" },
          Sunday: { available: false, start: "", end: "" },
        });
      } else {
        setError(
          data.message || "Error updating availability. Please try again."
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An error occurred while updating availability.");
    }
  };

  return (
    <>
      <AppNavbar />
      <Container className="mt-5 pt-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-lg">
              <Card.Body>
                <h2 className="text-center mb-4">Set Your Availability</h2>
                <Form onSubmit={handleSubmit}>
                  {Object.keys(availability).map((day) => (
                    <div key={day} className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label={day}
                        checked={availability[day].available}
                        onChange={(e) =>
                          handleChange(day, "available", e.target.checked)
                        }
                      />
                      {availability[day].available && (
                        <Row className="mt-3">
                          <Col>
                            <Form.Group controlId={`start-${day}`}>
                              <Form.Label>Start Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={availability[day].start}
                                onChange={(e) =>
                                  handleChange(day, "start", e.target.value)
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group controlId={`end-${day}`}>
                              <Form.Label>End Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={availability[day].end}
                                onChange={(e) =>
                                  handleChange(day, "end", e.target.value)
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                    </div>
                  ))}
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Button variant="primary" className="w-100" type="submit">
                    Save Availability
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

export default AvailabilityForm;
