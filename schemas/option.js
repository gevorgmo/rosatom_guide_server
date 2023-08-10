var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var OptionSchema = new Schema({
    language_code: {
        type: String,
        trim: true
    },
    language_title: {
        type: String,
        trim: true
    },
    ord: {
        type: Number,
        default: 0
    },
	views: {
        type: Number,
        default: 0
    },
	sessions_count: {
        type: Number,
        default: 0
    },
	sessions_time: {
        type: Number,
        default: 0
    },
	qr_count: {
        type: Number,
        default: 0
    },
	translations: {},
    created: {type: Date, default: Date.now}
});

mongoose.model('Option', OptionSchema);