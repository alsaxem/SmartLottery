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
    describe("Deployment", function () {});

    //Testing the function of buying tokens to participate in the lottery
    describe("Buying Tickets", function () {});

    //Testing the Lottery End Function
    describe("Ending Lottery", function () {});

});
