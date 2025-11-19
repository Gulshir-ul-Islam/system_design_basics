const { masterPool, replicaPool } = require("../db/client")

/**
 * Note: It is on the application to query the right mysql server.
 * The reads from done with replica and all writes are with master.
 * 
 * Mainly it is done when reads >> writes. 
 * With this read replica, the master is to do "writes"
 */

exports.getAllUsers = async (_req, res) => {
    try {
        const [users] = await replicaPool.execute("SELECT id, name from users");
        return res.status(200).json({
            data: {
                users: users,
                count: users.length
            } 
        });
    }
    catch(error){
        console.error("Error getting users", error);
        return res.status(500).json({ message: "Failed to get users." });
    }
    
}

exports.addUser = async (req, res) => {
    try{
        const username = req.body.name;
        const [result] = await masterPool.execute("INSERT INTO users(name) VALUES(?)", [username])
        return res.status(200).json({
            message: `created user with id:${result.insertId} successfully`
        })
    }
    catch(error) {
        console.error("Error while adding user", error);
        return res.status(500).json({ message: "Failed to add user." }); 
    }
}

exports.updateUser = async (req, res) => {
    try{
        const username = req.body.name;
        const userId = req.params.userId;
        if (!username) {
            return res.status(400).json({ message: "New name is required for update." });
        }
        const [result] = await masterPool.execute("UPDATE users SET name = ? WHERE id = ?", [username, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }
        return res.status(200).json({
            message: `updated user with id:${user.id} successfully`
        })
    }
    catch(error) {
        console.error("Error while updating user", error);
        return res.status(500).json({ message: "Failed to update user." }); 
    }
}

exports.deleteUser = async (req, res) => {
    try{
        const userId = req.params.userId;
        const [result] = await masterPool.execute("DELETE FROM users WHERE id = ?", [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }

        return res.status(200).json({
            message: `deleted user with id:${userId} successfully`
        })
    }
    catch(error) {
        console.error("Error while deleting user", error);
        return res.status(500).json({ message: "Failed to delete user." }); 
    }
}