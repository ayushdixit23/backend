const express = require("express")
const mongoose = require("mongoose")
const People = require("./models/User")
const cors = require("cors")
const app = express()
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Instagram = require("./models/Instagram")
const Facebook = require("./models/Facebook")
const Youtube = require("./models/Youtube")
const Telegram = require("./models/Telegram")
const morgan = require("morgan")


const PORT = process.env.PORT || 5000

// ANSI escape codes for colors
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const red = '\x1b[31m';
const gray = '\x1b[90m';
const reset = '\x1b[0m';

const customFormat = (tokens, req, res) => {
	return [
		tokens.method(req, res) === 'GET' ? green : yellow,
		tokens.method(req, res),
		blue,
		tokens.url(req, res),
		statusColor(tokens.status(req, res)),
		gray,
		tokens['response-time'](req, res) + ' ms',
		reset,
	].join(' ');
};

// Function to determine status color
const statusColor = (status) => {
	if (status >= 500) {
		return red + status + reset;
	} else if (status >= 400) {
		return yellow + status + reset;
	} else {
		return green + status + reset;
	}
};

app.use(morgan(customFormat));

const connectDB = async () => {
	try {
		// mongoose.set("strictQuery", false);
		mongoose.connect(process.env.DATABASE).then(() => {
			console.log("DB is connected");
		});
	} catch (err) {
		console.log(err);
	}
};
connectDB();

app.use(cors())
app.use(express.json())

function generateAccessToken(data) {
	const access_token = jwt.sign(data, process.env.MY_SECRET_KEY, { expiresIn: "1h" })
	return access_token
}
function generateRefreshToken(data) {
	const refresh_token = jwt.sign(data, process.env.MY_SECRET_KEY, { expiresIn: "10d" })
	return refresh_token
}

// MiddleWare For Checking User is Authenticated or Not
const authenticateUser = async (req, res, next) => {
	try {
		const authorizationHeader = req.headers["authorization"];
		const token = authorizationHeader && authorizationHeader.split(" ")[1];
		if (!token) {
			return res.json({ success: false, message: "Unauthorized: Access token not provided" });
		}
		const decodedToken = jwt.verify(token, process.env.MY_SECRET_KEY);
		const user = await People.findById(decodedToken.id)
		if (!user) {
			return res.json({ success: false, message: "Unauthorized: User not found" });
		}
		req.user = { id: user._id, email: user.email };
		next();
	} catch (err) {
		return res.json({ success: false, message: "Unauthorized: Invalid access token" });
	}
};

const instagramMetrics = [
	{
		Followers: "Followers",
		Likes: "Likes",
		Views: "Views",
		Comments: "Comments",
	},
];

const facebookMetrics = [
	{
		Followers: "Followers",
		Likes: "Likes",
		Views: "Views",
		Comments: "Comments",
	},
];

const youtubeMetrics = [
	{
		Subscribers: "Subscribers",
		Likes: "Likes",
		Views: "Views",
		Comments: "Comments",
	},
];

const telegramMetrics = [
	{
		Members: "Members",
		Reactions: "Reactions",
		Views: "Views",
		Comments: "Comments",
	},
];

const createAndSaveSocialMediaModel = async (Model, name, offer, metrics) => {
	try {
		const existingModel = await Model.findOne({ name });

		if (!existingModel) {
			const modelInstance = new Model({
				name,
				offer,
				information: metrics,
			});

			await modelInstance.save();
			console.log(`${name} Model saved successfully!`);
		} else {
			console.log(`${name} Model already exists!`)
		}
	} catch (error) {
		console.error(`Error saving ${name} Model:`, error);
	}
};
// Create and save social media models
createAndSaveSocialMediaModel(Instagram, "Instagram", 10, instagramMetrics);
createAndSaveSocialMediaModel(Facebook, "Facebook", 20, facebookMetrics);
createAndSaveSocialMediaModel(Youtube, "Youtube", 15, youtubeMetrics);
createAndSaveSocialMediaModel(Telegram, "Telegram", 25, telegramMetrics);

const save = async (fetchid, socialMedia) => {
	const ourID = fetchid;
	try {
		const PeopleExist = await People.findById(ourID);

		if (PeopleExist) {
			let socialMediaModel;

			switch (socialMedia) {
				case "instagram":
					socialMediaModel = Instagram;
					break;
				case "facebook":
					socialMediaModel = Facebook;
					break;
				case "youtube":
					socialMediaModel = Youtube;
					break;
				case "telegram":
					socialMediaModel = Telegram;
					break;
				default:
					// Handle other social media types or do nothing
					break;
			}

			if (socialMediaModel) {
				const socialMediaExists = await socialMediaModel.findOne({
					name: socialMedia,
				});

				if (!socialMediaExists) {
					const newSocialMedia = new socialMediaModel({
						name: socialMedia,
						offer: getOfferValueForSocialMedia(socialMedia),
						information: getInformationForSocialMedia(socialMedia),
						userid: PeopleExist._id,
					});
					await newSocialMedia.save();
				} else {
					await socialMediaModel.updateOne(
						{ name: socialMedia },
						{ $push: { userid: ourID } }
					);
				}
			}
		}
	} catch (err) {
		console.log(err);
	}
};

