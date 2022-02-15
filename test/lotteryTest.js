const { expect } = require("chai");


describe("Lottery contract", function () {
    
    //Contract factory
    let Token;

    //Current contract instance
    let smartLottery;

    //Test account addresses
    let owner;
    let addr1;
    let addr2;
    let addrs;

    //Ethereum limit for the lottery
    let ethLimit;

    //Contract initialization time
    let deploymentTime;

    //Time limit for the lottery
    let duration;

    //Perform initial steps for all tests
    beforeEach(async function () {

        ethLimit = ethers.utils.parseEther("1000");
        duration = 3600;
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        Token = await ethers.getContractFactory("SmartLottery");
        smartLottery = await Token.deploy(ethLimit, duration);
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        deploymentTime = blockBefore.timestamp;
    
    });

    //Contract initialization testing
    describe("Deployment", function () {

        it("Should set the right end time", async function () {
          const endTime = await smartLottery.endTime();
          expect(endTime).to.equal(duration+deploymentTime);
        });
        
        it("Should set the right ticket limit", async function () {
          const maxBalance = await smartLottery.maxBalance();
          expect(maxBalance).to.equal(ethLimit);
        });
    
        it("Should set the right owner", async function () {
          const ownerContract = await smartLottery.owner();
          expect(ownerContract).to.equal(owner.address);
        });
    });

    //Testing the function of buying tokens to participate in the lottery
    describe("Buying Tickets", function () {});

    //Testing the Lottery End Function
    describe("Ending Lottery", function () {});

});
