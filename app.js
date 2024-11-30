const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { getTop10AssetsByQuantity } = require('./dbFunctions/assetFunctions');
const { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss } = require('./dbFunctions/transactionFunctions');
app.use(express.json());

app.get("/api/test", async (req, res) => {
  res.json({
    status: "success",
    message: "testing connections",
  });
}
);

// API endpoint to get user transactions portfolio
app.get("/api/getUserPortfolio", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId is required",
    });
  }

  try {
    const portfolio = await getUserPortfolio(userId);
    if (portfolio.length > 0) {
      res.json({
        status: "success",
        message: "User portfolio found!",
        user_id: userId,
        portfolio: portfolio,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No portfolio found for the given userId",
      });
    }    
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// API endpoint to calculate user P&L
app.get("/api/getUserProfitLoss", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId is required",
    });
  }

  try {
    const result = await getUserProfitLoss(userId);
    res.set("Profit-And-Loss", "Your Profit and Loss Details");
    res.json({
      Profit: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


// API endpoint to add transaction with asset
app.post("/api/addTransactionWithAsset", async (req, res) => {
  console.log(req.body);

  const { userId, assetName, symbol, boughtPrice, quantity } = req.body;

  if (!userId || !assetName || !symbol || !boughtPrice || !quantity) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required (userId, assetName, symbol, boughtPrice, quantity)",
    });
  }

  try {
    await addTransactionWithAsset(userId, assetName, symbol, boughtPrice, quantity);
    res.json({
      status: "success",
      message: "Transaction and asset added successfully",
    });
  } catch (error) {
    console.error("Error adding transaction and asset:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while adding the transaction and asset",
      error: error.message || error
    });
  }
});

// API endpoint to get the top 10 assets by quantity
app.get('/api/top10assets', async (req, res) => {
  try {
    const topAssets = await getTop10AssetsByQuantity();
    res.status(200).json(topAssets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top 10 assets", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});