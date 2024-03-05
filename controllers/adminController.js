const User = require("../models/User");
const Admin = require("../models/Admin");
const Calendar = require("../models/Calendar");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Gallery = require("../models/Galley");
const jwtSecret = process.env.JWT_ADMIN_SECRET;
const fs = require("fs");
const Slogan = require("../models/Slogan");
const Ad = require("../models/Ad");
const Mandalam = require("../models/Mandalam");
const Event = require("../models/Event");
const Feedback = require("../models/FeedBack");
const Carousel = require("../models/Carousel");
const Poll = require("../models/Poll");
const District = require("../models/District");
const admin = require("firebase-admin");
const serviceAccount = require("../firebase/firebase");
const Notification = require("../models/Notification");
const NotificationList = require("../models/NotificationList");
const VideoGallery = require("../models/VideoGallery");

const cron = require('node-cron');
const moment  =  require('moment');
const Meme = require("../models/Meme");
const Reels = require("../models/Reels");
const cronExpression = '0 0 * * *';

const myCronJob = cron.schedule(cronExpression, async () => {
    // Send happy birthday message
 const currentDate = moment().format('YYYY-MM-DD');
const date = new Date(currentDate);

const users = await User.find({
  $expr: {
    $and: [
      { $eq: [{ $dayOfMonth: '$date_of_birth' }, date.getDate()] },
      { $eq: [{ $month: '$date_of_birth' }, date.getMonth() + 1] }, // Month is zero-based in JavaScript Date object
    ],
  },
});

    // Use Promise.all to wait for all asynchronous operations to complete
    await Promise.all(users.map(async (user) => {
        // Retrieve all tokens from the Notification model
        const allTokens = await Notification.find({ userId: user._id }).distinct('token');
        if (!allTokens) {
            throw new Error('No tokens found');
        }

        // Build the payload
        const payload = {
            registration_ids: allTokens,
            notification: {
                body: `Happy birthday ${user.name} 🥳! We hope all your birthday wishes and dreams come true.`,
                title: `${process.env.SITE_NAME} - Happy Birthday`,
                android_channel_id: `${process.env.SITE_NAME}`,
            },
        };
        console.log(JSON.stringify(payload));

        const result = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await result.json();

        // Check for errors in the HTTP response
        if (!result.ok) {
            throw new Error(`FCM request failed with status ${result.status}: ${data}`);
        }
    }));

    console.log('Cron job is running!');
});


