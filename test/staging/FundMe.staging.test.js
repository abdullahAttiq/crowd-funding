const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let FundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              FundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to withray and fund", async function () {
              await FundMe.fund({ value: sendValue })
              await FundMe.withdraw()
              const endingBalance = await FundMe.provider.getBalance(
                  FundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
