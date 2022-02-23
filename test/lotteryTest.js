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
          const maxBalance = await smartLottery.remainingTickets();
          expect(maxBalance).to.equal(ticketLimit);
        });
    
        it("Should set the right owner", async function () {
          const ownerContract = await smartLottery.owner();
          expect(ownerContract).to.equal(owner.address);
        });
    });

    //Testing the function of buying tokens to participate in the lottery
    describe("Buying tickets", function () {

        it("Should fail if the transaction does not contain ether", async function () {
          await expect( 
            smartLottery.connect(addr1).buyTickets({value: 0})
          ).to.be.revertedWith("Ether amount must be greater than 0");
        });
      
        it("Should increase user token balance after the purchase", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("100")});
          const tockensBalance = await smartLottery.ticketsBalances(addr1.address);
          expect(tockensBalance).to.equal(ethers.utils.parseEther("100"));
        });
    
        it("Should fail if lottery time is up", async function () {
          await network.provider.send("evm_increaseTime", [duration+1]);
          await expect( 
            smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("100")})
          ).to.be.revertedWith("LotteryAlreadyEnded");
        });
    
        it("Should fail if lottery has been ended", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("1000")});
          await smartLottery.connect(addr1).lotteryEnd();
          await expect(
            smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("100")})
          ).to.be.revertedWith("LotteryAlreadyEnded");
        });
    
        it("Should fail in case of ticket balance overflow", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("1000")});
          await expect(
            smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("100")})
          ).to.be.revertedWith("LotteryBalanceOverflow");
        });
    
    });

    //Testing the Lottery End Function
    describe("Ending Lottery", function () {

        it("Should transfer 90% of the contract balance to the winner", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("1000")});
          await expect(smartLottery.lotteryEnd())
          .to.emit(smartLottery, "LotteryEnded")
          .withArgs(addr1.address, ethers.utils.parseEther("900"));
        });
    
        it("Should be reverted with an error 'LotteryNotYetEnded'", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("100")});
          await expect( 
            smartLottery.lotteryEnd()
          ).to.be.revertedWith("LotteryNotYetEnded");
        });
    
        it("Should fail if lottery has been already ended", async function () {
          await smartLottery.connect(addr1).buyTickets({value: ethers.utils.parseEther("1000")});
          await smartLottery.lotteryEnd();
          await expect(
            smartLottery.lotteryEnd()
          ).to.be.revertedWith("LotteryAlreadyEnded");
        });
        
      });

});
