var Tournament = artifacts.require("./Tournament.sol");
var TrivialGame = artifacts.require("./TrivialGame.sol");

module.exports = function(deployer) {
  deployer.deploy(Tournament);
  deployer.deploy(TrivialGame);
};
