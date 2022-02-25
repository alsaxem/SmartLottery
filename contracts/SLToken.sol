// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.2 < 0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SmartLottery.sol";

contract SLToken is ERC20 {
    // Owner account address.
    address public owner;

    /**
    * @notice Create Tokens.
    * @param _initialSupply initial token supply to be minted
    * @dev sets owner to the current sender (deployer)
    * @dev mints initial token supply and assigns it to the owner
    */
    constructor(uint _initialSupply) ERC20("SLToken", "SLT") {
        _mint(msg.sender, _initialSupply);
        owner = msg.sender;
    }

    /** 
    * @notice Transfer tokens to another account.
    * @param _recipient address of the receiver
    * @param _amount number of tokens to be transferred
    * @return true if transaction was successful
    */
    function transfer(address _recipient, uint256 _amount) public override returns (bool) {
        require(_amount > 0, "Token amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Not enough tokens");
        _transfer(_msgSender(), _recipient, _amount);
        return true;
    }

    /** 
    * @notice Exchange tokens to lottery tickets.
    * @param _lotteryAddr address of the lottery
    * @param _amount number of tickets to be exchange
    * @return true if transaction was successful
    */
    function exchangeForTickets(address _lotteryAddr, uint256 _amount) external returns (bool) {
        require(_amount > 0, "Tikets amount must be greater than 0");
        SmartLottery sLottery = SmartLottery(_lotteryAddr);
        uint256 ticketsPrice = sLottery.ticketPrice() * _amount;
        require(balanceOf(msg.sender) >= ticketsPrice, "Not enough tokens");
        approve(_lotteryAddr, ticketsPrice);
        sLottery.creditTickets(msg.sender , _amount);
        return true;
    }
}
