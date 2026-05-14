// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// =============================================================
//                           CONTEXT
// =============================================================

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// =============================================================
//                            IERC20
// =============================================================

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// =============================================================
//                         STORAGE SLOT
// =============================================================

library StorageSlot {
    struct AddressSlot { address value; }
    struct BooleanSlot { bool value; }
    struct Bytes32Slot { bytes32 value; }
    struct Uint256Slot { uint256 value; }
    struct Int256Slot { int256 value; }
    struct StringSlot { string value; }
    struct BytesSlot { bytes value; }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }
}

// =============================================================
//                           OWNABLE
// =============================================================

abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// =============================================================
//                       REENTRANCY GUARD
// =============================================================

abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

// =============================================================
//                          SAFE ERC20
// =============================================================

library SafeERC20 {
    error SafeERC20FailedOperation(address token);
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;
        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            if iszero(and(success, eq(mload(0x00), 1))) {
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    function _safeTransferFrom(IERC20 token, address from, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transferFrom.selector;
        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(from, shr(96, not(0))))
            mstore(0x24, and(to, shr(96, not(0))))
            mstore(0x44, value)
            success := call(gas(), token, 0, 0x00, 0x64, 0x00, 0x20)
            if iszero(and(success, eq(mload(0x00), 1))) {
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;
        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            if iszero(and(success, eq(mload(0x00), 1))) {
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}

// =============================================================
//                    CRYPTO PAYMENT GATEWAY
// =============================================================

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
        uint8 status;
        uint256 timestamp;
    }

    // =============================================================
    //                       STATE VARIABLES
    // =============================================================

    uint256 public platformFeeBps = 50;
    uint256 public constant MAX_FEE_BPS = 1000;

    mapping(address => mapping(address => uint256)) public merchantBalances;
    mapping(address => uint256) public totalMerchantTokenBalances;
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

    event MerchantWithdrawal(address indexed merchant, address indexed token, uint256 amount);
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
    ) external payable nonReentrant returns (bytes32) {
        if (merchant == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 receivedAmount;

        if (token == address(0)) {
            if (msg.value != amount) revert InvalidETHAmount();
            receivedAmount = amount;
        } else {
            uint256 beforeBalance = IERC20(token).balanceOf(address(this));
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            receivedAmount = IERC20(token).balanceOf(address(this)) - beforeBalance;
            if (receivedAmount == 0) revert TransferFailed();
        }

        uint256 fee = (receivedAmount * platformFeeBps) / 10000;
        uint256 merchantAmount = receivedAmount - fee;

        bytes32 txId = keccak256(
            abi.encodePacked(merchant, msg.sender, token, amount, block.timestamp)
        );

        merchantBalances[merchant][token] += merchantAmount;
        totalMerchantTokenBalances[token] += merchantAmount;

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

    function withdrawFunds(uint256 amount, address token) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        uint256 balance = merchantBalances[msg.sender][token];
        if (balance < amount) revert InsufficientBalance();

        merchantBalances[msg.sender][token] = balance - amount;
        totalMerchantTokenBalances[token] -= amount;

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

    function getMerchantBalance(address merchant, address token) external view returns (uint256) {
        return merchantBalances[merchant][token];
    }

    function getTransaction(bytes32 txId) external view returns (Transaction memory) {
        return transactions[txId];
    }

    // =============================================================
    //                          RECEIVE ETH
    // =============================================================

    receive() external payable {}
}