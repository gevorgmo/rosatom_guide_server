var mongoose = require('mongoose')
    , Schema = mongoose.Schema
	, ObjectId = Schema.Types.ObjectId;

var PageSchema = new Schema({
    active: {
        type: Boolean,
        default: true
    },
	slug: {
        type: String,
        trim: true
    },
	category: {
        type: String,
        trim: true
    },
	poster: {
        type: String,
        trim: true
    },
	ord: {
        type: Number,
        default: 0
    },
	media_type: {
        type: Number,
        default: 0
    },
	title:{},
	content:{},
	audio:{},
	video:{},
	text:{},
	published: {type: Date, default: Date.now},
	created: {type: Date, default: Date.now}
});

mongoose.model('Page', PageSchema);