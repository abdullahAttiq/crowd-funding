// const main = async () => {
//     const ContractFactory = await hre.ethers.getContractFactory("UserInfo") // the file name under 'contracts' folder, without '.sol'
//     const Contract = await ContractFactory.deploy(UserInfo) // the constructor params
//     await Contract.deployed()
//     console.log("Contract deployed to:", Contract.address)

//     // // You can test the function.
//     // let txn = await nftContract.functionName()
//     // // Wait for it to be mined.
//     // await txn.wait()
//     // console.log("function invoked!")
// }

// const runMain = async () => {
//     try {
//         await main()
//         process.exit(0) // emit the exit event that ends all tasks immediately even if there still are asynchronous operations not been done. The shell that executed node should see the exit code as 0.
//     } catch (error) {
//         console.log(error)
//         process.exit(1)
//     }
// }

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

    const FundMe = await deploy("UserInfo", {
        from: deployer,
        log: true,
        arg: [ethUsdPriceFeedAddress],
        waitConfirmations: network.config.blockConfirmation || 1,
    })

    log(`UserInfo deployed at ${FundMe.address}`)

    // if (!developmentChains.includes(network.name) && process.env.API_KEY) {
    //     await verify(FundMe.address)
    // }
    // {
    //     await verify(FundMe.address, [ethUsdPriceFeedAddress])
    // }
}

module.exports.tags = ["all", "Fundme"]
