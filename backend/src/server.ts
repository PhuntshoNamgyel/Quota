// src/server.ts
// Starts the HTTP server. Separated from app.ts so tests can import the app without binding a port.
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Quota API running on http://localhost:${PORT}`);
});