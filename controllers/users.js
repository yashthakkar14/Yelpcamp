const User = require('../models/user');

module.exports.registerForm = (req, res)=>{
    res.render('users/register')
}

module.exports.register = async(req, res)=>{
    try{
        const {username, email, password} = req.body;
        const user = new User({email, username})
        const registeredUser = await User.register(user, password);
        // Different from the course, also logging in immediately after registering
        req.login(user, function(err) {
            if (err) 
            { 
                return next(err); 
            }
            req.flash('success', 'Welcome to Yelpcamp!');
            return res.redirect('/campgrounds');
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm = (req, res)=>{
    res.render('users/login');
}

module.exports.login = (req, res)=>{
    req.flash('success', `Welcome Back ${req.user.username}!`);
    res.redirect('/campgrounds');
}

module.exports.logout = (req, res)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}