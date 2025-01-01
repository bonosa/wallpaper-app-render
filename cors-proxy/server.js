const express = require("express");
const axios = require("axios");
const app = express();

// Proxy endpoint
app.get("/proxy", async (req, res) => {
    const apiUrl = "https://commons.wikimedia.org/w/api.php";
    const query = req.query; // Pass the query parameters from your app

    try {
        const response = await axios.get(apiUrl, { params: query });
        res.set("Access-Control-Allow-Origin", "*"); // Allow CORS
        res.json(response.data);
    } catch (error) {
        console.error("Proxy server error:", error);
        res.status(500).send("Error fetching data from Wikimedia API");
    }
});

// Start the server
app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});