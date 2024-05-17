const express = require("express");
const path = require("path");
const fs = require("fs");
const { format } = require("date-fns");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));

// Display Home page
app.get("/", (req, res) => {
  res.status(200).send(`
    <h1 style="background-color:#66ccff;padding:10px 0;text-align:center">Express Server is Connected!</h1>
    <div style="text-align:center">
      <p><span style="background-color:#99ff99;font-size:22px">1. To Create a Room</span> --> <a href="/create-room">Click Here</a></p>
      <p><span style="background-color:#ffcc00;font-size:22px">2. To Book a Room</span> --> <a href="/book-room">Click Here</a></p>
      <p><span style="background-color:#99ccff;font-size:22px">3. To List All Rooms with Booked Data</span> --> <a href="/list-rooms">Click Here</a></p>
      <p><span style="background-color:#ff6666;font-size:22px">4. To List All Customers with Booked Data</span> --> <a href="/list-customers">Click Here</a></p>
      <p><span style="background-color:#ff9999;font-size:22px">5. To List Customer Booking History</span> --> <a href="/customer-bookings">Click Here</a></p>
    </div>
  `);
});

const ROOMS_FILE_PATH = path.join(__dirname, "rooms.json");
const BOOKINGS_FILE_PATH = path.join(__dirname, "bookings.json");

//Load rooms from file on server startup
let rooms = [];
if (fs.existsSync(ROOMS_FILE_PATH)) {
  const data = fs.readFileSync(ROOMS_FILE_PATH, "utf8");
  rooms = JSON.parse(data);
}
app.use(express.json());

// 1. Create a room - Render Form
app.get("/create-room", (req, res) => {
  res.status(200).send(`
      <h2 style="margin-bottom: 20px; text-align: center;">Create a Room</h2>
      <div style="max-width: 400px; margin: 0 auto;">
        <form action="/create-room" method="post" style="padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
          <div style="margin-bottom: 10px;">
            <label for="roomName">Room Name:</label><br>
            <input type="text" id="roomName" name="roomName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="seatsAvailable">Number of Seats Available:</label><br>
            <input type="number" id="seatsAvailable" name="seatsAvailable" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="amenities">Amenities (Comma-separated):</label><br>
            <input type="text" id="amenities" name="amenities" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="pricePerHour">Price Per Hour:</label><br>
            <input type="number" id="pricePerHour" name="pricePerHour" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="text-align: center;">
            <button type="submit" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Create Room</button>
          </div>
        </form>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="/" style="color: #333;">Back to Home</a>
      </div>
    `);
});

// Route to handle POST request to create a room
app.post("/create-room", (req, res) => {
  // Parse form data
  const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;

  // Create a new room object
  const newRoom = {
    roomId: rooms.length + 1, // Assign a unique ID
    roomName,
    seatsAvailable: parseInt(seatsAvailable),
    amenities: amenities.split(",").map((item) => item.trim()),
    pricePerHour: parseInt(pricePerHour),
    bookedStatus: false, // Set bookedStatus to false initially
  };

  // Add the new room to the array
  rooms.push(newRoom);

  // Write updated rooms data to the file
  fs.writeFileSync(ROOMS_FILE_PATH, JSON.stringify(rooms, null, 2));

  // Send a success message to the user
  res.status(200).send(`
      <h2 style="text-align: center;">Room Created Successfully!</h2>
      <div style="text-align: center;">
        <a href="/" style="color: #333;">Back to Home</a>
      </div>
    `);
});










// 2. Render form to book a room
app.get("/book-room", (req, res) => {
  // Generate options for room names dynamically
  const roomOptions = rooms
    .map((room) => `<option value="${room.roomName}">${room.roomName}</option>`)
    .join("");

  res.status(200).send(`
      <h2 style="margin-bottom: 20px; text-align: center;">Book a Room</h2>
      <div style="max-width: 400px; margin: 0 auto;">
        <form action="/book-room" method="post" style="padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
          <div style="margin-bottom: 10px;">
            <label for="customerName">Customer Name:</label><br>
            <input type="text" id="customerName" name="customerName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="date">Date:</label><br>
            <input type="date" id="date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="startTime">Start Time:</label><br>
            <input type="time" id="startTime" name="startTime" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="endTime">End Time:</label><br>
            <input type="time" id="endTime" name="endTime" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
          </div>
          <div style="margin-bottom: 10px;">
            <label for="roomName">Room Name:</label><br>
            <select id="roomName" name="roomName" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
              <option value="" disabled selected>Select Room</option>
              ${roomOptions}
            </select>
          </div>
          <div style="text-align: center;">
            <button type="submit" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Book Room</button>
          </div>
        </form>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="/" style="color: #333;">Back to Home</a>
      </div>
    `);
});

// Generate a unique booking ID
function generateBookingId() {
  return uuidv4();
}
// Function to get room ID and booking status
function getRoomInfo(roomName) {
  const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE_PATH, "utf8"));
  const room = rooms.find((room) => room.roomName === roomName);
  if (!room) {
    throw new Error("Room not found");
  }
  return {
    roomId: room.roomId,
  };
}

// Function to count total bookings of a customer
function countCustomerBookings(customerName) {
  if (!fs.existsSync(BOOKINGS_FILE_PATH)) return 0;
  const bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE_PATH, "utf8"));
  const customerBookings = bookings.find(
    (booking) => booking.customerName === customerName
  );
  return customerBookings ? customerBookings.bookings.length : 0;
}

// Function to check if a room is available
function isRoomAvailable(roomId, date, startTime, endTime) {
  if (!fs.existsSync(BOOKINGS_FILE_PATH)) return { available: true };
  const bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE_PATH, "utf8"));
  for (const booking of bookings) {
    for (const b of booking.bookings) {
      if (
        b.roomId === roomId &&
        b.date === date &&
        ((b.startTime <= startTime && b.endTime > startTime) ||
          (b.startTime < endTime && b.endTime >= endTime) ||
          (b.startTime >= startTime && b.endTime <= endTime))
      ) {
        return {
          available: false,
          conflictingBooking: b,
        };
      }
    }
  }
  return { available: true };
}

// Function to update bookings file
function updateBookings(bookingData) {
  let bookings = [];
  if (fs.existsSync(BOOKINGS_FILE_PATH)) {
    bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE_PATH, "utf8"));
  }
  const customerIndex = bookings.findIndex(
    (booking) => booking.customerName === bookingData.customerName
  );
  if (customerIndex !== -1) {
    bookings[customerIndex].bookingCount++;
    bookings[customerIndex].bookings.push(bookingData);
  } else {
    bookings.push({
      customerName: bookingData.customerName,
      bookingCount: 1,
      bookings: [bookingData],
    });
  }
  fs.writeFileSync(BOOKINGS_FILE_PATH, JSON.stringify(bookings, null, 2));
}

