var fs = require('fs');
var initialized = false;
exports.init = function(config){
	//Preventing mulitple initialization
	if(initialized) return;
	initialized = true;

	//Init Database connection
	console.log("[INFO] Initializing database connection");
	var mongoose = require('mongoose');
	console.log("[INFO] Connected to MONGODB");

	mongoose.connect(config.db,{useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true }).then(() => console.log("Success")).catch(err => console.log(err));

	//Init model schemas
	console.log("[INFO] Initializing model schemas");
	var schemasPath = __dirname + '/schemas'
		, schemaFiles = fs.readdirSync(schemasPath);

	schemaFiles.forEach(function (file) {
		require(schemasPath+'/'+file);
		console.log("[INFO] Model schema initialized: %s", file);
	});
}
