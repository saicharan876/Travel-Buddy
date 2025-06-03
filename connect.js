const mongoose=require("mongoose");

async function ConnectDB(url){
    return mongoose.connect(url);
}

module.exports = ConnectDB;

