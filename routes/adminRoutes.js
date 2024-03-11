const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const multer = require("multer");
const GalleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/galleryImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const galleryImage = multer({
    storage: GalleryStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
const AdStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/ADImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const ADImage = multer({
    storage: AdStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
const OneStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/OneImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const OneImage = multer({
    storage: OneStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
const eventStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/eventImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const eventImage = multer({
    storage: eventStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  const sloganStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/sloganImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const sloganImage = multer({
    storage: sloganStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/carouselImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const carouselImage = multer({
    storage: carouselStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });


  const calendarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/calendarImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const calendarImage = multer({
    storage: calendarStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

  const socialMediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/socialMediaImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const socialMediaImage = multer({
    storage: socialMediaStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/videoGallery");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
// Configure storage engine with increased file size limit.
const videoGallery = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});
const memeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/memeImage");
  },
  filename: function (req, file, cb) {
    // It is the filename that is given to the saved file.
    const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
    console.log(`${uniqueSuffix}-${file.originalname}`);
    // console.log(file);
  },
});

// Configure storage engine instead of dest object.
const memeImage = multer({
  storage: memeStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
const reelsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/reelsImage");
  },
  filename: function (req, file, cb) {
    // It is the filename that is given to the saved file.
    const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
    console.log(`${uniqueSuffix}-${file.originalname}`);
    // console.log(file);
  },
});

// Configure storage engine instead of dest object.
const reelsImage = multer({
  storage: reelsStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
const leaderStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/leadershipImage");
  },
  filename: function (req, file, cb) {
    // It is the filename that is given to the saved file.
    const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
    console.log(`${uniqueSuffix}-${file.originalname}`);
    // console.log(file);
  },
});

// Configure storage engine instead of dest object.
const leaderImage = multer({
  storage: leaderStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
const developerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/developerImage");
  },
  filename: function (req, file, cb) {
    // It is the filename that is given to the saved file.
    const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
    console.log(`${uniqueSuffix}-${file.originalname}`);
    // console.log(file);
  },
});

// Configure storage engine instead of dest object.
const developerImage = multer({
  storage: developerStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
router.post('/login',adminController.adminLogin);
router.get('/user/:id',adminAuth,adminController.getUser);
router.get('/users',adminAuth,adminController.getAllUsers);    
router.get("/calendar-events/:date",adminController.getCalendarEvents)
router.get('/slogan',adminController.getSlogan);
router.get('/protected', adminAuth, adminController.protected);
router.get('/ad',adminController.getAd);
router.get('/mandalam',adminController.getMandalam);
router.get('/events',adminController.getEvents);
router.get('/feedback',adminAuth,adminController.getFeedBack);
router.get('/carousel',adminController.getCarousel);
router.get('/poll',adminController.getPoll);
router.get('/single-poll/:id',adminController.getSinglePoll);
router.get('/district',adminController.getDistrict);
router.get('/districtV2',adminController.getDistrictV2);
router.get('/districtV3',adminController.getDistrictV3);
router.get('/districtV4',adminController.getDistrictV4);
router.get('/notifications',adminController.getNotifications);
router.get('/get-social-media',adminController.getSocialMediaDetails);
router.get('/developers',adminController.getDevelopers);

router.get('/videogallery',adminController.getVideogallery);
router.get('/reels',adminController.getReels);
router.get('/meme',adminController.getMeme);
router.get('/leadership',adminController.getLeadership);
router.get('/get-social-media/:socialId/:itemId',adminController.getSocialMediaDetailsById);
router.get('/get-social-category',adminController.getCategorySocialMedia);

router.post('/gallery',galleryImage.single('image'),adminAuth,adminController.addGallery);
router.post('/meme',memeImage.single('image'),adminAuth,adminController.addGallery);
router.post('/ad',ADImage.single('image'),adminAuth,adminController.addAd);
router.post('/calendar-event',calendarImage.single("image"),adminAuth,adminController.addCalendarEvent);
router.post('/slogan',sloganImage.single('image'),adminController.addSlogan);
router.post('/one-signal',OneImage.single('image'),adminAuth,adminController.sendNotification);
router.post('/firebase-notification',OneImage.single('image'),adminAuth,adminController.sendNotificationsToAllDevices);
router.post('/mandalam',adminController.addMandalam);
router.post('/event',eventImage.single('image'),adminAuth,adminController.addEvent);
router.post('/carousel',carouselImage.single('image'),adminAuth,adminController.addCarousel);
router.post('/poll',adminAuth,adminController.addPoll);
router.post('/add-district',adminAuth,adminController.addDistrict);
router.post('/add-constituency',adminAuth,adminController.addConstituency);
router.post('/add-assembly',adminAuth,adminController.addAssembly);
router.post('/add-panchayath',adminAuth,adminController.addPanchayath);
router.post('/add-corporation',adminAuth,adminController.addCorporation);
router.post('/add-municipality',adminAuth,adminController.addMunicipality);
router.post('/add-videogallery',videoGallery.single('video'),adminAuth,adminController.AddVideogallery);
router.post('/add-reels',reelsImage.single('image'),adminAuth,adminController.addReels);
router.post('/add-meme',memeImage.single('image'),adminAuth,adminController.addMeme);
router.post('/delete-district',adminAuth,adminController.deleteDistrict);
router.post('/delete-constituency',adminAuth,adminController.deleteConstituency);
router.post('/delete-assembly',adminAuth,adminController.deleteAssembly);
router.post('/delete-panchayath',adminAuth,adminController.deletePanchayath);
router.post('/delete-corporation',adminAuth,adminController.deleteCorporation);
router.post('/delete-municipality',adminAuth,adminController.deleteMunicipality);
router.post('/add-social-category',adminAuth,adminController.addCategoryForSocialMedia);
router.post('/add-social-media-details',socialMediaImage.single('image'),adminAuth,adminController.addSocialMediaDetails);
router.post('/add-leadership',leaderImage.single('image'),adminAuth,adminController.addLeadership);
router.post('/update-social-media-details/:socialId/:itemId',adminAuth,socialMediaImage.single('image'),adminAuth,adminController.updateSocialMediaDetails);
router.post('/add-developer',developerImage.single('image'),adminAuth,adminController.addDeveloper);

router.delete('/user/:id',adminAuth,adminController.deleteUser);
router.delete('/deleteImage/:id',adminAuth,adminController.deleteImage);
router.delete('/slogan/:id',adminAuth,adminController.deleteSlogan);
router.delete("/calendar-event/:id",adminAuth,adminController.deleteCalendarEvent);
router.delete("/ad/:id",adminAuth,adminController.deleteAd);
router.delete('/mandalam/:id',adminController.deleteMandalam);
router.delete('/event/:id',adminAuth,adminController.deleteEvent);
router.delete('/carousel/:id',adminAuth,adminController.deleteCarousel);
router.delete('/poll/:id',adminAuth,adminController.deletePoll);
router.delete('/delete-notification/:id',adminAuth,adminController.deleteNotification);
router.delete('/delete-videogallery/:id',adminAuth,adminController.deleteVideogallery);
router.delete('/reels/:id',adminAuth,adminController.deleteReels);
router.delete('/meme/:id',adminAuth,adminController.deleteMeme);
router.delete('/delete-social-media-details/:socialId/:itemId',adminAuth,adminController.deleteSocialMediaDetails);
router.delete('/delete-social-category/:category',adminAuth,adminController.deleteCategorySocialMedia);
router.delete('/delete-leadership/:id',adminAuth,adminController.deleteLeadership);
router.delete('/delete-developer/:id',adminAuth,adminController.deleteDeveloper);
module.exports = router;
