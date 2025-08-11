const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Leave Management System...\n');

// Start the database server
console.log('📊 Starting database server on port 5001...');
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

// Wait a moment for server to start
setTimeout(() => {
  console.log('🌐 Starting React client...');
  
  // Set environment variable to use port 5001 for API calls
  const client = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    env: {
      ...process.env,
      REACT_APP_API_URL: 'http://localhost:5001',
      PORT: '3002'
    }
  });

  client.on('error', (err) => {
    console.error('Failed to start client:', err);
  });

}, 3000);

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit();
});
