require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

async function updateAssetPriceBySymbol(symbols, realTimePrices) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("supabase_data");
      const collection = db.collection("Stock");
  
      for (const symbol of symbols) {
        console.log('symbol:' + symbol)
        const currentPrice = realTimePrices[symbol] || 0; // If price is not available, set to 0
  
        const result = await collection.updateOne(
          { symbol: symbol },
          { $set: { stock_price: currentPrice } }
        );
      }
    } catch (error) {
      console.error("Error updating stock price:", error);
    } finally {
      await client.close();
    }
  }

async function getTop10AssetsByQuantity() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("supabase_data");
    const collection = db.collection("Asset");

    const topAssets = await collection.aggregate([
      {
        $group: {
          _id: { asset_name: "$asset_name", symbol: "$symbol" },
          total_quantity: { $sum: "$quantity" }
        }
      },
      { $sort: { total_quantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          asset_name: "$_id.asset_name",
          symbol: "$_id.symbol",
          total_quantity: 1
        }
      }
    ]).toArray();

    return topAssets;
  } finally {
    await client.close();
  }
}

module.exports = { updateAssetPriceBySymbol, getTop10AssetsByQuantity };
