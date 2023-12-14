const mongoose = require("mongoose")

const TelegramSchema = new mongoose.Schema({
	name: { type: String },
	offer: { type: Number },
	img: { type: String },
	information: [
		{
			Members: { type: String },
			Likes: { type: String },
			Shares: { type: String },
			Comments: { type: String },
		}
	],
	userid: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "People"
	}]
})

const Telegram = new mongoose.model("Telegram", TelegramSchema)
module.exports = Telegram