require('dotenv').config();
const { MongoClient} = require('mongodb');
const axios = require('axios');
const mongoUri = process.env.MONGO_URI;
const finnUrl = process.env.FINNHUB_URL;
const { updateAssetPriceBySymbol } = require('./assetFunctions');

async function fetchRealTimePrices(symbols) {

  try {
    const requests = symbols.map(symbol => {
      return axios.get(finnUrl, {
        params: {
          symbol: symbol,
          token: process.env.FINNHUB_APIKEY,
        },
      });
    });

    const responses = await Promise.all(requests);

    // Process the responses into a mapping of symbols to current prices
    const realTimePrices = {};
    responses.forEach(response => {
      if (response.data && response.data.c !== undefined) {
        const symbol = response.config.params.symbol;
        const { c: currentPrice } = response.data;
        realTimePrices[symbol] = currentPrice;
      } else {
        console.warn(`No price data for symbol: ${response.config.params.symbol}`);
      }
    });

    return realTimePrices;
  } catch (error) {
    console.error('Error fetching real-time prices:', error);
    return {};
  }
}

async function addTransactionWithAsset(userId, assetName, symbol, boughtPrice, quantity) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();    
    const db = client.db("supabase_data");
    console.log("Using database:", db.databaseName);

    const transactionId = await db.collection("Transaction").countDocuments() + 1;

    const transactionResult = await db.collection("Transaction").insertOne({
      transaction_id: transactionId,
      timestamp: new Date().toISOString(),
      user_id: parseInt(userId),
    });
    console.log("Transaction insert result:", transactionResult);

    const assetResult = await db.collection("Asset").insertOne({
      transaction_id: transactionId, 
      asset_name: assetName,
      symbol: symbol,
      bought_price: boughtPrice,
      quantity: quantity,
    });
    console.log("Asset insert result:", assetResult);

    console.log("Transaction and asset added successfully");
  } catch (error) {
    console.error("Error adding transaction with asset:", error);
  } finally {
    await client.close();
  }
}

async function getUserPortfolio(userId) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("supabase_data");

    const portfolio = await db.collection("Transaction").aggregate([
      { $match: { user_id: parseInt(userId) } },
      {
        $lookup: {
          from: "Asset",
          localField: "transaction_id",
          foreignField: "transaction_id",
          as: "assets",
        },
      },
      { $unwind: "$assets" },
      {
        $project: {
          asset_name: "$assets.asset_name",
          symbol: "$assets.symbol",
          bought_price: "$assets.bought_price",
          quantity: "$assets.quantity",
          _id: 0,
        },
      },
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
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("supabase_data");

    const assets = await db.collection("Transaction").aggregate([
      { $match: { user_id: parseInt(userId, 10) } },
      {
        $lookup: {
          from: "Asset",
          localField: "transaction_id",
          foreignField: "transaction_id",
          as: "assets",
        },
      },
      { $unwind: "$assets" },
      {
        $project: {
          bought_price: "$assets.bought_price",
          quantity: "$assets.quantity",
          symbol: "$assets.symbol",
        },
      },
    ]).toArray();

    let symbolsToSubscribe = assets.map(asset => asset.symbol);
    const realTimePrices = await fetchRealTimePrices(symbolsToSubscribe);

    await updateAssetPriceBySymbol(symbolsToSubscribe, realTimePrices, db);

    let totalProfitLoss = 0;
    for (const asset of assets) {
      const currentPrice = realTimePrices[asset.symbol] || 0;
      const profitLoss = (currentPrice - asset.bought_price) * asset.quantity;
      totalProfitLoss += profitLoss;
    }

    console.log("Total Profit and Loss:", totalProfitLoss);
    return totalProfitLoss;
  } catch (error) {
    console.error("Error fetching user total profit and loss:", error);
  } finally {
    await client.close();
  }
}
module.exports = { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss };
