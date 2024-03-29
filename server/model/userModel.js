import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    houseNo:{
        type:String,
        required:true
    },
    block:{
        type:String,
        required:true
    },
    mobileNo:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

userSchema.pre('save',async function (next) { 
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
        this.confirmPassword = await bcrypt.hash(this.confirmPassword,12);
    }
    next()
 })

 userSchema.methods.generateToken = async function(){
    try {
        let token = jwt.sign({_id: this._id},'AHFKDLEOFEUFLKHDKBFOIAEHFDNIOKFMNRDKJHFNCKJDFHCJKAMFDUJBKM')
        this.tokens = this.tokens.concat({token:token});

        await this.save();
        return token;
    } catch (error) { 
        console.log(error)
    }
 }



export const Register = new mongoose.model('Register',userSchema)
