

var express = require("express");
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080; // default port 8080
var random = require("randomstring");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};


app.get("/", (req, res) => {
  res.end("Hello");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req,res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req,res) => {
  let templateVars = {
    shortURL: req.params.id,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls/:key", (req, res) => {
  res.redirect("urls/update");
});


app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString(req.body.longURL)] = req.body.longURL;
  console.log(req.body);
  res.send("Ok");
});


app.get("/u/:shortURL", (req, res) => {
  //let longURL =
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.post("/urls/:key", (req, res) => {
  console.log(req.params);
  urlDatabase[req.params.key] = req.body.url;

  res.redirect("/urls");
});



app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.post("/urls/:key/delete", (req, res) => {
  delete urlDatabase[req.params.key];
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log('Example app listening on port: ' + PORT);
});

function generateRandomString() {
  return random.generate(6);
};