// Get input and process booking
app.post("/book-room", (req, res) => {
  const { customerName, roomName, date, startTime, endTime } = req.body;

  try {
    // Generate booking ID
    const bookingId = generateBookingId();

    // Get room ID
    const { roomId } = getRoomInfo(roomName);

    // Format booking date
    const formattedDate = format(new Date(date), "dd-MM-yyyy");
    const bookingDate = format(new Date(), "dd-MM-yyyy HH:mm:ss");

    // Check if the room is available
    const availability = isRoomAvailable(
      roomId,
      formattedDate,
      startTime,
      endTime
    );
    if (!availability.available) {
      const { conflictingBooking } = availability;
      res.status(400).send(`
        <h2 style="text-align: center; color: #d9534f;">Room Booking Failed!</h2>
        <p style="text-align: center;">The room is already booked for the selected date and time.</p>
        <div style="margin: 20px auto; max-width: 300px; padding: 10px; background-color: #f2dede; border: 1px solid #ebccd1; border-radius: 5px;">
          <h3 style="color: #a94442; text-align: center;">Previously Booked Details</h3>
          <p style="color: #a94442; text-align: center;">Date: ${conflictingBooking.date}</p>
          <p style="color: #a94442; text-align: center;">Time: ${conflictingBooking.startTime} to ${conflictingBooking.endTime}</p>
        </div>
        <div style="text-align: center;">
          <a href="/book-room" style="color: #337ab7;">Try Again</a>
        </div>
      `);
      return;
    }

    // Count total bookings of customer
    const bookingCount = countCustomerBookings(customerName);

    // Store booking data
    const bookingData = {
      bookingId,
      customerName,
      roomId,
      roomName,
      date: formattedDate,
      startTime,
      endTime,
      bookingDate,
      bookedStatus: "Confirmed",
    };

    // Update bookings file
    updateBookings(bookingData);

    // Send a success message to the user
    res.status(200).send(`
      <h2 style="text-align: center; color: #5cb85c;">Room Booked Successfully!</h2>
      <p style="text-align: center;">Date: ${formattedDate}</p>
      <p style="text-align: center;">Time: ${startTime} to ${endTime}</p>
      <div style="text-align: center;">
        <a href="/" style="color: #337ab7;">Back to Home</a>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`
      <h2 style="text-align: center; color: #d9534f;">Error!</h2>
      <p style="text-align: center;">${error.message}</p>
      <div style="text-align: center;">
        <a href="/book-room" style="color: #337ab7;">Try Again</a>
      </div>
    `);
  }
});










// 3. List all rooms with booked data
app.get("/list-rooms", (req, res) => {
  // Read bookings data from the JSON file
  const bookingsData = require("./bookings.json");

  // Prepare the response array
  const roomsWithBookings = [];

  // Define an array of colors for styling
  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#9b59b6",
    "#f39c12",
    "#1abc9c",
    "#34495e",
    "#c0392b",
    "#2980b9",
    "#27ae60",
  ];

  // Loop through each room's bookings
  bookingsData.forEach((customer) => {
    customer.bookings.forEach((booking) => {
      const roomInfo = {
        roomName: booking.roomName,
        customerName: customer.customerName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookedStatus: booking.bookedStatus,
      };

      // Check if the room already exists in the list
      const existingRoom = roomsWithBookings.find(
        (room) => room.roomName === roomInfo.roomName
      );
      if (existingRoom) {
        existingRoom.bookings.push(roomInfo);
      } else {
        roomsWithBookings.push({
          roomName: roomInfo.roomName,
          bookings: [roomInfo],
        });
      }
    });
  });

  // Prepare HTML response
  let htmlResponse =
    "<h2 style='margin-bottom: 20px; text-align: center; color: #333;'>List of Rooms with Bookings</h2>";

  // Loop through each room with bookings
  roomsWithBookings.forEach((room, index) => {
    const color = colors[index % colors.length]; // Use a different color for each room

    htmlResponse += `<div style='margin-bottom: 30px; background-color: ${color}; padding: 15px; border-radius: 10px;'>`;
    htmlResponse += `<h3 style='margin-bottom: 10px; text-decoration: underline; color: #fff;'>Room Name: ${room.roomName}</h3>`;

    // Loop through each booking of the room
    room.bookings.forEach((booking) => {
      htmlResponse +=
        "<div style='border: 1px solid #fff; border-radius: 5px; padding: 15px; margin-bottom: 15px; background-color: rgba(255, 255, 255, 0.8);'>";
      htmlResponse += `<p><strong style='color: #333;'>Customer Name:</strong> ${booking.customerName}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>Date:</strong> ${booking.date}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>Start Time:</strong> ${booking.startTime}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>End Time:</strong> ${booking.endTime}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>Booked Status:</strong> ${booking.bookedStatus}</p>`;
      htmlResponse += "</div>";
    });

    htmlResponse += "</div>";
  });

  // Add link to go back to the home page
  htmlResponse += "<div style='text-align: center; margin-top: 20px;'>";
  htmlResponse +=
    "<a href='/' style='color: #fff; text-decoration: none; font-size: 20px; padding: 10px 20px; background-color: #3498db; border-radius: 5px;'>";
  htmlResponse += "Back to Home";
  htmlResponse += "</a>";
  htmlResponse += "</div>";

  // Send the HTML response
  res.send(htmlResponse);
});










// 4. List all customers with booked data
app.get("/list-customers", (req, res) => {
  // Read bookings data from the JSON file
  const bookingsData = require("./bookings.json");

  // Prepare the response array
  const customersWithBookings = [];

  // Define an array of colors for styling
  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#9b59b6",
    "#f39c12",
    "#1abc9c",
    "#34495e",
    "#c0392b",
    "#2980b9",
    "#27ae60",
  ];

  // Loop through each customer's bookings
  bookingsData.forEach((customer) => {
    const customerInfo = {
      customerName: customer.customerName,
      bookings: [],
    };

    // Loop through each booking of the customer
    customer.bookings.forEach((booking) => {
      customerInfo.bookings.push({
        roomName: booking.roomName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    });

    // Add the customer's booking information to the response array
    customersWithBookings.push(customerInfo);
  });

  // Prepare HTML response
  let htmlResponse =
    "<h2 style='margin-bottom: 20px; text-align: center; color: #333;'>List of Customers with Bookings</h2>";

  // Loop through each customer with bookings
  customersWithBookings.forEach((customer, index) => {
    const color = colors[index % colors.length]; // Use a different color for each customer

    htmlResponse += `<div style='margin-bottom: 30px; background-color: ${color}; padding: 15px; border-radius: 10px;'>`;
    htmlResponse += `<h3 style='margin-bottom: 10px; text-decoration: underline; color: #fff;'>Customer Name: ${customer.customerName}</h3>`;

    // Loop through each booking of the customer
    customer.bookings.forEach((booking) => {
      htmlResponse +=
        "<div style='border: 1px solid #fff; border-radius: 5px; padding: 15px; margin-bottom: 15px; background-color: rgba(255, 255, 255, 0.8);'>";
      htmlResponse += `<p><strong style='color: #333;'>Room Name:</strong> ${booking.roomName}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>Date:</strong> ${booking.date}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>Start Time:</strong> ${booking.startTime}</p>`;
      htmlResponse += `<p><strong style='color: #333;'>End Time:</strong> ${booking.endTime}</p>`;
      htmlResponse += "</div>";
    });

    htmlResponse += "</div>";
  });

  // Add link to go back to the home page
  htmlResponse += "<div style='text-align: center; margin-top: 20px;'>";
  htmlResponse +=
    "<a href='/' style='color: #fff; text-decoration: none; font-size: 20px; padding: 10px 20px; background-color: #3498db; border-radius: 5px;'>";
  htmlResponse += "Back to Home";
  htmlResponse += "</a>";
  htmlResponse += "</div>";

  // Send the HTML response
  res.send(htmlResponse);
});










// 5. List customer booking history
app.get("/customer-bookings", (req, res) => {
  // Read bookings data from the JSON file
  const bookingsData = require("./bookings.json");

  // Define an array of colors for styling
  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#9b59b6",
    "#f39c12",
    "#1abc9c",
    "#34495e",
    "#c0392b",
    "#2980b9",
    "#27ae60",
  ];

  // Prepare HTML response
  let htmlResponse =
    "<h2 style='margin-bottom: 20px; text-align: center; color: #333;'>Customer Booking History</h2>";

  // Loop through each customer's bookings
  bookingsData.forEach((customer, index) => {
    const color = colors[index % colors.length]; // Use a different color for each customer

    htmlResponse += `<div style='margin-bottom: 30px; background-color: ${color}; padding: 15px; border-radius: 10px;'>`;
    htmlResponse += `<h3 style='margin-bottom: 10px; text-decoration: underline; color: #fff;'>Customer Name: ${customer.customerName}</h3>`;
    htmlResponse += `<p style='margin-bottom: 10px; color: #fff;'>Booking Count: ${customer.bookingCount}</p>`;
    htmlResponse +=
      "<div style='border: 1px solid #fff; border-radius: 5px; padding: 10px; background-color: rgba(255, 255, 255, 0.8);'>";

    // Loop through each booking of the customer
    customer.bookings.forEach((booking, subIndex) => {
      const subColor = colors[subIndex % colors.length]; // Use a different color for each booking

      htmlResponse += `<div style='margin-bottom: 10px; padding: 10px; background-color: ${subColor}; border-radius: 5px; font-size: 17px;'>`;
      htmlResponse += `<p><strong style='color: #000'>Room Name:</strong> ${booking.roomName}</p>`;
      htmlResponse += `<p><strong style='color: #000'>Date:</strong> ${booking.date}</p>`;
      htmlResponse += `<p><strong style='color: #000'>Start Time:</strong> ${booking.startTime}</p>`;
      htmlResponse += `<p><strong style='color: #000'>End Time:</strong> ${booking.endTime}</p>`;
      htmlResponse += `<p><strong style='color: #000'>Booking ID:</strong> ${booking.bookingId}</p>`;
      htmlResponse += `<p><strong style='color: #000'>Booking Date:</strong> ${booking.bookingDate}</p>`;
      htmlResponse += `<p><strong style='color: #000'>Booking Status:</strong> ${booking.bookedStatus}</p>`;
      htmlResponse += "</div>";
    });

    htmlResponse += "</div>";
    htmlResponse += "</div>";
  });

  // Add link to go back to the home page
  htmlResponse += "<div style='text-align: center; margin-top: 20px;'>";
  htmlResponse +=
    "<a href='/' style='color: #fff; text-decoration: none; font-size: 20px; padding: 10px 20px; background-color: #3498db; border-radius: 5px;'>";
  htmlResponse += "Back to Home";
  htmlResponse += "</a>";
  htmlResponse += "</div>";

  // Send the HTML response
  res.send(htmlResponse);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});