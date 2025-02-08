const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const CLOUD_NAME = "ddpzupkmg";
const API_KEY = 476136941672239;
const API_SECRET = "AupJSXB-kxSgkynRgQzy_uhD3WI";
app.use(cors()); // Allow frontend to call backend

const PORT = 5000;

// Route to Fetch Images from Cloudinary
app.get("/api/get-images", async (req, res) => {
  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`;
    const auth = { auth: { username: API_KEY, password: API_SECRET } };

    const response = await axios.get(url, auth);
    res.json(response.data.resources); // Send image list to frontend
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
