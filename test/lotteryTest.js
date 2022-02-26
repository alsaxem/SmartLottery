const { expect } = require("chai");


describe("Lottery contract", function () {
    
    // Contract factory
    let Lottery;

    // Current contract instance
    let smartLottery;

    // Test account addresses
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // Ethereum limit for the lottery
    let ticketLimit;

    // Contract initialization time
    let deploymentTime;

    // Token limit for the SLToken
    let tokenLimit;

    // Price lottery ticket in SLT
    let ticketPrice;

    // Time limit for the lottery
    let duration;

    // Perform initial steps for all tests
    beforeEach(async function () {

      ticketLimit = 1000;
      duration = 3600;
      tokenLimit = BigInt(1e54);
      ticketPrice = 11;
      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
      Token = await ethers.getContractFactory("SLToken");
      SLToken = await Token.deploy(tokenLimit);
      Lottery = await ethers.getContractFactory("SmartLottery");
      smartLottery = await Lottery.deploy(ticketLimit, duration, SLToken.address, ticketPrice);
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      deploymentTime = blockBefore.timestamp;
    
    });

    //Token contract initialization testing
    describe("Token deployment", function () {

      it("Should create a right amount of tokens", async function () {
        const endTime = await SLToken.balanceOf(owner.address);
        expect(endTime).to.equal(tokenLimit);
      });

      it("Should set the right owner", async function () {
        const ownerContract = await SLToken.owner();
        expect(ownerContract).to.equal(owner.address);
      });
    });

    //Lottery contract initialization testing
    describe("Lottery deployment", function () {

      it("Should set the right end time", async function () {
        const endTime = await smartLottery.endTime();
        expect(endTime).to.equal(duration+deploymentTime);
      });
      
      it("Should set the right ticket limit", async function () {
        const maxBalance = await smartLottery.remainingTickets();
        expect(maxBalance).to.equal(ticketLimit);
      });

      it("Should set the right owner", async function () {
        const ownerContract = await smartLottery.owner();
        expect(ownerContract).to.equal(owner.address);
      });

      it("Should set the right token address", async function () {
        const tokenAddr = await smartLottery.tokenContractAddr();
        expect(tokenAddr).to.equal(SLToken.address);
      });

      it("Should set the right ticket price", async function () {
        const ticketLotteryPrice = await smartLottery.ticketPrice();
        expect(ticketLotteryPrice).to.equal(ticketPrice);
      });
    });

    //Testing the function of buying tokens to participate in the lottery
    describe("Token transfer", function () {

      it("Should fail if the transaction does not contain token", async function () {
        await expect(
          SLToken.connect(addr1).transfer(addr2.address,0)
        ).to.be.revertedWith("Token amount must be greater than 0");
      });
    
      it("Should increase user token balance after the purchase", async function () {
        await SLToken.transfer(addr1.address,111);
        const tockensBalance = await SLToken.balanceOf(addr1.address);
        expect(tockensBalance).to.equal(111);
      });

      it("Should fail if the user balance does not contain enough tokens", async function () {
        await expect(
          SLToken.connect(addr1).transfer(addr2.address,1)
        ).to.be.revertedWith("Not enough tokens");
      });

    });

  //Testing the function of buying tokens to participate in the lottery
  describe("Exchange tokens for lottery tickets", function () {

    it("Should fail if the transaction does not contain token", async function () {
      await expect(
        SLToken.connect(addr1).exchangeForTickets(smartLottery.address,0)
      ).to.be.revertedWith("Tikets amount must be greater than 0");
    });

    it("Should fail if the user's balance is below the required value", async function () {
      await expect(
        SLToken.connect(addr1).exchangeForTickets(smartLottery.address,1)
      ).to.be.revertedWith("Not enough tokens");
    });

    it("Should increase user token balance after the purchase", async function () {
      SLToken.transfer(addr1.address,11000)
      await SLToken.connect(addr1).exchangeForTickets(smartLottery.address,100)
      const userBalance = await smartLottery.ticketsBalances(addr1.address)
      await expect(userBalance).to.equal(100);
    });

    it("Should fail if the time limit has been exceeded", async function () {
      SLToken.transfer(addr1.address,ticketLimit*ticketPrice)
      await network.provider.send("evm_increaseTime", [duration+1]);
      await expect(
        SLToken.connect(addr1).exchangeForTickets(smartLottery.address,ticketLimit)
      ).to.be.revertedWith("Lottery Already Ended");
    });

    it("Should fail if the ticket balance is exceeded", async function () {
      SLToken.transfer(addr1.address,(ticketLimit+1)*ticketPrice)
      await expect(
        SLToken.connect(addr1).exchangeForTickets(smartLottery.address,ticketLimit+1)
      ).to.be.revertedWith("The requested number of tickets exceeds the remaining amount");
    });

  });
});
