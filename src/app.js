const express = require('express');

const app = express();

app.get("/user", (req, res) => {
  res.send({firstName: "Shobhit", lastName: "Jain"});
});

app.post("/user", (req, res) => {
  //saving data to database
  res.send("Data successfully saved to the database");
});

app.delete("/user", (req, res) => {
  res.send("Deleted successfully");
});

app.use("/test", (req, res) => {
  res.send('Hello from the server!');
});

app.listen(7777, () => {
  console.log('Server is successfully listening on port 7777');
});