// Start the cron job
myCronJob.start();

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const user = await Admin.findOne({ email });
        if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
        }
        const payload = {
        user: {
            id: user._id,
        },
        };
        jwt.sign(payload, jwtSecret, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
        });
    } catch (error) {
        console.error("Error logging in admin:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
//remove this after creating admin
const adminRegister = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const user = await Admin .findOne({ email });
        if (user) {
        return res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await Admin.create({
        email,
        password: hashedPassword,
        });
        const payload = {
        user: {
            id: newUser._id,
        },
        };
        jwt.sign(payload, jwtSecret, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
        });
    } catch (error) {
        console.error("Error registering admin:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const protected = async (req, res) => {
    try {
        if (req.user) {
          res.status(200).json({ message: "You are authorized" });
        } else {
          res.status(401).json({ message: "You are not authorized" });
        }
      } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
}
const getUser = async (req, res) => {
    const { id } = req.params.id;
    try {
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const skip = (page - 1) * perPage;

        const users = await User.find({})
            .skip(skip)
            .limit(Number(perPage));

        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting all users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({_id:req.params.id});
      
        res.status(200).json({ msg: "User removed" });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllOrders = async (req, res) => {
    try {
     const orders = await User.find({}).populate("orders");
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting all orders:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addGallery = async (req, res) => {
    try {
        const { name, description} = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        // if (!name || !description ) {
        // return res
        //     .status(400)
        //     .json({ error: "Please provide all required fields." });
        // }
        const newGallery = await Gallery.create({
        name,
        description,
        image: `${process.env.DOMAIN}/galleryImage/${imageObj.filename}`,
        });
        res.status(201).json(newGallery);
    } catch (error) {
        console.error("Error adding gallery:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteImage = async (req, res) => {
    try {
        const image = await Gallery.findOneAndDelete({_id:req.params.id});
        if (!image) {
        return res.status(404).json({ error: "Image not found" });
        }
        
        res.status(200).json({ msg: "Image removed" });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addMeme = async (req, res) => {
    try {
        const { name, description} = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        // if (!name || !description ) {
        // return res
        //     .status(400)
        //     .json({ error: "Please provide all required fields." });
        // }
        const newGallery = await Meme.create({
        name,
        description,
        image: `${process.env.DOMAIN}/memeImage/${imageObj.filename}`,
        });
        res.status(201).json(newGallery);
    } catch (error) {
        console.error("Error adding gallery:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteMeme = async (req, res) => {
    try {
        const image = await Meme.findOneAndDelete({_id:req.params.id});
        if (!image) {
        return res.status(404).json({ error: "Image not found" });
        }
        
        res.status(200).json({ msg: "Image removed" });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getMeme = async (req, res) => {
    try {
        const meme = await Meme.find({});
        res.status(200).json(meme);
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addReels = async (req, res) => {
    try {
        const { name, description} = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        // if (!name || !description ) {
        // return res
        //     .status(400)
        //     .json({ error: "Please provide all required fields." });
        // }
        const newGallery = await Reels.create({
        name,
        description,
        image: `${process.env.DOMAIN}/reelsImage/${imageObj.filename}`,
        link: req.body.link
        });
        res.status(201).json(newGallery);
    } catch (error) {
        console.error("Error adding gallery:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteReels = async (req, res) => {
    try {
        const image = await Reels.findOneAndDelete({_id:req.params.id});
        if (!image) {
        return res.status(404).json({ error: "Image not found" });
        }
        
        res.status(200).json({ msg: "Image removed" });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getReels = async (req, res) => {
    try {
        const reels = await Reels.find({});
        res.status(200).json(reels);
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addCalendarEvent = async (req, res) => {
    try {
        
        const { title, description,date  } = req.body;
          req.body.image = req.file;
        let imageObj = req.body.image;
        if (!date || !title || !description) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }

        const calendar = await Calendar.create({
        date,
        title,
        description,
        image: `${process.env.DOMAIN}/calendarImage/${imageObj.filename}` ||  "https://sadbhavan.com/webimg/chaticon.png",
        })
        res.status(201).json(calendar);

    } catch (error) {
        console.error("Error adding calendar event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getCalendarEvents = async (req, res) => {
    try {
        const {date} = req.params;
        const calendar = await Calendar.find({date:date});
        res.status(200).json(calendar);
    } catch (error) {
        console.error("Error getting calendar events:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteCalendarEvent = async (req, res) => {
    try {
        const calendar = await Calendar.findOneAndDelete({_id:req.params.id});
        if (!calendar) {
        return res.status(404).json({ error: "Calendar event not found" });
        }
        
        res.status(200).json({ msg: "Calendar event removed" });
    } catch (error) {
        console.error("Error deleting calendar event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addSlogan = async (req, res) => {
    try {
        const { slogan } = req.body;
        if (!slogan) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        req.body.image = req.file;
        let imageObj = req.body.image;
        const newSlogan = await Slogan.create({
        slogan,
        image: `${process.env.DOMAIN}/sloganImage/${imageObj.filename}`,
        });
        res.status(201).json(newSlogan);
    } catch (error) {
        console.error("Error adding slogan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getSlogan = async (req, res) => {
    try {
        const slogan = await Slogan.find({});
        res.status(200).json(slogan);
    } catch (error) {
        console.error("Error getting slogan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteSlogan = async (req, res) => {
    try {
        const slogan = await Slogan.findOneAndDelete({_id:req.params.id});
        if (!slogan) {
        return res.status(404).json({ error: "Slogan not found" });
        }
        
        res.status(200).json({ msg: "Slogan removed" });
    } catch (error) {
        console.error("Error deleting slogan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addAd = async (req, res) => {
    try {
        const { name, href} = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        // if (!name || !description ) {
        // return res
        //     .status(400)
        //     .json({ error: "Please provide all required fields." });
        // }
        const newAd = await Ad.create({
        name,
        href,
        image: `${process.env.DOMAIN}/ADImage/${imageObj.filename}`,
        });
        res.status(201).json(newAd);
    } catch (error) {
        console.error("Error adding ad:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getAd = async (req, res) => {
    try {
        const ad = await Ad.find({});
        res.status(200).json(ad);
    } catch (error) {
        console.error("Error getting ad:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteAd = async (req, res) => {
    try {
        const ad = await Ad.findOneAndDelete({_id:req.params.id});
        if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
        }
        
        res.status(200).json({ msg: "Ad removed" });
    } catch (error) {
        console.error("Error deleting ad:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const sendNotification = async (req, res) => {
    try {
        const { title, url } = req.body;
        const imageObj = req.file;

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ONESIGNAL_API_KEY}`,
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID,
                contents: {
                    en: title
                },
                big_picture: `${process.env.DOMAIN}/OneImage/${imageObj.filename}`,
                included_segments: ["All"],
                url: url
            }),
        });

        const data = await response.json();

        // Check if the request was successful
        if (response.ok) {
            res.status(200).json({ message: 'Notification sent successfully', data });
        } else {
            res.status(response.status).json({ error: data.errors[0].message });
        }
    } catch (error) {
        console.error("Error sending notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getMandalam = async (req, res) => {
    try {
        const mandalam = await Mandalam.find({});
        res.status(200).json(mandalam);
    } catch (error) {
        console.error("Error getting mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addMandalam = async (req, res) => {
    try {
        const { mandalam } = req.body;
        if (!mandalam) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const newMandalam = await Mandalam.create({
        mandalam,
        });
        res.status(201).json(newMandalam);
    } catch (error) {
        console.error("Error adding mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteMandalam = async (req, res) => {
    try {
        const mandalam = await Mandalam.findOneAndDelete({_id:req.params.id});
        if (!mandalam) {
        return res.status(404).json({ error: "Mandalam not found" });
        }
        
        res.status(200).json({ msg: "Mandalam removed" });
    } catch (error) {
        console.error("Error deleting mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addEvent = async (req, res) => {
    try {
        const { title, description,url } = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        // if (!name || !description ) {
        // return res
        //     .status(400)
        //     .json({ error: "Please provide all required fields." });
        // }
        const newEvent = await Event.create({
        title,
        description,
        image: `${process.env.DOMAIN}/eventImage/${imageObj.filename}`,
        url:url
        });
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error adding event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({_id:req.params.id});
        if (!event) {
        return res.status(404).json({ error: "Event not found" });
        }
        
        res.status(200).json({ msg: "Event removed" });
    } catch (error) {
        console.error("Error deleting event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getEvents = async (req, res) => {
    try {
        const event = await Event.find({});
        res.status(200).json(event);
    } catch (error) {
        console.error("Error getting event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getFeedBack = async (req, res) => {
    try {
        const feedback = await Feedback.find({});
        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error getting event:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addCarousel = async (req, res) => {
    try {
        const { name, href} = req.body;
        req.body.image = req.file;
        let imageObj = req.body.image;
        const newCarousel = await Carousel.create({
        name,
        href,
        image: `${process.env.DOMAIN}/carouselImage/${imageObj.filename}`,
        });
        res.status(200).json(newCarousel);

    } catch (error) {
        console.error("Error adding carousel:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteCarousel = async (req, res) => {
    try {
        const carousel = await Carousel.findOneAndDelete({_id:req.params.id});
        if (!carousel) {
        return res.status(404).json({ error: "Carousel not found" });
        }
        
        res.status(200).json({ msg: "Carousel removed" });
    } catch (error) {
        console.error("Error deleting carousel:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getCarousel = async (req, res) => {
    try {
        const carousel = await Carousel.find({});
        res.status(200).json(carousel);
    } catch (error) {
        console.error("Error getting carousel:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addPoll = async (req, res) => {
    try {
        const { title, options} = req.body;
        if (!title || !options ) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const newPoll = await Poll.create({
        title,
        options,
        });
        res.status(201).json(newPoll);
    } catch (error) {
        console.error("Error adding poll:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getPoll = async (req, res) => {
    try {
        const polls = await Poll.find({});
   
        // Iterate over each poll to calculate the percentage for its options
        const pollsWithPercentage = polls.map((poll) => {
            let totalVotes = 0;

            // Calculate the total votes for the poll
            poll.options.forEach((option) => {
                totalVotes += option.votes;
            });

            // Calculate and assign the percentage for each option
            const optionsWithPercentage = poll.options.map((option) => {
                const percentage = totalVotes !== 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                return {
                    ...option.toObject(), // Convert Mongoose document to plain JavaScript object
                    percentage: percentage,
                };
            });

            // Update the poll options with the new structure including percentage
            return {
                ...poll.toObject(), // Convert Mongoose document to plain JavaScript object
                options: optionsWithPercentage,
            };
        });

        res.status(200).json(pollsWithPercentage);
    } catch (error) {
        console.error("Error getting poll:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getSinglePoll = async (req, res) => {
    try {
        const { id } = req.params; // Corrected the destructuring of params

        // Find the single poll by its ID
        const poll = await Poll.findById(id);

        if (!poll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        let totalVotes = 0;

        // Calculate the total votes for the poll
        poll.options.forEach((option) => {
            totalVotes += option.votes;
        });

        // Calculate and assign the percentage for each option
        const optionsWithPercentage = poll.options.map((option) => {
            const percentage = totalVotes !== 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return {
                ...option.toObject(), // Convert Mongoose document to plain JavaScript object
                percentage: percentage,
            };
        });

        // Update the poll options with the new structure including percentage
        const pollWithPercentage = {
            ...poll.toObject(), // Convert Mongoose document to plain JavaScript object
            options: optionsWithPercentage,
        };

        res.status(200).json(pollWithPercentage);
    } catch (error) {
        console.error("Error getting single poll:", error.message);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: "Invalid Poll ID format" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findOneAndDelete({_id:req.params.id});
        if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
        }
        
        res.status(200).json({ msg: "Poll removed" });
    } catch (error) {
        console.error("Error deleting poll:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addDistrict = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name ) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
        }
        const newDistrict = await District.create({
        name,
        });
        res.status(201).json(newDistrict);
    } catch (error) {
        console.error("Error adding district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addConstituency = async (req, res) => {
    try {
        const { name, district } = req.body;
        
        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the constituency." });
        }
        
        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });
        
        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Create a new Constituency instance
        const newConstituency = {
            name: name,
            assemblies: [] // You can initialize with empty assemblies if required
        };

        // Push the new constituency to the district's constituencies array
        existingDistrict.constituencies.push(newConstituency);
        
        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Constituency added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addAssembly = async (req, res) => {
    try {
        const { name, district, constituency } = req.body;

        // Check if name, district, and constituency are provided
        if (!name || !district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Create a new Assembly instance
        const newAssembly = {
            name: name,
            panchayaths: []  // You can initialize with empty panchayaths if required
        };

        // Push the new assembly to the constituency's assemblies array
        existingConstituency.assemblies.push(newAssembly);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Assembly added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addPanchayath = async (req, res) => {
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.panchayaths.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getDistrict = async (req, res) => {
    try {
        const { district, constituency, assembly, panchayath } = req.query;

        if (district) {
            const result = await District.findOne({ name: district });
            if (result) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        } else if (constituency) {
            const result = await District.findOne({ "constituencies.name": constituency });
            if (result) {
                const foundConstituency = result.constituencies.find(c => c.name === constituency);
                return res.status(200).json(foundConstituency);
            } else {
                return res.status(404).json({ error: "Constituency not found" });
            }
        } else if (assembly) {
            let foundAssembly = null;
            const result = await District.findOne({});
            if (result) {
                result.constituencies.forEach(con => {
                    con.assemblies.forEach(asm => {
                        if (asm.name === assembly) {
                            foundAssembly = asm;
                        }
                    });
                });
            }
            if (foundAssembly) {
                return res.status(200).json(foundAssembly);
            } else {
                return res.status(404).json({ error: "Assembly not found" });
            }
        } else if (panchayath) {
            let foundPanchayath = null;
            const result = await District.findOne({});
            if (result) {
                result.constituencies.forEach(con => {
                    con.assemblies.forEach(asm => {
                        asm.panchayaths.forEach(pan => {
                            if (pan.name === panchayath) {
                                foundPanchayath = pan;
                            }
                        });
                    });
                });
            }
            if (foundPanchayath) {
                return res.status(200).json(foundPanchayath);
            } else {
                return res.status(404).json({ error: "Panchayath not found" });
            }
        } else {
            return res.status(400).json({ error: "Please provide a valid parameter" });
        }

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getDistrictV2 = async (req,res)=>{
    try {
        const { district, constituency, assembly, panchayath } = req.query;

        // Find district based on the provided name
        let query = district ? { name: district } : {};

        const result = await District.findOne(query);

        if (!result) {
            return res.status(404).json({ error: "Data not found" });
        }

        // If constituency is provided, narrow down the search
        if (constituency) {
            result.constituencies = result.constituencies.filter(con => con.name === constituency);
        }

        // If assembly is provided, narrow down the search
        if (assembly) {
            result.constituencies.forEach(con => {
                con.assemblies = con.assemblies.filter(asm => asm.name === assembly);
            });
        }

        // If panchayath is provided, narrow down the search
        if (panchayath) {
            result.constituencies.forEach(con => {
                con.assemblies.forEach(asm => {
                    asm.panchayaths = asm.panchayaths.filter(pan => pan.name === panchayath);
                });
            });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getDistrictV3 = async (req,res)=>{
    try {
        const { district, constituency, assembly } = req.query;
        if (!district && !constituency && !assembly) {
            const allDistricts = await District.find({}, 'name'); // Fetch only the 'name' field
            return res.status(200).json(allDistricts.map(d => d.name));
        }
        // If only district is provided, return all constituencies
        if (district && !constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                return res.status(200).json(result.constituencies.map(con => con.name));
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district and constituency are provided, return all assemblies
        if (district && constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    return res.status(200).json(selectedConstituency.assemblies.map(asm => asm.name));
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district, constituency, and assembly are provided, return all panchayaths
        if (district && constituency && assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    const selectedAssembly = selectedConstituency.assemblies.find(asm => asm.name === assembly);
                    if (selectedAssembly) {
                        return res.status(200).json(selectedAssembly.panchayaths.map(pan => pan.name));
                    } else {
                        return res.status(404).json({ error: "Assembly not found within the constituency" });
                    }
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        return res.status(400).json({ error: "Invalid parameters provided" });

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getDistrictV4 = async (req,res)=>{
    try {
        const { district, constituency, assembly,local } = req.query;
        console.log(district, constituency, assembly,local);
        if (!district && !constituency && !assembly) {
            const allDistricts = await District.find({}, 'name'); // Fetch only the 'name' field
            return res.status(200).json(allDistricts.map(d => d.name));
        }
        // If only district is provided, return all constituencies
        if (district && !constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                return res.status(200).json(result.constituencies.map(con => con.name));
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district and constituency are provided, return all assemblies
        if (district && constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    return res.status(200).json(selectedConstituency.assemblies.map(asm => asm.name));
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district, constituency, and assembly are provided, return all panchayaths
        if (district && constituency && assembly && local) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    const selectedAssembly = selectedConstituency.assemblies.find(asm => asm.name === assembly);
                    if (selectedAssembly) {
                        if(local==="panchayath"){
                                return res.status(200).json(selectedAssembly.panchayaths.map(pan => pan.name));
                            }else if(local==="municipality"){
                             return res.status(200).json(selectedAssembly.municipality.map(pan => pan.name));
                            }else if(local === "corporation"){
                                 return res.status(200).json(selectedAssembly.corporation.map(pan => pan.name));
                             }else{
                                return res.status(400).json({message:"Local not found"})
                             }
                    } else {
                        return res.status(404).json({ error: "Assembly not found within the constituency" });
                    }
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        return res.status(400).json({ error: "Invalid parameters provided" });

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteDistrict = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the district." });
        }

        // Find and delete the district
        const deletedDistrict = await District.findOneAndDelete({ name });

        // If district not found
        if (!deletedDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        res.status(200).json({ message: "District deleted successfully", deletedDistrict });
    } catch (error) {
        console.error("Error deleting district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteConstituency = async (req, res) => {
    try {
        const { district, constituency } = req.body;

        // Check if district and constituency are provided
        if (!district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the index of the constituency within the found district
        const constituencyIndex = existingDistrict.constituencies.findIndex(c => c.name === constituency);

        // If constituency not found
        if (constituencyIndex === -1) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Remove the constituency from the district's constituencies array
        existingDistrict.constituencies.splice(constituencyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Constituency deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteAssembly = async (req, res) => {
    try {
        const { district, constituency, assembly } = req.body;

        // Check if district, constituency, and assembly are provided
        if (!district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the index of the assembly within the found constituency
        const assemblyIndex = existingConstituency.assemblies.findIndex(a => a.name === assembly);

        // If assembly not found
        if (assemblyIndex === -1) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Remove the assembly from the constituency's assemblies array
        existingConstituency.assemblies.splice(assemblyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Assembly deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deletePanchayath = async (req, res) => {
    try {
        const { district, constituency, assembly, panchayath } = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !panchayath) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.panchayaths.findIndex(p => p.name === panchayath);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Panchayath not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.panchayaths.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Panchayath deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const  addCorporation = async(req,res)=>{
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.corporation.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const  addMunicipality = async(req,res)=>{
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.municipality.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteCorporation = async (req, res) => {
    try {
        const { district, constituency, assembly, corporation } = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !corporation) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.corporation.findIndex(p => p.name === corporation);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Corporation not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.corporation.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Corporation deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting Corporation:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const deleteMunicipality = async (req, res) => {
    try {
        const { district, constituency, assembly, municipality} = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !municipality) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.municipality.findIndex(p => p.name === municipality);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Municipality not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.corporation.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Municipality deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting Municipality:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
async function sendNotificationsToAllDevices(req, res) {
    try {
        const { title, url } = req.body;
        const imageObj = req.file;

        // Retrieve all tokens from the Notification model
        const allTokens = await Notification.find().distinct('token');
        if (!allTokens) {
            throw new Error('No tokens found');
        }

        // Build the payload
        const payload = {
            registration_ids: allTokens,
            notification: {
                body: title,
                title: `${process.env.SITE_NAME}`,
            },
            data: {
                url: url,
            },
        };

        // Add image property to data if imageObj exists
        if (imageObj) {
            payload.notification.image = `${process.env.DOMAIN}/OneImage/${imageObj.filename}`;
        }

        console.log(JSON.stringify(payload));

        const result = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await result.json();

        // Check for errors in the HTTP response
        if (!result.ok) {
            throw new Error(`FCM request failed with status ${result.status}: ${data}`);
        }

        const date = new Date().toString().trim("T");

        // Use Promise.all to await both the fetch and the creation of NotificationList concurrently
        await Promise.all([
            NotificationList.create({ title: title, image: imageObj ? `${process.env.DOMAIN}/OneImage/${imageObj.filename}` : null, url: url, date: date }),
            res.status(200).json({ message: 'Notification sent successfully', data }),
        ]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getNotifications = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skipIndex = (page - 1) * limit;

    try {
        const notifications = await NotificationList.find()
            .sort({ _id: -1 }) // Sorting in descending order
            .limit(limit)
            .skip(skipIndex)
            .exec();

        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationList.findOneAndDelete({_id:req.params.id});
        if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
        }
        
        res.status(200).json({ msg: "notification removed" });
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const AddVideogallery = async (req, res) => {
    try {
        const { title, url } = req.body;
        const videoObj = req.file;
        const newVideo = await VideoGallery.create({
            title: title,
            url: url,
            video: `${process.env.DOMAIN}/videoGallery/${videoObj.filename}`,
        })
            res.status(200).json(newVideo);
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getVideogallery = async (req, res) => {
    try {
        const videos = await VideoGallery.find();
        res.status(200).json(videos);
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteVideogallery = async (req, res) => {
    try {
        const video = await VideoGallery.findOneAndDelete({_id:req.params.id});
        if (!video) {
        return res.status(404).json({ error: "Video not found" });
        }
        res.status(200).json({ msg: "Video removed" });
    } catch (error) {
        console.error("Error deleting video:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    adminLogin,
    adminRegister,
    getAllUsers,
    getUser,
    deleteUser,
    getAllOrders,
    addGallery,
    deleteImage,
    addMeme,
    deleteMeme,
    getMeme,
    addReels,
    deleteReels,
    getReels,
    addCalendarEvent,
    getCalendarEvents,
    deleteCalendarEvent,
    addSlogan,
    getSlogan,
    deleteSlogan,
    protected,
    addAd,
    getAd,
    deleteAd,
    sendNotification,
    getMandalam,
    addMandalam,
    deleteMandalam,
    addEvent,
    deleteEvent,
    getEvents,
    getFeedBack,
    addCarousel,
    deleteCarousel,
    getCarousel,
    addPoll,
    getPoll,
    getSinglePoll,
    deletePoll,
    addDistrict,
    addConstituency,
    addAssembly,
    addPanchayath,
    getDistrict,
    getDistrictV2,
    getDistrictV3,
    getDistrictV4,
    deleteDistrict,
    deleteConstituency,
    deleteAssembly,
    deletePanchayath,
    addCorporation,
    deleteCorporation,
    addMunicipality,
    deleteMunicipality,
    sendNotificationsToAllDevices,
    getNotifications,
    deleteNotification,
    AddVideogallery,
    getVideogallery,
    deleteVideogallery,

}
