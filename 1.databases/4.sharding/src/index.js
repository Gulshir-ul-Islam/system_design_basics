const express = require("express");
const users = require("./service/users")

const app = new express();
const PORT = 8000;

app.use(express.json())

app.post("/users", async (req, res) => {
    return await users.addUser(req, res);
});

app.get("/users/:name", async (req,res) => {
    return await users.getUser(req, res);
});

app.patch("/users/:name", async (req,res) => {
    return await users.updateUser(req, res);
});

app.delete("/users/:name", async (req, res) => {
    return await users.deleteUser(req, res);
});


app.listen(PORT, () => {
    console.log(`Application started on port: ${PORT}`)
});