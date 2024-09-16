import React, { useState, useEffect } from "react";
import { Table, Alert, Spinner, Button } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import ArrangeSessionModal from "../components/ArrangeSessionModal";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferences: {
    monday: { available: boolean | null; start: string; end: string };
    tuesday: { available: boolean | null; start: string; end: string };
    wednesday: { available: boolean | null; start: string; end: string };
    thursday: { available: boolean | null; start: string; end: string };
    friday: { available: boolean | null; start: string; end: string };
    saturday: { available: boolean | null; start: string; end: string };
    sunday: { available: boolean | null; start: string; end: string };
  };
}

const Admin: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalShow, setModalShow] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/employees"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handleCheckboxChange = (employeeId: string) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(employeeId)
        ? prevSelectedIds.filter((id) => id !== employeeId)
        : [...prevSelectedIds, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp._id));
    }
    setSelectAll(!selectAll);
  };

  const handleArrangeSessionClick = () => {
    // Collect emails of selected employees
    const selectedEmails = employees
      .filter((emp) => selectedIds.includes(emp._id))
      .map((emp) => emp.email);

    // Log the selected emails to the console
    console.log("Selected Emails:", selectedEmails);

    // Check if there are selected emails
    if (selectedEmails.length === 0) {
      setError("No emails selected. Please select at least one employee.");
      return;
    }

    // Show the modal
    setModalShow(true);
  };

  const handleArrangeSessionSubmit = (
    date: string,
    time: string,
    agenda: string
  ) => {
    // Combine admin-selected date and time into a single Date object
    const selectedDateTime = new Date(`${date}T${time}`);

    // Get the current date and time
    const currentDateTime = new Date();

    // Check if the selected date/time is earlier than the current date/time
    if (selectedDateTime < currentDateTime) {
      alert(
        "You cannot set a date or time earlier than the current date and time."
      );
      return; // Stop further execution if the date/time is invalid
    }

    // Proceed if the date and time are valid
    const selectedEmails = employees
      .filter((emp) => selectedIds.includes(emp._id))
      .map((emp) => emp.email);

    // Get the admin email from localStorage
    const adminEmail = localStorage.getItem("adminEmail");

    fetch("http://localhost:5000/api/arrange-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminEmail: adminEmail || "", // Fallback to an empty string if not found
        employeeEmails: selectedEmails,
        date,
        time,
        agenda,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data); // Add this to inspect the response

        if (data.success) {
          // Show alert with session details if successful
          alert(
            // Uncomment the following lines if you'd like to show detailed session info
            // `Session arranged successfully!\n\nDate: ${date}\nTime: ${time}\nAgenda: ${agenda}\nEmployees: ${selectedEmails.join(
            //   ", "
            // )}\nGoogle Meet Link: ${data.meetLink}`
            "Session arranged successfully! Mail has been sent to selected users"
          );
          setSelectedIds([]);
          setSelectAll(false);
        } else {
          alert("Failed to arrange session. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error arranging sessions:", error);
        alert("An error occurred while arranging the session.");
      });
  };

  return (
    <div>
      <AppNavbar />
      <h2 className="mt-5 pt-5">Admin Panel</h2>
      <p>Here you can manage user availability and sessions.</p>
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && employees.length > 0 ? (
        <div className="p-3">
          <div className="d-flex justify-content-between mb-3">
            <Button variant="secondary" onClick={handleSelectAll}>
              {selectAll ? "Deselect All" : "Select All"}
            </Button>
            <Button variant="primary" onClick={handleArrangeSessionClick}>
              Arrange Session
            </Button>
          </div>
          <Table striped bordered hover className="mt-4 p-3">
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Email</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(employee._id)}
                      onChange={() => handleCheckboxChange(employee._id)}
                    />
                  </td>
                  <td>
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td>{employee.email}</td>
                  <td>
                    {employee.preferences.monday.available === null
                      ? "Not Set"
                      : `${employee.preferences.monday.start} - ${employee.preferences.monday.end}`}
                  </td>
                  <td>
                    {employee.preferences.tuesday.available === null
                      ? "Not Set"
                      : `${employee.preferences.tuesday.start} - ${employee.preferences.tuesday.end}`}
                  </td>
                  <td>
                    {employee.preferences.wednesday.available === null
                      ? "Not Set"
                      : `${employee.preferences.wednesday.start} - ${employee.preferences.wednesday.end}`}
                  </td>
                  <td>
                    {employee.preferences.thursday.available === null
                      ? "Not Set"
                      : `${employee.preferences.thursday.start} - ${employee.preferences.thursday.end}`}
                  </td>
                  <td>
                    {employee.preferences.friday.available === null
                      ? "Not Set"
                      : `${employee.preferences.friday.start} - ${employee.preferences.friday.end}`}
                  </td>
                  <td>
                    {employee.preferences.saturday.available === null
                      ? "Not Set"
                      : `${employee.preferences.saturday.start} - ${employee.preferences.saturday.end}`}
                  </td>
                  <td>
                    {employee.preferences.sunday.available === null
                      ? "Not Set"
                      : `${employee.preferences.sunday.start} - ${employee.preferences.sunday.end}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <ArrangeSessionModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            onSubmit={handleArrangeSessionSubmit}
          />
        </div>
      ) : (
        !loading && <p>No employees registered yet.</p>
      )}
    </div>
  );
};

export default Admin;
