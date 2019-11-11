const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Users = require('./src/users/user-model');

const app = express();

const sessionConfig = {
  name: 'mysession',
  secret: 'nobody tosses a dwarf!',
  cookie: {
    maxAge: 1000 * 30,
    secure: false
  },
  httpOnly: true,
  resave: false,
  saveOnInitialized: false
};

app.use(helmet());
app.use(express.json());
app.use(sessionConfig);

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
        res.status(200).json({ message: `Welcome ${user.username}` });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function restricted(req, res, next) {
  const { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        next();
      } else {
        res.status(401).json({ messasge: 'Invalid credentials' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
}

app.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(error => res.send(error));
});

module.exports = app;
