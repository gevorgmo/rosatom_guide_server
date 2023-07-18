var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , LocalStrategy = require('passport-local').Strategy
    , passport  = require('passport');

exports.boot = function (passport, config) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            if (err) return done(err, null);
            return done(null, user);
        });
    });

    // Local strategy
    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!user.authenticate(password)) {
                    return done(null, false);
                }
				var _qury={"lastlogin":Date.now()};								
				User.update({_id:user._id}, { $set: _qury}, function(err2) { 
					return done(null, user);
				});	
            });
        }
    ));

}