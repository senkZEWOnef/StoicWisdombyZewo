const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.get('/daily', (req, res) => {
  res.json({
    quote: "Test quote: The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius"
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running at http://localhost:${PORT}`);
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});