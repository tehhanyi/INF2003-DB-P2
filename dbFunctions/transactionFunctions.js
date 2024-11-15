require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

async function addTransactionWithAsset(userId, assetName, symbol, boughtPrice, quantity) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("supabase_data");

    const transactionResult = await db.collection("Transaction").insertOne({ user_id: new ObjectId(userId) });
    const transactionId = transactionResult.insertedId;

    await db.collection("Asset").insertOne({
      transaction_id: transactionId,
      asset_name: assetName,
      symbol: symbol,
      bought_price: boughtPrice,
      quantity: quantity,
    });

    console.log("Transaction and asset added successfully");
  } finally {
    await client.close();
  }
}

async function getUserPortfolio(userId) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("supabase_data");
  
      // Aggregation to get the portfolio of a specific user
      const portfolio = await db.collection("Transaction").aggregate([
        { $match: { user_id: userId } }, // Match transactions for the specified user_id
        {
          $lookup: {
            from: "Asset",
            localField: "transaction_id",
            foreignField: "transaction_id",
            as: "assets"
          }
        },
        { $unwind: "$assets" }, // Flatten assets array
        {
          $project: {
            asset_name: "$assets.asset_name",
            symbol: "$assets.symbol",
            bought_price: "$assets.bought_price",
            quantity: "$assets.quantity",
            _id: 0
          }
        }
      ]).toArray();
  
      console.log("Portfolio Result:", portfolio);
      return portfolio;
    } catch (error) {
      console.error("Error fetching user portfolio:", error);
    } finally {
      await client.close();
    }
  }

async function getUserProfitLoss(userId) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("supabase_data");
  
      // Aggregation pipeline to calculate total profit/loss
      const result = await db.collection("Transaction").aggregate([
        { $match: { user_id: userId } }, // Find transactions for the specified user_id
        {
          $lookup: {
            from: "Asset",
            localField: "transaction_id",
            foreignField: "transaction_id",
            as: "assets"
          }
        },
        { $unwind: "$assets" }, // Flatten the array of assets
        {
          $project: {
            profit_loss: { $multiply: [{ $subtract: ["$assets.current_price", "$assets.bought_price"] }, "$assets.quantity"] }
          }
        },
        {
          $group: {
            _id: null,
            total_profit_loss: { $sum: "$profit_loss" } // Sum all profit/loss values
          }
        }
      ]).toArray();
  
      // Extract total profit/loss from the aggregation result
      const totalProfitLoss = result.length > 0 ? result[0].total_profit_loss : 0;
      console.log("Total Profit and Loss:", totalProfitLoss);
      return totalProfitLoss;
    } catch (error) {
      console.error("Error fetching user total profit and loss:", error);
    } finally {
      await client.close();
    }
  }

module.exports = { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss };
