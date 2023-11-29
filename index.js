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

const PORT = process.env.PORT || 5000

mongoose.connect("mongodb://127.0.0.1:27017/People").then((res) => console.log("connected to mongodb")).catch((err) => {
	console.log(err)
})

app.use(cors())
app.use(express.json())

function generateAccessToken(data) {
	const access_token = jwt.sign(data, process.env.MY_SECRET_KEY, { expiresIn: "45m" })
	return access_token
}
function generateRefreshToken(data) {
	const refresh_token = jwt.sign(data, process.env.MY_SECRET_KEY, { expiresIn: "7d" })
	return refresh_token
}

// MiddleWare For Checking User is Authenticated or Not
const authenticateUser = async (req, res, next) => {
	try {
		const authorizationHeader = req.headers["authorization"];
		const token = authorizationHeader && authorizationHeader.split(" ")[1];
		if (!token) {
			return res.status(404).json({ success: false, message: "Unauthorized: Access token not provided" });
		}
		const decodedToken = jwt.verify(token, process.env.MY_SECRET_KEY);
		const user = await People.findById(decodedToken.id)
		if (!user) {
			return res.status(500).json({ success: false, message: "Unauthorized: User not found" });
		}
		req.user = { id: user._id, email: user.email, role: "admin" };
		next();
	} catch (err) {
		console.error("Authentication error:", err);
		return res.status(401).json({ success: false, message: "Unauthorized: Invalid access token" });
	}
};


const save = async (fetchid) => {
	const ourID = fetchid.toString()
	console.log(ourID)
	try {
		const PeopleExist = await People.findById(ourID);

		if (PeopleExist) {

			const instagramexist = await Instagram.findOne({ name: "Instagram" })
			if (instagramexist) {
				await Instagram.updateOne({ _id: "6542653cdfbf126e32d59aa0" }, { $push: { uniqueid: ourID } })
			} else {
				const newInstagram = new Instagram({
					name: "Instagram",
					offer: 100,
					information: [
						{
							Followers: "Followers",
							Likes: "Likes",
							Shares: "Shares",
							Comments: "Comments",
						}
					],
					uniqueid: PeopleExist._id
				})
				await newInstagram.save()
			}

			const FacebookExists = await Facebook.findOne({ name: "Facebook" });
			if (!FacebookExists) {
				const newFacebook = new Facebook({
					name: "Facebook",
					offer: 40,
					information: [
						{
							Followers: "Followers",
							Likes: "Likes",
							Shares: "Shares",
							Comments: "Comments",
						}
					],
					uniqueid: PeopleExist._id
				})
				await newFacebook.save()
			} else {
				await Facebook.updateOne({ _id: "65417c0ee641b1c3fcd403e8" }, { $push: { uniqueid: ourID } })
			}
			const YoutubeExists = await Youtube.findOne({ name: "Youtube" });
			if (!YoutubeExists) {
				const newYoutube = new Youtube({
					name: "Youtube",
					offer: 50,
					information: [
						{
							Subscribers: "Subscribers",
							Likes: "Likes",
							Shares: "Shares",
							Comments: "Comments",
						}
					],
					uniqueid: PeopleExist._id
				})
				await newYoutube.save()
			} else {
				await Youtube.updateOne({ _id: "6541687ed2a65e442bd7d179" }, { $push: { uniqueid: ourID } })
			}

			const TelegramExists = await Telegram.findOne({ name: "Telegram" });
			if (!TelegramExists) {
				const newTelegram = new Telegram({
					name: "Telegram",
					offer: 70,
					information: [
						{
							Subscribers: "Subscribers",
							Likes: "Likes",
							Shares: "Shares",
							Comments: "Comments",
						}
					],
					uniqueid: PeopleExist._id
				})
				await newTelegram.save()
			} else {
				await Telegram.updateOne({ _id: "65417c0ee641b1c3fcd403ef" }, { $push: { uniqueid: ourID } })
			}
		}
	} catch (err) {
		console.log(err)
	}
}

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

		const user = await newUser.save();

		save(user._id);
		return res.status(201).json({ success: true, message: "User created successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "An error occurred while processing your request" });
	}
});

app.post("/users/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log(req.body)
		const user = await People.findOne({ email: email });
		const passwordMatch = await bcrypt.compare(password, user.pass);
		if (!user) {
			res.json({ message: "User not Found", success: false })
		}
		if (!passwordMatch) {
			return res.json({ message: "Incorrect Password", success: false });
		}
		const data = { id: user._id, email: user.email, role: "admin" }
		const access_token = generateAccessToken(data)
		const refresh_token = generateRefreshToken(data)
		res.json({ access_token, refresh_token, user, success: true })
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'An error occurred while processing your request' });
	}
});

app.post("/socialmedia", async (req, res) => {
	try {
		const data = req.body
		console.log(data)

		await People.findOneAndUpdate({ _id: data.id }, {
			$push: {
				order: {
					SocialMedia: data.SocialMedia,
					category: data.category,
					link: data.link,
					Count: data.Count,
					price: data.price
				}
			}
		},
			{ new: true, upsert: true })

		res.status(200).json({ success: true })
	} catch (err) {
		console.log(err)
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
				const data = { id: user._id, email: user.email, role: "admin" }
				const access_token = generateAccessToken(data)
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