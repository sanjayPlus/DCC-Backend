// userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,

  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  whatsappNumber: {
    type: String,
  },
  date_of_birth: {
    type: Date,
  },
  district: String,
  constituency: String,
  assembly: String,
  panchayath: {
    type: String,
    default: ""
  },
  corporation: {
    type: String,
    default: ""
  },
  municipality: {
    type: String,
    default: ""
  },
  addaar: {
    type: String,
    default: ""
  },
  pan_card: {
    type: String,
    default: ""
  },
  blood_group: {
    type: String,
    default: ""
  }, union: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: Number,
    default: null,
  },
  forgot_otp: {
    type: Number,
    default: null,
  },
  gallery_likes: {
    type: Array,
    default: []

  },
  profileImage: {
    type: String,
    default: ""
  },
  guest: {
    type: Boolean,
    default: false
  },
  payments: [{
    paymentId: String,
    amount: Number,
    date: String,
    merchantId: String,
    merchantTransactionId: String,
  }],
  volunteer: {
    name: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    booth: {
      type: String,
      default: ""
    },
    aadhaar: {
      type: Array,
      default: []
    },
    wardNo: {
      type: String,
      default: ""
    },
    aadhaarNo: {
      type: String,
      default: ""
    },
    madalamPresident: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    mandalamMember: {
      type: String,
      default: ""
    },
    volunteerId: {
      type: String,
      default: ""
    },
    district: {
      type: String,
      default: ""
    },
    constituency: {
      type: String,
      default: ""
    },
    assembly: {
      type: String,
      default: ""
    },
    boothRule: {
      type: Array,
      default: []
    },
    applied: {
      type: Boolean,
      default: false
    },
    status: {
      type: Boolean,
      default: false
    },
    power: {
      type: String,
      default: ""
    },
  }

});

// Virtual for age calculation based on date_of_birth
userSchema.virtual('age').get(function () {
  if (this.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null; // Return null if date_of_birth is not set
});

// Setting the virtual field to appear in JSON
userSchema.set('toJSON', { getters: true });

const User = mongoose.model('User', userSchema);

module.exports = User;