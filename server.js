require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the root directory
app.use(express.static(path.join(__dirname)));

// Mount API routes
app.use('/api', apiRoutes);

// Fallback route for SPA (if we implement routing later)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} in your browser`);
});
