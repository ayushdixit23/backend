const mongoose = require("mongoose")

const TelegramSchema = new mongoose.Schema({
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
	uniqueid: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "People"
	}]
})

const Telegram = new mongoose.model("Telegram", TelegramSchema)
module.exports = Telegram