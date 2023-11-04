const express = require("express")
const mongoose = require("mongoose")
const People = require("./models/User")
const cors = require("cors")
const app = express()
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
		const { email, password, cpassword } = req.body;
		const userExists = await People.findOne({ email: email });

		if (userExists) {
			return res.status(409).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const hashedCPassword = await bcrypt.hash(cpassword, 10);

		const newUser = new People({
			email,
			pass: hashedPassword,
			cpass: hashedCPassword
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

		if (!user) {
			return res.status(401).json({ message: 'User not found' });
		}
		const passwordMatch = await bcrypt.compare(password, user.pass);

		if (passwordMatch) {
			return res.status(200).json({ success: true, user: user._id, message: 'Login successful' });
		} else {
			return res.status(401).json({ message: 'Incorrect password' });
		}
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

app.listen(PORT, () => {
	console.log(`Connected on ${PORT}`)
})