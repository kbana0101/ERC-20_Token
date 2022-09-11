var RandomToken = artifacts.require("./RandomToken.sol");
var RandomTokenSale = artifacts.require("./RandomTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(RandomToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(RandomTokenSale, RandomToken.address, tokenPrice);
  });
};