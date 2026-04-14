const mongoose=require('mongoose');
configureDB=async function(){
    try{
       await mongoose.connect(process.env.DB_URL)
       console.log('server is connected to db')
    }catch(err){
        console.log('error connecting to db:',err)

    }
}
module.exports=configureDB;