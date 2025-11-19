const { masterPool, replicaPool } = require("../db")

/**
 * Note: It is on the application to query the right mysql server.
 * The reads from done with replica and all writes are with master.
 * 
 * Mainly it is done when reads >> writes. 
 * With this read replica, the master is to do "writes"
 */

export const getAllUsers = async (_req, res) => {
    try {
        const [users] = await replicaPool.execute("SELECT id, name from users");
        return res.status(200).json({
            data: {
                users: users,
                count: users.count
            } 
        });
    }
    catch(error){
        console.error("Error getting users", error);
        return res.status(500).json({ message: "Failed to get users." });
    }
    
}

export const addUser = async (req, res) => {
    try{
        const username = req.body.name;
        const [user] = await masterPool.execute("INSERT INTO users(name) VALUES(?)", [username])
        return res.status(200).json({
            message: `created user with id:${user.id} successfully`
        })
    }
    catch(error) {
        console.error("Error while adding user", error);
        return res.status(500).json({ message: "Failed to add user." }); 
    }
}

export const updateUser = async (req, res) => {
    try{
        const username = req.body.name;
        const userId = req.params.userId;
        const [user] = await masterPool.execute("UPDATE users SET name=? WHERE id=?", [username, userId])
        return res.status(200).json({
            message: `updated user with id:${user.id} successfully`
        })
    }
    catch(error) {
        console.error("Error while updating user", error);
        return res.status(500).json({ message: "Failed to update user." }); 
    }
}

export const deleteUser = async (req, res) => {
    try{
        const userId = req.params.userId;
        await masterPool.execute("DELETE FROM users WHERE id=?", [userId])
        return res.status(200).json({
            message: `created user with id:${user.id} successfully`
        })
    }
    catch(error) {
        console.error("Error while deleting user", error);
        return res.status(500).json({ message: "Failed to delete user." }); 
    }
}