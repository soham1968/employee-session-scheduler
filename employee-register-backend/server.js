require("dotenv").config({ path: "C:/Users/HP/Desktop/rect-pro/my-app/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB using mongoose
mongoose
  .connect("mongodb://localhost:27017/availability_scheduler", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Configure Nodemailer with environment variables
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.EMAILID,
    pass: process.env.EMAILPASS,
  },
});

// Function to send emails
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "sohombehera@outlook.com",
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

// Google Calendar API Configuration
const oauth2Client = new google.auth.OAuth2(
  "1051425447728-f8qcdofcri53if1auf5hs73db961ovh6.apps.googleusercontent.com",
  // Replace with your actual client ID
  "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", // Replace with your actual client secret
  "http://localhost:5000/auth/callback" // Replace with your actual redirect URI
);

oauth2Client.setCredentials({
  refresh_token:
    "1//04f9V42tzKM8ZCgYIARAAGAQSNwF-L9IrWQW5PkWl69ADE_K4P6jA0aBChSI0fRcttURQMQh5oIIBPJ_ZTtdpiHVqzcJrMnVadjw", // Replace with your actual refresh token
});

// Refresh token handler (auto-refresh before expiration)
const refreshToken = async () => {
  try {
    const tokens = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(tokens.credentials);
    console.log("Access token refreshed successfully");
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
  }
};

// Schedule token refresh
const tokenRefreshInterval = 60 * 60 * 1000; // Refresh token every hour
setInterval(refreshToken, tokenRefreshInterval);

// Create Google Calendar instance
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

app.post("/api/arrange-sessions", async (req, res) => {
  const { adminEmail, employeeEmails, date, time, agenda } = req.body;

  console.log("Received data:", {
    adminEmail,
    employeeEmails,
    date,
    time,
    agenda,
  });

  try {
    if (!Array.isArray(employeeEmails) || employeeEmails.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid employee emails." });
    }

    console.log("Employee Emails:", employeeEmails);

    // Use the correct time zone for your location (e.g., Asia/Kolkata for IST)
    const timeZone = "Asia/Kolkata";

    // Combine date and time into a proper Date object with time zone
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-hour meeting

    const event = {
      summary: "Team Meeting",
      description: agenda,
      start: {
        dateTime: startTime.toISOString(),
        timeZone, // Set to your desired time zone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone, // Set to your desired time zone
      },
      attendees: [
        ...employeeEmails.map((email) => ({ email })),
        { email: adminEmail }, // Ensure admin gets the invitation too
      ],
      conferenceData: {
        createRequest: {
          requestId: "meet" + new Date().getTime(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: true,
      },
    };

    console.log("Event Object:", event);

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all", // Ensure all attendees receive an invitation email
    });

    const meetLink = response.data.hangoutLink;
    console.log("Google Meet link generated:", meetLink);

    const emailText = `A Google Meet session has been scheduled on ${date} at ${time}.\nAgenda: ${agenda}\nGoogle Meet Link: ${meetLink}`;

    // Send email notifications
    await sendEmail(employeeEmails.join(", "), "Meeting Scheduled", emailText);
    await sendEmail(adminEmail, "Meeting Scheduled", emailText);

    // Send a success response to the frontend
    res.status(200).json({
      success: true,
      message: "Google Meet session arranged successfully.",
      meetLink,
    });
  } catch (error) {
    console.error("Error arranging Google Meet session:", error.message);
    res.status(500).json({
      success: false,
      message: "Error arranging session: " + error.message,
    });
  }
});

// Employee Schema
const employeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  number: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const Employee = mongoose.model("Employee", employeeSchema);

// Employee Preference Schema
const employeePreferenceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  availability: {
    monday: { type: Object, default: { available: null, start: "", end: "" } },
    tuesday: { type: Object, default: { available: null, start: "", end: "" } },
    wednesday: {
      type: Object,
      default: { available: null, start: "", end: "" },
    },
    thursday: {
      type: Object,
      default: { available: null, start: "", end: "" },
    },
    friday: { type: Object, default: { available: null, start: "", end: "" } },
    saturday: {
      type: Object,
      default: { available: null, start: "", end: "" },
    },
    sunday: { type: Object, default: { available: null, start: "", end: "" } },
  },
});

const EmployeePreference = mongoose.model(
  "EmployeePreference",
  employeePreferenceSchema
);

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("Admin", adminSchema, "adminLogin");

