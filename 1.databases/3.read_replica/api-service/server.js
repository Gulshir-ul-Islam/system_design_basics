const express = require("express");
const userService = require("./service/userService")

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/users", async (req,res) => {
    return await userService.getAllUsers(req, res);
});

app.post("/users", async (req, res) => {
    return await userService.addUser(req, res);
});

app.patch("/users/:userId", async (req,res) => {
    return await userService.updateUser(req, res);
});

app.delete("/users/:userId", async (req, res) => {
    return await userService.deleteUser(req, res);
});

app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`)
});