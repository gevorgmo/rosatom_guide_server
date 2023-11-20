module.exports = {
  apps : [
	  {
		name   : "app",
		script : "./app.js",
		instances: 10,
		exec_mode: "cluster",	
		autorestart: true
	  }
  ]
}
