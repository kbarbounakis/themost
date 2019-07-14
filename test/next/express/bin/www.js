let app = process.env.NODE_ENV === 'development' ? require('../server/app') : require('../dist/server/app');
let http = require('http');

// Get port from environment
let port = normalizePort(process.env.PORT || '3000');
// Get bind address.
let host = process.env.IP || '127.0.0.1';

// Create HTTP server.
// noinspection JSUnresolvedFunction
let server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port, host);
server.on('error', onError);
server.on('listening', onListening);

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  let bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  let addr = server.address();
  // eslint-disable-next-line no-console
  console.log( new Date().toUTCString(), '[INFO]', 'Listening on ' + addr.address + ':' + addr.port);
}
