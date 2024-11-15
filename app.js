const { findOrCreateUser, deleteUser, updateUserName } = require('./dbFunctions/userFunction');  
const { updateAssetPriceBySymbol, getTop10AssetsByQuantity } = require('./dbFunctions/assetFunctions');
const { addTransactionWithAsset, getUserPortfolio, getUserProfitLoss } = require('./dbFunctions/transactionFunctions');

// Example usage
async function main() {
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
}

main().catch(console.error);
