var client; 
function initRedis(config, redis) {
    client = redis.createClient(config.redis.port, config.redis.host);
    client.auth(config.redis.pass);
    client.on('error', function(err) {
        console.log('Redis error: ' + err);
    });
	return client;
	//client.flushall( function (didSucceed) {
     //   console.log('Redis empty'); 
   //});
}

exports.init = initRedis;
exports.client = function() { return client };
