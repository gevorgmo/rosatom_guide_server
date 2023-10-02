module.exports = {
  apps : [
	  {
		name   : "socket_server",
		script : "./socket_server.js",
		instances: "max",
		exec_mode: "cluster",
		autorestart: true
	  },
	  {
		name   : "app",
		script : "./app.js",
		autorestart: true
	  }
  ]
}
