// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 < 0.9.0;

import "./SLToken.sol";

contract SmartLottery {

    // Сontract owner's address.
    address public owner;

    // Lottery winner address.
    address public winner;

    // Token contract address.
    // Used for buying lottery tickets. 
    address public tokenContractAddr;

    // Maximum number of lottery tickets.
    // The value is determined when the contract is initialized.
    uint256 public ticketLimit;

    // Price lottery ticket in SLT.
    uint256 public ticketPrice;

    // Remaining lottery tickets.
    // The value is determined when the contract is initialized.
    uint256 public remainingTickets;

    // Lottery end time.
    // The value is determined when the contract is initialized.
    uint256 public endTime;

    // List of lottery participants.
    address[] private players;

    // Number of tickets assigned to a specific address.
    mapping (address => uint) public ticketsBalances;
 
    // Set to true at the end, disallows any change.
    // By default initialized to `false`.
    bool public ended;

    // Event that will be emitted on end.
    event LotteryEnded(address, uint256);

    /// The lottery has already ended.
    error LotteryAlreadyEnded();

    /// The lottery has not ended yet.
    error LotteryNotYetEnded();

    /// The lottery has not ended yet.
    error LotteryBalanceOverflow(string, uint256);

    /**
    * @notice Create a new lottery with given parameters.
    * @dev sets owner to the current sender and default value for ended
    * @dev set remainingTickets to the maximum number of tickets
    * @dev set endTime to the sum of the block.timestamp and duration
    * @param _maxTicket total number of tickets
    * @param _duration time period in seconds
    * @param _tokenAddr SLT token address
    * @param _ticketPrice price lottery ticket in SLT
    */
    constructor(uint256 _maxTicket, uint _duration, address _tokenAddr, uint _ticketPrice) {
        owner = msg.sender;
        ended = false;
        remainingTickets = ticketLimit = _maxTicket;
        tokenContractAddr = _tokenAddr;
        ticketPrice = _ticketPrice;
        endTime = block.timestamp + _duration;
    }

    /**
    * @notice Buying tickets with Ether.
    * @dev tokens are credited to the user's account
    * @param _recipient recipient address
    * @param _amount amount lottery tickets
    */
    function creditTickets(address _recipient, uint256 _amount) external {
        require(block.timestamp < endTime || !ended, "Lottery Already Ended");
        require(_amount < remainingTickets, "The requested number of tickets exceeds the remaining amount");
        if (ticketsBalances[_recipient] == 0)
            players.push(_recipient);
        SLToken sltoken = SLToken(_recipient);
        sltoken.transferFrom(_recipient, address(this), _amount*ticketPrice);
        ticketsBalances[_recipient] += _amount;
        remainingTickets -= _amount;
    }

    /**
    * @dev generate random ticket with keccak256
    */
    function randomTicket() internal view returns(uint256) {
        uint number = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
        return number%ticketLimit;
    }

    /**
    * @dev pick winner with random ticket
    */
    function winnerPick() internal {
        uint256 winNumber = randomTicket();
        winner = players[0];
        for(uint i = 0; i < players.length; i++) {
            if(winNumber < ticketsBalances[players[i]]) {
                winner = players[i];
                break;
            }
            else
                winNumber -= ticketsBalances[players[i]];
        }
    }

    /**
    * @notice The end of the lottery and the transfer of SLT token.
    * @dev сommission and reward calculation
    * @dev determination of the winner and transfer of SLT token
    * @dev changing the value of a variable ended to true
    * @dev event emission LotteryEnded
    */
    function lotteryEnd() external {
        require(!ended, "Lottery already ended");
        require(remainingTickets < 0 && block.timestamp > endTime, "Lottery not yet ended");
        uint256 reward = ticketLimit*9/10;
        winnerPick();
        SLToken sltoken = SLToken(tokenContractAddr);
        sltoken.transfer(winner, reward);
        sltoken.transfer(owner, sltoken.balanceOf(address(this)));
        ended = true;
        emit LotteryEnded(winner, reward);
    }
}