const getOfferValueForSocialMedia = (socialMedia) => {
	switch (socialMedia.toLowerCase()) {
		case "instagram":
			return 10;
		case "facebook":
			return 20;
		case "youtube":
			return 15;
		case "telegram":
			return 20;
		default:
			return 0;
	}
};

const getInformationForSocialMedia = (socialMedia) => {
	switch (socialMedia.toLowerCase()) {
		case "instagram":
		case "facebook":
			return [
				{
					Followers: "Followers",
					Likes: "Likes",
					Views: "Views",
					Comments: "Comments",
				},
			];

		case "youtube":
			return [
				{
					Subscribers: "Subscribers",
					Likes: "Likes",
					Views: "Views",
					Comments: "Comments",
				},
			];
		case "telegram":
			return [
				{
					Members: "Members",
					Reactions: "Reactions",
					Views: "Views",
					Comments: "Comments",
				},
			];
		default:
			return [];
	}
};

app.get("/social", async (req, res) => {
	try {
		const instagram = await Instagram.findOne({ name: "Instagram" })
		const facebook = await Facebook.findOne({ name: "Facebook" })
		const youtube = await Youtube.findOne({ name: "Youtube" })
		const telegram = await Telegram.findOne({ name: "Telegram" })

		const data = [{
			insta: instagram,
			face: facebook,
			you: youtube,
			tele: telegram,
		}]
		res.status(200).json(data)
	} catch (e) {
		console.log(e)
	}
})

app.post("/users/signup", async (req, res) => {
	try {
		const { email, password } = req.body;
		const userExists = await People.findOne({ email: email });

		if (userExists) {
			return res.status(409).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new People({
			email,
			pass: hashedPassword,
		});

		await newUser.save();

		// save(user._id);
		return res.status(201).json({ success: true, message: "User created successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "An error occurred while processing your request" });
	}
});

app.post("/users/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await People.findOne({ email: email });
		const passwordMatch = await bcrypt.compare(password, user.pass);
		if (!user) {
			return res.status(400).json({ message: "User not Found", success: false })
		}
		if (!passwordMatch) {
			return res.status(400).json({ message: "Incorrect Password", success: false });
		}
		const data = { id: user._id, email: user.email }
		const access_token = generateAccessToken(data)
		const refresh_token = generateRefreshToken(data)
		res.status(200).json({ access_token, refresh_token, userid: user._id, success: true })
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while processing your request' });
	}
});

app.post("/socialmedia", async (req, res) => {

	console.log("first")
	try {
		const { userid, pid, link, count, category, socialMedia, price } = req.body

		console.log(req.body)

		await People.findOneAndUpdate({ _id: userid }, {
			$push: {
				order: {
					SocialMedia: socialMedia,
					category: category,
					link: link,
					Count: count,
					price: price,
					pid: pid
				}
			}
		},
			{ new: true, upsert: true })
		save(userid, socialMedia)
		res.status(200).json({ success: true, message: "Done" })
	} catch (err) {
		console.log(err)
		res.status(400).json({ message: err, success: false })
	}
})

app.get("/dashboard/:id", async (req, res) => {
	try {
		const { id } = req.params
		const user = await People.findById(id)
		console.log(user)
		if (user) {
			res.status(200).json({ users: user.order, success: true })
		} else {
			res.status(404).json("Error User Not Found")
		}
	} catch (err) {
		console.log(err)
	}
})

app.post("/contact/:id", async (req, res) => {
	try {
		const { id } = req.params

		const data = req.body

		const user = await People.findById(id)
		if (user) {
			const updatedUser = await People.findOneAndUpdate({ _id: user._id }, { $push: { contact: { name: data.name, message: data.message, email: data.email } } }, { new: true, upsert: true })
			res.status(200).json({ users: updatedUser, success: true })
			console.log(updatedUser)
		} else {
			res.status(200).json({ success: false })
		}
	} catch (err) {
		console.log(err)
	}
})

app.post("/refresh", async (req, res) => {
	console.log("first")
	try {
		const { refresh_token } = req.body;

		if (!refresh_token) {
			return res.json({ success: false, message: "Refresh token not provided" });
		}
		jwt.verify(refresh_token, process.env.MY_SECRET_KEY, async (err, payload) => {
			try {
				if (err) {
					return res.json({ success: false, message: "Invalid refresh token" });
				}
				const user = await People.findById(payload.id)
				if (!user) {
					return res.json({ success: false, message: "User not found" });
				}
				const data = { id: user._id, email: user.email }
				const access_token = generateAccessToken(data)
				console.log("runned")
				res.json({ success: true, access_token });
			} catch (err) {
				console.log(err)
			}
		})

	} catch (err) {
		console.log(err);
		res.json({ success: false, message: "Internal server error" });
	}
});

app.listen(PORT, () => {
	console.log(`Connected on ${PORT}`)
})