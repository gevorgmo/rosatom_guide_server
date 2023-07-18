var forever = require('forever');
var child = new (forever.Monitor)('app.js', {
  
  silent: false,
  options: []
});

child.start();
forever.startServer(child);