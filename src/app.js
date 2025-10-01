const express = require('express');

const app = express();

app.use("/hey", (req, res) => {
  res.send('Hello World!');
});
app.use("/", (req, res) => {
  res.send('Hello from the dashboard!');
});

app.listen(7777, () => {
  console.log('Server is successfully listening on port 7777');
});