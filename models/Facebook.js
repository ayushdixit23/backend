const mongoose = require("mongoose")

const FacebookSchema = new mongoose.Schema({
	name: { type: String },
	offer: { type: Number },
	img: { type: String },
	information: [
		{
			Followers: { type: String },
			Likes: { type: String },
			Shares: { type: String },
			Comments: { type: String },
		}
	],
	uniqueid: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "People" // Referencing the People model
	}]
})

const Facebook = new mongoose.model("Facebook", FacebookSchema)
module.exports = Facebook