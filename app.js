const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const Users = require('./src/users/user-model');

const app = express();

app.use(helmet());
app.use(express.json());

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

module.exports = app;
