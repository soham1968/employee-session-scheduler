// ArrangeSessionModal.tsx
import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (date: string, time: string, agenda: string) => void;
}

const ArrangeSessionModal: React.FC<Props> = ({ show, onHide, onSubmit }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agenda, setAgenda] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!date || !time || !agenda) {
      setError("All fields are required.");
      return;
    }
    onSubmit(date, time, agenda);
    onHide(); // Hide the modal
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Arrange Google Meet Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="formDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formTime">
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formAgenda">
            <Form.Label>Agenda</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Arrange Session
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ArrangeSessionModal;
