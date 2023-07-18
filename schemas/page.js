var mongoose = require('mongoose')
    , Schema = mongoose.Schema
	, ObjectId = Schema.Types.ObjectId;

var PageSchema = new Schema({
    active: {
        type: Boolean,
        default: true
    },
	title: {
        type: String,
        trim: true
    },
	slug: {
        type: String,
        trim: true
    },
	category: {
        type: String,
        trim: true
    },
	content:{},
	audio:{},
	video:{},
	text:{},
	created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
});

mongoose.model('Page', PageSchema);