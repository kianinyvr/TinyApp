//packages and app setting defined below

var express = require("express");
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080; // default port 8080
var random = require("randomstring");
const cookieSession = require("cookie-session");
const deleteOverride = require("method-override");
const bcrypt = require("bcrypt");
let session = {};



// Databases

const urlDatabase = {
  "b2xVn2" : {
                url: "http://www.lighthouselabs.ca",
                user_id: "example"
              },

  "9sm5xK" : {
                url: "http://www.google.com",
                user_id: "example"
              }
};

const users = {
   example: {
                id: "example",
                email: "kian.akhavan@gmail.com",
                password: "fransen34"
            },

    bob:    {
                id: "bob",
                email: "bob@gmail.com",
                password: "fransen34"
            }
};

let userDB = {};


//Middlewares

app.use(cookieSession({
  name: "session",
  secret: "tinyApp",
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(deleteOverride("_method"));

//setting local variable that refers to value of user id cookie

app.use((req, res, next) => {
  res.locals.user_id = req.session.user_id;
  next();
})


//mw for checking if user is signed in

app.use((req,res, next) => {
  console.log("USER DATABASE: " , users);
  console.log("----------------------------------------------------");
  next();
});




app.use("/urls", (req, res, next) => {
  if(req.session.user_id){
    next();
  }
  else {
    res.status(403).send("Error: 403 you need to be logged in to view this page <br> <a href='/login'> Go to login </a>");
  }
});

//funcitons to use by server
function generateRandomString() {
  return random.generate(6);
};

function findEmail(obj, email){
  let found;
  for(key in obj){
    if(obj[key].email === email) {
      found = email;
    };
  };
  return found;
};

function urlsForUser(id){
  for(let key in urlDatabase){
    if(urlDatabase[key].user_id === id){
      userDB[key] = { url: urlDatabase[key].url,
                      user_id: urlDatabase[key].user_id
                    };
    };
  };
  return userDB;
};

// Endpoints

app.get("/", (req, res) => {
  if(res.locals.user_id){
    res.redirect("/urls")
  }

  res.redirect("/login")
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req,res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
    userId: req.session.user_id
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req,res)=> {
  res.render("url_register");
});

app.post("/register", (req,res) => {
  if(req.body.email === "" || req.body.password ===""){
    res.status(400).send("400: Please provide a valid email and password.");
    return;
  };

  if(findEmail(users, req.body.email) === req.body.email){
    res.status(400).send("400: User already exists");
    return;
  };
  //User has met registration critera. The server stores their details.
  const userID = generateRandomString();
  const password = req.body.password;
  const hashed = bcrypt.hashSync(password, 10);

  users[userID] = {
    id : userID,
    email: req.body.email,
    password: hashed
  };

  req.session.user_id = userID;
  res.redirect("/urls");

});


//checked
app.get("/urls/new", (req, res) => {
  const templateVars = {
  urls: urlsForUser(req.session.user_id),
  user: users[req.session.user_id],
  userId: req.session.user_id
  };

  if(req.session.user_id){
    res.render("urls_new", templateVars);
  }
    res.redirect("/urls/login");
});

app.get("/urls/:id", (req,res) => {
  const templateVars = {
    shortURL: req.params.id,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:key", (req, res) => {
  res.redirect("urls/update");
});

app.post("/urls", (req, res) => {
  const key = generateRandomString(req.body.longURL);
  urlDatabase[key] = {
    url: req.body.longURL,
    user_id: req.session.user_id
  };
  res.redirect("/urls/" + key);
});

app.get("/u/:shortURL", (req, res) => {
  //let longURL =
  const longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.post("/urls/:key", (req, res) => {
  urlDatabase[req.params.key] = req.body.url;
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (const id in users){
    if(users[id].email === email){
      //email matches, check for password
      console.log("USER PW: ", users[id].password);
      // (users[id].password === password)
      if(bcrypt.compareSync(password, users[id].password)){
        req.session.user_id = users[id].id;
        res.redirect("/urls");
      };
      res.status(403).send("403: Incorrect Password");
      return;
    };
  };

  res.status(403).send("403: Username doesn't exist");
  return;
});

app.post("/urls/:key/delete", (req, res) => {
  delete urlDatabase[req.params.key];
  delete userDB[req.params.key];
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/login", (req,res) => {
  res.render("url_login");
});

app.listen(PORT, () => {
  console.log('Example app listening on port: ' + PORT);
});



