// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CryptoPaymentGateway is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =============================================================
    //                            STRUCTS
    // =============================================================

    struct Transaction {
        bytes32 txId;
        address merchant;
        address payer;
        address token;
        uint256 amount;
        uint256 fee;
        uint8 status; // 0=pending, 1=completed, 2=refunded
        uint256 timestamp;
    }

    // =============================================================
    //                       STATE VARIABLES
    // =============================================================

    uint256 public platformFeeBps = 50; // 0.5%
    uint256 public constant MAX_FEE_BPS = 1000; // 10%

    // merchant => token => balance
    mapping(address => mapping(address => uint256)) public merchantBalances;

    // token => total merchant balance (for fee calculation)
    mapping(address => uint256) public totalMerchantTokenBalances;

    // txId => transaction
    mapping(bytes32 => Transaction) public transactions;

    // =============================================================
    //                             EVENTS
    // =============================================================

    event PaymentProcessed(
        bytes32 indexed txId,
        address indexed merchant,
        address indexed payer,
        address token,
        uint256 amount,
        uint256 fee
    );

    event MerchantWithdrawal(
        address indexed merchant,
        address indexed token,
        uint256 amount
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    // =============================================================
    //                            ERRORS
    // =============================================================

    error ZeroAddress();
    error ZeroAmount();
    error InvalidETHAmount();
    error InsufficientBalance();
    error FeeTooHigh();
    error TransferFailed();

    // =============================================================
    //                          CONSTRUCTOR
    // =============================================================

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    // =============================================================
    //                     PAYMENT PROCESSING
    // =============================================================

    function processPayment(
        address merchant,
        uint256 amount,
        address token
    )
        external
        payable
        nonReentrant
        returns (bytes32)
    {
        if (merchant == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 receivedAmount;

        if (token == address(0)) {
            // Native ETH
            if (msg.value != amount) revert InvalidETHAmount();
            receivedAmount = amount;
        } else {
            // ERC20 with fee-on-transfer support
            uint256 beforeBalance = IERC20(token).balanceOf(address(this));
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            receivedAmount = IERC20(token).balanceOf(address(this)) - beforeBalance;
            if (receivedAmount == 0) revert TransferFailed();
        }

        uint256 fee = (receivedAmount * platformFeeBps) / 10000;
        uint256 merchantAmount = receivedAmount - fee;

        // Generate tx ID
        bytes32 txId = keccak256(
            abi.encodePacked(merchant, msg.sender, token, amount, block.timestamp)
        );

        // Update accounting
        merchantBalances[merchant][token] += merchantAmount;
        totalMerchantTokenBalances[token] += merchantAmount;

        // Store transaction
        transactions[txId] = Transaction({
            txId: txId,
            merchant: merchant,
            payer: msg.sender,
            token: token,
            amount: receivedAmount,
            fee: fee,
            status: 1,
            timestamp: block.timestamp
        });

        emit PaymentProcessed(txId, merchant, msg.sender, token, receivedAmount, fee);

        return txId;
    }

    // =============================================================
    //                     MERCHANT WITHDRAWAL
    // =============================================================

    function withdrawFunds(uint256 amount, address token)
        external
        nonReentrant
    {
        if (amount == 0) revert ZeroAmount();

        uint256 balance = merchantBalances[msg.sender][token];
        if (balance < amount) revert InsufficientBalance();

        // Effects first
        merchantBalances[msg.sender][token] = balance - amount;
        totalMerchantTokenBalances[token] -= amount;

        // Then transfer
        if (token == address(0)) {
            (bool success,) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit MerchantWithdrawal(msg.sender, token, amount);
    }

    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================

    function updateFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit FeeUpdated(oldFee, newFeeBps);
    }

    function withdrawFees(address token) external onlyOwner nonReentrant {
        uint256 contractBalance;

        if (token == address(0)) {
            contractBalance = address(this).balance;
        } else {
            contractBalance = IERC20(token).balanceOf(address(this));
        }

        uint256 merchantTotal = totalMerchantTokenBalances[token];
        uint256 fees = contractBalance - merchantTotal;

        if (fees == 0) revert InsufficientBalance();

        if (token == address(0)) {
            (bool success,) = payable(owner()).call{value: fees}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(owner(), fees);
        }
    }

    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================

    function getMerchantBalance(address merchant, address token)
        external
        view
        returns (uint256)
    {
        return merchantBalances[merchant][token];
    }

    function getTransaction(bytes32 txId)
        external
        view
        returns (Transaction memory)
    {
        return transactions[txId];
    }

    // =============================================================
    //                          RECEIVE ETH
    // =============================================================

    receive() external payable {
        // Accept ETH only via processPayment
    }
}