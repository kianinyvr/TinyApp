

var express = require("express");
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080; // default port 8080
var random = require("randomstring");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};

const users = {
   example: {
                id: "example",
                email: "user@example.com",
                password: "purple-monkey-dinosaur"
              }
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

  app.get("/register", (req,res)=> {
  res.render("url_register");
});



app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req,res) => {
  const templateVars = {
    shortURL: req.params.id,
    user: users[req.cookies["user_id"]]
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

  const email = req.body.email;
  const password = req.body.password;

  for (const id in users){
    if(users[id].email === email){
      //email matches, check for password
      if(users[id].password === password){
        cookies.set(user[id].id);
        res.redirect("/urls");
      }
      res.status(403).send("403: Incorrect Password");
      return;
    }
  }

  res.status(403).send("403: Username doesn't exist");
  return;
});

app.get("/login", (req,res) => {
  res.render("url_login");


});


app.post("/urls/:key/delete", (req, res) => {
  delete urlDatabase[req.params.key];
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("user");
  res.redirect("/urls");
});

app.post("/register", (req,res) => {



  if(req.body.email === "" || req.body.password ===""){
    res.status(400).send("400: Oh uh, something went wrong");
    return;
  };


  if(findEmail(users, req.body.email) === req.body.email){
    res.status(400).send("400: User already exists");
    return;
  };

  const userID = generateRandomString();


  res.cookie("user_id", userID);

  users[userID] = {
    id : userID,
    email: req.body.email,
    password: req.body.password
  };

  res.redirect("/urls");

});



app.listen(PORT, () => {
  console.log('Example app listening on port: ' + PORT);
});

function generateRandomString() {
  return random.generate(6);
};

function findEmail(obj, email){
  let found;
  for(key in obj){
    if(obj[key].email === email) {
      found = email;
    }
  }
  return found;
};