// API endpoint to handle registration
app.post("/api/register", async (req, res) => {
  const { email, number, password, firstName, lastName } = req.body;

  try {
    // Check if the employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { number }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee with this email or phone number already exists",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the employee
    const newEmployee = new Employee({
      firstName,
      lastName,
      number,
      email,
      password: hashedPassword,
    });

    const savedEmployee = await newEmployee.save();

    // Save employee preferences with the correct employeeId
    const newEmployeePreference = new EmployeePreference({
      employeeId: savedEmployee._id, // Correct employeeId
      availability: {
        monday: { available: null, start: "", end: "" },
        tuesday: { available: null, start: "", end: "" },
        wednesday: { available: null, start: "", end: "" },
        thursday: { available: null, start: "", end: "" },
        friday: { available: null, start: "", end: "" },
        saturday: { available: null, start: "", end: "" },
        sunday: { available: null, start: "", end: "" },
      },
    });

    const savedPreference = await newEmployeePreference.save();

    res.status(200).json({
      message: "Employee registered successfully and preferences saved.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering employee: " + error.message });
  }
});

// API endpoint to handle updating availability
app.post("/api/update-availability", async (req, res) => {
  const { email, availability } = req.body;

  try {
    // Validate the incoming data
    if (!email || !availability) {
      return res.status(400).json({
        message: "Invalid data. Please provide email and availability.",
      });
    }

    // Find the employee by email
    let employee = await Employee.findOne({ email });

    if (!employee) {
      return res
        .status(400)
        .json({ message: "No employee found with this email." });
    }

    // Find the employee's preferences by employee ID
    const employeePreference = await EmployeePreference.findOne({
      employeeId: employee._id,
    });

    if (!employeePreference) {
      return res
        .status(400)
        .json({ message: "No preferences found for this employee." });
    }

    // Get the current availability from the database
    const currentAvailability = employeePreference.availability;

    // Initialize a flag to track if any changes were made
    let changesDetected = false;

    // Loop through each day in the incoming availability and compare with current availability
    const updatedAvailability = {};
    for (const day in availability) {
      // Check if the day exists and has an availability object with "available", "start", and "end"
      if (availability[day] && availability[day].available) {
        // Extract the new start and end times from the request
        const newAvailable = availability[day].available;
        const newStart = availability[day].start;
        const newEnd = availability[day].end;

        // Extract the current availability for that day from the database
        const currentDayAvailability = currentAvailability[day] || {};

        // Extract the current available, start, and end times
        const currentAvailable = currentDayAvailability.available || false;
        const currentStart = currentDayAvailability.start || null;
        const currentEnd = currentDayAvailability.end || null;

        // Compare the new and current availability
        if (
          newAvailable !== currentAvailable ||
          newStart !== currentStart ||
          newEnd !== currentEnd
        ) {
          // If there's a change, update the availability for that day
          updatedAvailability[day] = {
            available: newAvailable,
            start: newStart,
            end: newEnd,
          };
          changesDetected = true;
        }
      }
    }

    // If no changes were detected, return a warning message
    if (!changesDetected) {
      return res.status(400).json({
        message:
          "No changes detected. You are trying to set the same availability as before.",
      });
    }

    // If changes were detected, merge the updates into the current availability
    employeePreference.availability = {
      ...currentAvailability,
      ...updatedAvailability,
    };

    // Save the updated availability to the database
    await employeePreference.save();

    // Respond with a success message
    res.status(200).json({ message: "Availability updated successfully!" });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login employee
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(400)
        .json({ message: "No employee found with this email." });
    }

    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password." });
    }
    console.log("logged in" + email);

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in: " + error.message });
  }
});

// API endpoint to handle admin login
app.post("/api/admin-login", async (req, res) => {
  const { mail, password } = req.body;
  console.log("entered server");
  console.log(mail);
  console.log(password);
  try {
    const admin = await Admin.findOne({ mail }); // Use 'mail' to match your collection field
    if (!admin) {
      return res
        .status(400)
        .json({ message: "No admin found with this email." });
    }

    if (password !== admin.password) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    res.status(200).json({ name: admin.name });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in admin: " + error.message });
  }
});

// API endpoint to fetch employee data for admin panel
app.get("/api/admin/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    const preferences = await EmployeePreference.find();

    const employeesWithPreferences = employees.map((employee) => {
      const preference = preferences.find(
        (p) => p.employeeId.toString() === employee._id.toString()
      );
      return {
        ...employee.toObject(),
        preferences: preference
          ? preference.availability
          : {
              monday: { available: null, start: "", end: "" },
              tuesday: { available: null, start: "", end: "" },
              wednesday: { available: null, start: "", end: "" },
              thursday: { available: null, start: "", end: "" },
              friday: { available: null, start: "", end: "" },
              saturday: { available: null, start: "", end: "" },
              sunday: { available: null, start: "", end: "" },
            },
      };
    });

    res.status(200).json(employeesWithPreferences);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employee data: " + error.message });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
