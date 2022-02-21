// Step 3 - this is the code for ./models.js

var mongoose = require('mongoose');

var categorySchema=new mongoose.Schema({
	name:{
		type:String,
		required:true
	}
})

var postsSchema = new mongoose.Schema({
	postTitle: {
        type:String,
        required:true,
        unique:true
    },
	postContent:{
		type:String,
		required:true
	},
	img:
	{
		data: Buffer,
		contentType: String
	},
	postCategory:{
		required:true,
		type: categorySchema
	},
	isFeatured:{
		type:Number,
		min:0,
		max:1
	}
},
	{ timestamps:true }
);

var booksSchema=new mongoose.Schema({
	bookTitle:{
		type:String,
		required:true
	},
	bookSummary:{
		type:String,
		required:true
	},
	img:
	{
		data: Buffer,
		contentType: String
	}
})

var eventsSchema=new mongoose.Schema({
	eventName:{
		type:String,
		required:true
	},
	eventSummary:{
		type:String,
		required:true
	},
	img:
	{
		data: Buffer,
		contentType: String
	}
})



const Post=new mongoose.model('Post', postsSchema);
const Book=new mongoose.model('Book', booksSchema);
const Category=new mongoose.model('Category',categorySchema);
const Event=new mongoose.model('Event',eventsSchema);

module.exports = {
	Post:Post,
	Category:Category,
	Book:Book,
	Event:Event
}
