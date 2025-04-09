// server.js (Corrected - Paste this exact code)
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
console.log(`Serving static files from: ${__dirname}`);
app.use(express.static(__dirname));
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log(`Serving index.html for non-file request: ${req.path}`);
    res.sendFile(indexPath, (err) => {
         if (err) {
             console.error("Error sending index.html:", err);
             if (!res.headersSent) { res.status(500).send("Internal server error sending index.html"); }
         }
    });
});
app.listen(PORT, () => {
    console.log(`---------------------------------------`);
    console.log(` Soul Leveling 'The System' Server`);
    console.log(`             Version: v1.1.1`); // Hardcoded version
    console.log(` Server listening on http://localhost:${PORT}`);
    console.log(`---------------------------------------`);
    console.log("Press Ctrl+C to stop the server.");
});
process.on('SIGINT', () => { console.log('\nServer shutting down...'); process.exit(); });