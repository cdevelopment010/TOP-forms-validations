const usersStorage = require("../storages/usersStorage");
const { body, validationResult} = require('express-validator');

const alphaErr = "must only contain letters."; 
const lengthErr = "must be between 1 and 10 characters."; 
const emailErr = "must be a valid email."; 
const ageErr = "must be between 18 and 120.";
const bioErr = "must be less than 200 characters.";

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({min: 1, max: 10}).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({min: 1, max: 10}).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage(`Email ${emailErr}`),
  body("age").optional({checkFalsy: true}).isNumeric().withMessage("Age must be numeric")
    .isInt({min: 18, max: 120}).withMessage(`Age ${ageErr}`),
  body("bio").trim()
    .optional({checkFalsy: true}).isLength({max: 200}).withMessage(`Bio ${bioErr}`),
];

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
    res.render("createUser", {
      title: "Create user",
    });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user", 
        errors: errors.array(),
      });
    } 
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect("/");
  }
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id); 
  res.render("updateUser", {
    title: "Update user", 
    user: user
  })
}

exports.usersUpdatePost = [
  validateUser,
  (req,res) => {
    const user = usersStorage.getUser(req.params.id); 
    const errors = validationResult(req); 
    if(!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user", 
        user: user, 
        errors: errors.array()
      })
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio }); 
    res.redirect("/")
  }
]

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id); 
  res.redirect("/");
}

exports.usersSearchGet = (req, res) => {
  let search = req.query.search.toLowerCase()
  //search name 
  let users = usersStorage.getUsers(); 
  let usersNames = users.filter(x => x.firstName.toLowerCase().includes(search) || x.lastName.toLowerCase().includes(search))
  let usersEmail = users.filter(x => x.email.toLowerCase().includes(search)); 

  // Concatenate and remove duplicates based on the 'id' property
  const combinedArray = [...usersNames, ...usersEmail].filter((item, index, self) => 
    index === self.findIndex((obj) => obj.id === item.id)
  );
  
  res.render("search", {
    title: "Search results",
    users: combinedArray,
    search: search, 
  });
}