const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("fundMe", async function () {
          let FundMe
          let deployer
          let MockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              FundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await FundMe.priceFeed()
                  assert.equal(response, MockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(FundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("updated the amount funded data structure", async function () {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.addressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("adds funder to the array of funders", async function () {
                  await FundMe.fund({ value: sendValue })
                  const funder = await FundMe.funders(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await FundMe.fund({ value: sendValue })
              })
              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await FundMe.provider.getBalance(FundMe.address)
                  const startingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  // Assert
                  // Maybe clean up to understand the testing
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw from different funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await FundMe.provider.getBalance(FundMe.address)
                  const startingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  // Assert
                  // Maybe clean up to understand the testing
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  // make sure funder array reset properly
                  await expect(FundMe.funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allow owner", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await FundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
