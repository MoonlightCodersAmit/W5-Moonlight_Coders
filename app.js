const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static(__dirname+"/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb://localhost:27017/peerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var defaultCoins = 10;
var defCoins = 10;
var currentPeer;
var currentPeerCoins;

const studentSchema = {
  name: String,
  email: String,
  password: String,
  coins: Number
};
const Peer = mongoose.model("Peer", studentSchema);

const querySchema = {
  query: String,
  askedBy: String,
  answered: Boolean
};
const Query = mongoose.model("Query", querySchema);

const solutionSchema = {
  query: String,
  solution: String,
  answeredBy: String,
  liked: Boolean,
  disliked: Boolean
};
const Solution = mongoose.model("Solution", solutionSchema);

const noSol = new Solution({
  query: "No",
  solution: "No one answered this query",
  answeredBy: "No one",
  liked: false,
  disliked: false
});

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newPeer = new Peer({
    name: req.body.peername,
    email: req.body.peermail,
    password: md5(req.body.password),
    coins: 10
  });
  newPeer.save(function(err) {
    if (!err) {
      Peer.find({}, function(er, foundPeers){
        if(er){console.log(er);}
        else if(foundPeers.length==1){
          noSol.save(function(e){
            if(e){
              console.log(e);
            }
          });
        }
      });
      res.redirect("/login");
    } else {
      res.send(err);
    }
  });
});

app.post("/login", function(req, res) {
  const peerMail = req.body.peermail;
  const peerPassword = req.body.password;
  Peer.findOne({email: peerMail}, function(err, foundPeer) {
    if (!err) {
      if (foundPeer) {
        if (foundPeer.password === md5(peerPassword)) {
          currentPeer = foundPeer.name;
          currentPeerCoins = foundPeer.coins;
          res.render("profile", {
            Peer: currentPeer,
            Coins: currentPeerCoins
          });
        } else {
          res.render("loginIn");
        }
      } else {
        res.render("loginIn");
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/profile/:user", function(req, res) {
  Peer.findOne({name: req.params.user}, function(err, foundPeer) {
    if (!err) {
        if(foundPeer!=null){
          res.render("profile", {
            Peer: currentPeer,
            Coins: currentPeerCoins
          });}
    } else {
      res.send(err);
    }
  });
});

app.post("/askQuery", function(req, res){
  const newQuery = new Query({
    query: req.body.query,
    askedBy: req.body.askedBy,
    answered: false
  });
  newQuery.save(function(err) {
    if (!err) {
      Peer.findOne({name: currentPeer}, function(er, user){
        user.coins=user.coins-3;
        currentPeerCoins-=3;
        user.save(function(e){
          if(e){console.log(e);}
        });
      });
        res.render("profile", {
        Peer: currentPeer,
        Coins: currentPeerCoins-3
      });
    } else {
      res.send(err);
    }
  });
});


app.get("/", function(req, res) {
  res.render("home");
});



app.listen(3000, function() {
  console.log("server is running at port 3000");
});

