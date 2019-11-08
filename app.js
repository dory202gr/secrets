//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

var secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
})

app.get("/login", function(req, res){
  res.render("login");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/register", function(req, res){
  User.findOne({email: req.body.username}, function(err, foundUser){
    if(!err){
      if(!foundUser){
        const newUser = new User({
          email: req.body.username,
          password: req.body.password
        });

        newUser.save(function(err){
          if (err){
            console.log(err);
          } else {
            res.render("secrets");
          }
        });
      } else{
        res.send("email already exist");
      }
    }
  })
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(!err){
      if(foundUser){
        if(password === foundUser.password){
          res.render("secrets");
        } else {
          res.send("username or password are wrong, try again")
        }
      } else {
        res.send("username or password are wrong, try again")
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
