const express = require('express');
const app = express();
const port = 3000;

const { findOrCreateUser, deleteUser, updateUserName } = require('./dbFunctions/userFunction');  
const { updateAssetPriceBySymbol,getTop10AssetsByQuantity } = require('./dbFunctions/assetFunctions');
const { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss } = require('./dbFunctions/transactionFunctions');

// Add this middleware before any routes
app.use(express.json());  // To parse JSON bodies in POST requests

app.get("/api/test", async (req, res) => {
  res.json({
    status: "success",
    message: "testing connections",
  });
}
);

app.get("/api/getUserPortfolio", async (req, res) => {
  const userId = req.query.userId; // Get the userId from the query string
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId is required",
    });
  }

  try {
    const portfolio = await getUserPortfolio(userId);  // Fetch user portfolio
    if (portfolio.length > 0) {
      res.json({
        status: "success",
        message: "User portfolio found!",
        user_id: userId,
        portfolio: portfolio, // Send the portfolio details
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



app.post("/api/findOrCreateUser", async (req, res) => {
  const phone = req.query.phone;  // Get phone number from query parameters
  if (!phone) {
    return res.status(400).json({
      status: "error",
      message: "Phone number is required",
    });
  }

  try {
    const user = await findOrCreateUser(phone);  // Replace with actual function logic
    res.json({
      status: "success",
      message: "User created or found!",
      user_id: user.user_id,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/getUserProfitLoss", async (req, res) => {
  const userId = req.query.userId; // Get the userId from the query string
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId is required",
    });
  }

  try {
    const result = await getUserProfitLoss(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// API endpoint to add transaction with asset
app.post("/api/addTransactionWithAsset", async (req, res) => {
  console.log(req.body); // Log the body to check if it's being sent correctly

  const { userId, assetName, symbol, boughtPrice, quantity } = req.body;

  if (!userId || !assetName || !symbol || !boughtPrice || !quantity) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required (userId, assetName, symbol, boughtPrice, quantity)",
    });
  }

  try {
    // Call the function to add transaction with asset
    await addTransactionWithAsset(userId, assetName, symbol, boughtPrice, quantity);
    res.json({
      status: "success",
      message: "Transaction and asset added successfully",
    });
  } catch (error) {
    console.error("Error adding transaction and asset:", error);  // Log the error details
    res.status(500).json({
      status: "error",
      message: "An error occurred while adding the transaction and asset",
      error: error.message || error, // Return the error message for debugging
    });
  }
});




app.listen(port, () => {
  console.log(`Server is running on http://10.0.2.2:${port}`);
});