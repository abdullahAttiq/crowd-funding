const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, getNamedAccounts, deployments } = require("hardhat")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]

    const Mint = await deploy("MintableToken", {
        from: deployer,
        log: true,
        arg: [ethUsdPriceFeedAddress],
        waitConfirmations: network.config.blockConfirmation || 1,
    })

    log(`mintableToken deployed at ${Mint.address}`)
}

module.exports.tags = ["all", "Mint"]
