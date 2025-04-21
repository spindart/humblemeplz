// Azure App Service startup script
const { exec } = require('child_process');

// Get the port from environment variable or default to 8080
const port = process.env.PORT || 8080;

// Start the Next.js application
console.log(`Starting Next.js application on port ${port}`);
exec(`npm start`, { env: { ...process.env, PORT: port } }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting application: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Application stderr: ${stderr}`);
  }
  console.log(`Application stdout: ${stdout}`);
});