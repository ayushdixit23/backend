const mongoose = require("mongoose")

const YoutubeSchema = new mongoose.Schema({
	name: { type: String },
	offer: { type: Number },
	img: { type: String },
	information: [
		{
			Subscribers: { type: String },
			Likes: { type: String },
			Shares: { type: String },
			Comments: { type: String },
		}
	],
	userid: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "People" // Referencing the People model
	}]
})

const Youtube = new mongoose.model("Youtube", YoutubeSchema)
module.exports = Youtube