var express = require("express");
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080; // default port 8080
var random = require("randomstring");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bcrypt = require("bcrypt");
let hashed = "";

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

userDB = {};





//setting local variable that refers to value of user id cookie

app.use((req, res, next) => {
  res.locals.user_id = req.cookies.user_id;
  next();
})


//mw for checking if user is signed in

app.use((req,res, next) => {
  console.log("UPDATED URL DATABASE: " , urlDatabase);
  console.log("----------------------------------------------------");
  next();
});




app.use("/urls", (req, res, next) => {
  if(req.cookies.user_id){
    next();
  }
  else {
    res.status(403).send("Error: 403 you need to be logged in to view this page <br> <a href='/login'> Go to login </a>");
  }
});


// updating the url database to only include those where the logged in user has access to them

// app.use("/urls", (req, res, next) => {
//   f
//   next()
// });


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
    urls: urlsForUser(res.locals.user_id),
    user: users[req.cookies["user_id"]]
  };

  console.log("XXXXXXX");
  console.log("HASHED: ", hashed);

  res.render("urls_index", templateVars);
});

app.get("/register", (req,res)=> {
  res.render("url_register");
});



app.get("/urls/new", (req, res) => {
    const templateVars = {
    urls: urlsForUser(res.locals.user_id),
    user: users[req.locals.user_id]

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


      const key = generateRandomString(req.body.longURL);
      urlDatabase[key] = {
        url: req.body.longURL,
        user_id: res.locals.user_id
      };
  res.redirect("/urls/" + key);
});


app.get("/u/:shortURL", (req, res) => {
  //let longURL =
  const longURL = urlDatabase[req.params.shortURL].url;
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
      // (users[id].password === password)
      if(bcrypt.compareSync(password, hashed)){
        res.cookie("user_id", id);
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
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  hashed = "";
  res.clearCookie("user_id");
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

  hashed = bcrypt.hashSync(req.body.password, 5);


  res.cookie("user_id", userID);

  users[userID] = {
    id : userID,
    email: req.body.email,
    password: hashed
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

function urlsForUser(id){
  console.log("BEFORE FOR LOOP ID", id)
  // console.log("BEFORE FOR LOOP DATABASE PASSED IN IS :", urlDatabase)
  for(let key in urlDatabase){
    console.log("IN FOR LOOK at KEY", key);
    console.log("urlDB AT KEY IS: ", urlDatabase[key].user_id)
    if(urlDatabase[key].user_id === id){
      console.log("userDB NOW AT: ", userDB)
      userDB[key] = { url: urlDatabase[key].url,
                      user_id: urlDatabase[key].user_id
                    };
    };

    console.log("IN FUNCTION: ", userDB);
  };

  return userDB;

};

