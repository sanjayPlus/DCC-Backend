const mongoose = require('mongoose');

// Pachayath Schema
const PanchayathSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});
const MunicipalitySchema  =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})
const CorporationSchema  =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})
// Assembly Schema
const AssemblySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    panchayaths: [PanchayathSchema],
    municipality:[MunicipalitySchema],
    corporation:[CorporationSchema]
});

// Constituency Schema
const ConstituencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    assemblies: [AssemblySchema]
});

// District Schema
const DistrictSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    constituencies: [ConstituencySchema]
});

// Model based on District Schema
const District = mongoose.model('District', DistrictSchema);


module.exports = District;
