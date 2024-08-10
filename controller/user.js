const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateJwt(userid){
    return jwt.sign({userId: userid}, process.env.JWT_SECRET)
}

function isStringValidate(string) {
    if (string.length === 0 || !string) {
        return false;
    }
    return true;
}

exports.createUser = async (req, res) => {
    const {username, email, password} = req.body;

    if (!isStringValidate(username) || !isStringValidate(email) || !isStringValidate(password)) {
        return res.status(400).json({ error: 'Bad parameters: Something is missing' })
    }

    User.findOne({email: email})
        .then((user) => {

            if (user) {
                //if user already exist, send 409 conflict response
                return res.status(409).json({ error: 'User already exist' })
            }

            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    throw new Error({ error: 'Something went wrong' });
                }
                const user = new User({
                    username: username,
                    email: email,
                    password: hash
                })
                await user.save()
                // const user = await User.create({ username, email, password: hash });
                res.status(201).json({ message: 'User Created Successfully' });
            })
        })
        .catch((err) => {
            res.status(500).json({ error: 'Internal Server Error' });
        })
}



exports.checkUser = (req, res) => {
    const {email, password } = req.body;

    if (!isStringValidate(email) || !isStringValidate(password)) {
        return res.status(400).json({ error: 'Bad parameters: Something is missing' })
    }

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong');
                }
                else if (!result) {
                    res.status(400).json({ error: 'Wrong Email or password' });
                }
                else{
                    res.status(200).json({message: 'Successfully login', token: generateJwt(user._id)});
                }  
            })
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        })
};



exports.checkAuthenticity = (req,res)=>{
    res.status(201).json({authentic: true, success: true})
}