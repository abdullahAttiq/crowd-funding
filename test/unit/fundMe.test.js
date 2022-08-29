const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { assert } = require("chai")

describe("fundMe", async function () {
    let hello
    let deployer
    let MockV3Aggregator
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        hello = await ethers.getContract("FundMe", deployer)
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await hello.getPriceFeed()
            assert.equal(response, MockV3Aggregator.address)
        })
    })
})
