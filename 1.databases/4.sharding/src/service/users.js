const { shard1Pool, shard2Pool } = require("./db/client")

/**
 * The table 'users' schema would be [name: string primary key, city: string]
 */

exports.addUser = async (req, res) => {
    try{
        const { name: username, city } = req.body;
        const db = getDBPoolByKey(username);
        await db.execute("INSERT INTO users(name, city) VALUES(?, ?)", [username, city])
        return res.status(200).json({
            message: `created user ${username} successfully`
        });
    }
    catch(error) {
        console.error("Error while adding user", error);
        return res.status(500).json({ message: "Failed to add user." }); 
    }
}

exports.getUser = async (req, res) => {
    try {
        const username = req.params.name;
        const db = getDBPoolByKey(username);
        const [user] = await db.execute("SELECT name, city from users where name = ?", [username]);
        return res.status(200).json({
            data: {
                user: user
            } 
        });
    }
    catch(error){
        console.error("Error getting user", error);
        return res.status(500).json({ message: "Failed to get user." });
    }
}

exports.updateUser = async (req, res) => {
    try{
        const { city } = req.body;
        const username = req.params.name;
        const db = getDBPoolByKey(username);
        const [result] = await db.execute("UPDATE users SET city = ? WHERE name = ?", [city, username]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User ${username} not found.` });
        }
        return res.status(200).json({
            message: `updated user ${username} successfully`
        });
    }
    catch(error) {
        console.error("Error while updating user", error);
        return res.status(500).json({ message: "Failed to update user." }); 
    }
}

exports.deleteUser = async (req, res) => {
    try{
        const username = req.params.name;
        const db = getDBPoolByKey(username);
        const [result] = await db.execute("DELETE FROM users WHERE name = ?", [username]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User ${username} not found.` });
        }

        return res.status(200).json({
            message: `deleted user ${username} successfully`
        })
    }
    catch(error) {
        console.error("Error while deleting user", error);
        return res.status(500).json({ message: "Failed to delete user." }); 
    }
}

const getDBPoolByKey = (username) => {
    if(!username) {
        throw new Error("Invalid username")
    }
    const key = username.toLowerCase().charAt(0);
    if(key >= 'a' && key <= 'm') {
        return shard1Pool;
    }
    else {
        return shard2Pool;
    }
}