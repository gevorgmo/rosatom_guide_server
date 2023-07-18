var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var MediaSchema = new Schema({
    filename: {
        type: String,
        trim: true
    },
	type: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    created: {type: Date, default: Date.now}
});

mongoose.model('Media', MediaSchema);