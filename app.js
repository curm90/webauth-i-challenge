const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Users = require('./src/users/user-model');
const restricted = require('./src/middleware');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(
  session({
    name: 'mysession',
    secret: process.env.SECRET,
    cookie: {
      maxAge: 1000 * 30,
      secure: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false
  })
);

app.get('/', (req, res) => {
  res.send('Its alive');
});

app.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  Users.add(user)
    .then(newUser => {
      res.status(201).json(newUser);
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
});

app.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}` });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

app.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(error => res.send(error));
});

app.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.json({
          message: 'You can checkout any time you like, but you can never leave'
        });
      } else {
        res.status(200).json({ message: 'Bye, thanks for playing' });
      }
    });
  } else {
    res.status(200).json({ message: 'You were never here to begin with' });
  }
});

module.exports = app;
