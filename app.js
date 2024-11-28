const express = require('express');
const app = express();
const port = 3000;

const { findOrCreateUser, deleteUser, updateUserName } = require('./dbFunctions/userFunction');  
const { updateAssetPriceBySymbol, getTop10AssetsByQuantity } = require('./dbFunctions/assetFunctions');
const { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss } = require('./dbFunctions/transactionFunctions');

app.get("api/test", async (req, res) => {
  res.json({
    status: "success",
    message: "testing connections",
  });
}
);

app.post("api/findOrCreateUser", async (req, res) => {
  const phone = req.params.phone;
  if (!phone) {
    return res.status(400).json({
      status: "error",
      message: "Phone number is required",
    });
  }

  try {
    const user = await findOrCreateUser(phone);
    res.json({
      status: "success",
      message: "User created or found!",
      user_id: user.user_id
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
  res.json({
    status: "success",
    message: "User created or found",
  });
}
);

app.listen(port, () => {
  console.log(`Server is running on http://10.0.2.2:${port}`);
});

// Example usage
// async function main() {
  //works
  //await findOrCreateUser("1234567888");

  //works
  //await updateUserName(103, "NewName");

  //works
  //await deleteUser(103);

  //works
  //const topAssets = await getTop10AssetsByQuantity();
  //console.log("Top Assets:", topAssets);

  //works
  //await updateAssetPriceBySymbol("ACRX", 155.00);

  //works
  //const portfolio = await getUserPortfolio(87);

 //works
  //const profitLoss = await getUserProfitLoss(86);
// }

// main().catch(console.error);
