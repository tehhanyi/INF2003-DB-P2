require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

async function findOrCreateUser(phone_number) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("supabase_data");
    const collection = db.collection("User");

    // Check if user already exists
    let user = await collection.findOne({ phone_number });
    if (user) {
      return { ...user, is_new: false };
    } else {
      // If user does not exist, get the highest user_id and increment it
      const lastUser = await collection.find().sort({ user_id: -1 }).limit(1).toArray();
      const nextUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1;

      // Create new user with auto-incremented user_id
      const newUser = {
        phone_number,
        user_id: nextUserId,
        name: "Default Name",
        created_at: new Date().toISOString(),
      };

      const result = await collection.insertOne(newUser);
      console.log(`New user created with user_id: ${nextUserId}`);
      return { ...newUser, is_new: true };
    }
  } catch (error) {
    console.error("Error creating or finding user:", error);
  } finally {
    await client.close();
  }
}

// module.exports = { findOrCreateUser };

async function deleteUser(userId) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("supabase_data");
      const collection = db.collection("User");
  
      // Convert `userId` to an integer if it's not an ObjectId
      const result = await collection.deleteOne({ user_id: userId });
      if (result.deletedCount > 0) {
        console.log(`User with ID ${userId} deleted`);
      } else {
        console.log(`No user found with ID: ${userId}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      await client.close();
    }
  }

async function updateUserName(userId, newName) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("supabase_data");
      const collection = db.collection("User");
  
      const result = await collection.updateOne(
        { user_id: parseInt(userId) },  // Ensure user_id is treated as an integer
        { $set: { name: newName } }
      );
  
      if (result.modifiedCount > 0) {
        console.log(`User name updated to ${newName}`);
      } else {
        console.log(`No user found with user_id: ${userId}`);
      }
    } catch (error) {
      console.error("Error updating user name:", error);
    } finally {
      await client.close();
    }
  }
  

module.exports = { findOrCreateUser, deleteUser, updateUserName };
