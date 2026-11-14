// Migration script: deploys the SimpleVoting contract to the network
const SimpleVoting = artifacts.require("SimpleVoting");

module.exports = function (deployer) {
  deployer.deploy(SimpleVoting);
};
