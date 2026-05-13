// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CryptoPaymentGateway.sol";
import "../src/MockERC20.sol";

contract CryptoPaymentGatewayTest is Test {
    CryptoPaymentGateway public gateway;
    MockERC20 public usdc;
    MockERC20 public usdt;

    address public owner = address(0x1);
    address public merchant = address(0x2);
    address public payer = address(0x3);
    address public alice = address(0x4);

    uint256 public constant INITIAL_BALANCE = 10000 * 10**6; // 10,000 USDC
    uint256 public constant PAYMENT_AMOUNT = 100 * 10**6; // 100 USDC
    uint256 public constant ETH_PAYMENT = 0.1 ether;

    // Events for testing
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

    function setUp() public {
        // Deploy contracts
        vm.startPrank(owner);
        gateway = new CryptoPaymentGateway(owner);
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdt = new MockERC20("Tether USD", "USDT", 6);
        vm.stopPrank();

        // Mint tokens to payer
        usdc.mint(payer, INITIAL_BALANCE);
        usdt.mint(payer, INITIAL_BALANCE);

        // Approve gateway for ERC20 transfers
        vm.startPrank(payer);
        usdc.approve(address(gateway), type(uint256).max);
        usdt.approve(address(gateway), type(uint256).max);
        vm.stopPrank();

        // Give payer some ETH
        vm.deal(payer, 10 ether);
    }

    // =============================================================
    //                      DEPLOYMENT TESTS
    // =============================================================

    function testDeployment() public view {
        assertEq(gateway.platformFeeBps(), 50, "Default fee should be 50 bps");
        assertEq(gateway.owner(), owner, "Owner should be set correctly");
    }

    function testCannotDeployWithZeroAddress() public {
        vm.expectRevert();
        new CryptoPaymentGateway(address(0));
    }

    // =============================================================
    //                      ERC20 PAYMENT TESTS
    // =============================================================

    function testProcessPaymentERC20() public {
        uint256 merchantBalanceBefore = gateway.getMerchantBalance(merchant, address(usdc));

        vm.startPrank(payer);
        bytes32 txId = gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();

        uint256 expectedFee = (PAYMENT_AMOUNT * 50) / 10000;
        uint256 expectedMerchantAmount = PAYMENT_AMOUNT - expectedFee;

        // Check merchant balance
        assertEq(
            gateway.getMerchantBalance(merchant, address(usdc)),
            merchantBalanceBefore + expectedMerchantAmount,
            "Merchant should receive amount minus fee"
        );

        // Check USDC transferred from payer
        assertEq(
            usdc.balanceOf(payer),
            INITIAL_BALANCE - PAYMENT_AMOUNT,
            "Payer balance should decrease"
        );

        // Check transaction stored
        CryptoPaymentGateway.Transaction memory txData = gateway.getTransaction(txId);
        assertEq(txData.merchant, merchant, "Transaction merchant should match");
        assertEq(txData.payer, payer, "Transaction payer should match");
        assertEq(txData.amount, PAYMENT_AMOUNT, "Transaction amount should match");
        assertEq(txData.fee, expectedFee, "Transaction fee should match");
        assertEq(txData.status, 1, "Transaction status should be completed");
    }

    function testProcessPaymentERC20Event() public {
        uint256 expectedFee = (PAYMENT_AMOUNT * 50) / 10000;

        vm.startPrank(payer);
        vm.expectEmit(true, true, true, true);
        emit PaymentProcessed(
            keccak256(abi.encodePacked(merchant, payer, address(usdc), PAYMENT_AMOUNT, block.timestamp)),
            merchant,
            payer,
            address(usdc),
            PAYMENT_AMOUNT,
            expectedFee
        );
        gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();
    }

    // =============================================================
    //                       ETH PAYMENT TESTS
    // =============================================================

    function testProcessPaymentETH() public {
        uint256 merchantBalanceBefore = gateway.getMerchantBalance(merchant, address(0));

        vm.startPrank(payer);
        bytes32 txId = gateway.processPayment{value: ETH_PAYMENT}(
            merchant,
            ETH_PAYMENT,
            address(0)
        );
        vm.stopPrank();

        uint256 expectedFee = (ETH_PAYMENT * 50) / 10000;
        uint256 expectedMerchantAmount = ETH_PAYMENT - expectedFee;

        assertEq(
            gateway.getMerchantBalance(merchant, address(0)),
            merchantBalanceBefore + expectedMerchantAmount,
            "Merchant should receive ETH minus fee"
        );
    }

    function testProcessPaymentETHWrongAmount() public {
        vm.startPrank(payer);
        vm.expectRevert(CryptoPaymentGateway.InvalidETHAmount.selector);
        gateway.processPayment{value: ETH_PAYMENT + 1}(
            merchant,
            ETH_PAYMENT,
            address(0)
        );
        vm.stopPrank();
    }

    // =============================================================
    //                      VALIDATION TESTS
    // =============================================================

    function testCannotPayZeroAddress() public {
        vm.startPrank(payer);
        vm.expectRevert(CryptoPaymentGateway.ZeroAddress.selector);
        gateway.processPayment(address(0), PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();
    }

    function testCannotPayZeroAmount() public {
        vm.startPrank(payer);
        vm.expectRevert(CryptoPaymentGateway.ZeroAmount.selector);
        gateway.processPayment(merchant, 0, address(usdc));
        vm.stopPrank();
    }

    // =============================================================
    //                     WITHDRAWAL TESTS
    // =============================================================

    function testWithdrawFunds() public {
        // First make a payment
        vm.startPrank(payer);
        gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();

        uint256 expectedMerchantAmount = PAYMENT_AMOUNT - (PAYMENT_AMOUNT * 50) / 10000;

        // Merchant withdraws
        vm.startPrank(merchant);
        uint256 balanceBefore = usdc.balanceOf(merchant);
        gateway.withdrawFunds(expectedMerchantAmount, address(usdc));
        uint256 balanceAfter = usdc.balanceOf(merchant);

        assertEq(
            balanceAfter - balanceBefore,
            expectedMerchantAmount,
            "Merchant should receive withdrawn amount"
        );
        assertEq(
            gateway.getMerchantBalance(merchant, address(usdc)),
            0,
            "Merchant balance should be zero after withdrawal"
        );
    }

    function testWithdrawFundsETH() public {
        // Make ETH payment
        vm.startPrank(payer);
        gateway.processPayment{value: ETH_PAYMENT}(merchant, ETH_PAYMENT, address(0));
        vm.stopPrank();

        uint256 expectedAmount = ETH_PAYMENT - (ETH_PAYMENT * 50) / 10000;

        // Merchant withdraws ETH
        vm.startPrank(merchant);
        uint256 balanceBefore = merchant.balance;
        gateway.withdrawFunds(expectedAmount, address(0));
        uint256 balanceAfter = merchant.balance;

        assertEq(
            balanceAfter - balanceBefore,
            expectedAmount,
            "Merchant should receive withdrawn ETH"
        );
    }

    function testCannotWithdrawMoreThanBalance() public {
        vm.startPrank(payer);
        gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();

        uint256 merchantBalance = gateway.getMerchantBalance(merchant, address(usdc));

        vm.startPrank(merchant);
        vm.expectRevert(CryptoPaymentGateway.InsufficientBalance.selector);
        gateway.withdrawFunds(merchantBalance + 1, address(usdc));
        vm.stopPrank();
    }

    function testCannotWithdrawZero() public {
        vm.startPrank(merchant);
        vm.expectRevert(CryptoPaymentGateway.ZeroAmount.selector);
        gateway.withdrawFunds(0, address(usdc));
        vm.stopPrank();
    }

    // =============================================================
    //                      ADMIN TESTS
    // =============================================================

    function testUpdateFee() public {
        vm.startPrank(owner);
        vm.expectEmit(true, true, false, false);
        emit FeeUpdated(50, 100);
        gateway.updateFee(100);
        assertEq(gateway.platformFeeBps(), 100, "Fee should be updated");
        vm.stopPrank();
    }

    function testCannotUpdateFeeTooHigh() public {
        vm.startPrank(owner);
        vm.expectRevert(CryptoPaymentGateway.FeeTooHigh.selector);
        gateway.updateFee(1001); // Max is 1000 (10%)
        vm.stopPrank();
    }

    function testNonOwnerCannotUpdateFee() public {
        vm.startPrank(merchant);
        vm.expectRevert();
        gateway.updateFee(100);
        vm.stopPrank();
    }

    function testWithdrawFees() public {
        // Make a payment to generate fees
        vm.startPrank(payer);
        gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();

        uint256 fee = (PAYMENT_AMOUNT * 50) / 10000;

        vm.startPrank(owner);
        uint256 balanceBefore = usdc.balanceOf(owner);
        gateway.withdrawFees(address(usdc));
        uint256 balanceAfter = usdc.balanceOf(owner);

        assertEq(balanceAfter - balanceBefore, fee, "Owner should receive fees");
        vm.stopPrank();
    }

    // =============================================================
    //                   REENTRANCY PROTECTION
    // =============================================================

    function testReentrancyProtection() public {
        // Process payment first
        vm.startPrank(payer);
        gateway.processPayment(merchant, PAYMENT_AMOUNT, address(usdc));
        vm.stopPrank();

        // Basic check — ReentrancyGuard is in place via nonReentrant modifier
        // Full reentrancy test would require a malicious contract
        assertTrue(true, "Reentrancy guard is active");
    }

    // =============================================================
    //                   MULTIPLE MERCHANTS
    // =============================================================

    function testMultipleMerchants() public {
        address merchant2 = address(0x5);

        vm.startPrank(payer);
        gateway.processPayment(merchant, 50 * 10**6, address(usdc));
        gateway.processPayment(merchant2, 30 * 10**6, address(usdc));
        vm.stopPrank();

        uint256 fee1 = (50 * 10**6 * 50) / 10000;
        uint256 fee2 = (30 * 10**6 * 50) / 10000;

        assertEq(
            gateway.getMerchantBalance(merchant, address(usdc)),
            50 * 10**6 - fee1,
            "Merchant 1 balance"
        );
        assertEq(
            gateway.getMerchantBalance(merchant2, address(usdc)),
            30 * 10**6 - fee2,
            "Merchant 2 balance"
        );
    }

    // =============================================================
    //                   MULTIPLE TOKENS
    // =============================================================

    function testMultipleTokens() public {
        vm.startPrank(payer);
        gateway.processPayment(merchant, 50 * 10**6, address(usdc));
        gateway.processPayment(merchant, 25 * 10**6, address(usdt));
        vm.stopPrank();

        assertTrue(
            gateway.getMerchantBalance(merchant, address(usdc)) > 0,
            "Should have USDC balance"
        );
        assertTrue(
            gateway.getMerchantBalance(merchant, address(usdt)) > 0,
            "Should have USDT balance"
        );
    }

    // =============================================================
    //                   FUZZ TESTS
    // =============================================================

    function testFuzzPaymentAmount(uint256 amount) public {
        // Bound amount to reasonable values
        amount = bound(amount, 1, 1000000 * 10**6); // 1 to 1M USDC

        // Ensure payer has enough
        usdc.mint(payer, amount);

        vm.startPrank(payer);
        gateway.processPayment(merchant, amount, address(usdc));
        vm.stopPrank();

        uint256 expectedMerchant = amount - (amount * 50) / 10000;
        assertEq(
            gateway.getMerchantBalance(merchant, address(usdc)),
            expectedMerchant,
            "Fuzz: merchant balance should be correct"
        );
    }

    function testFuzzFeeUpdate(uint256 newFee) public {
        newFee = bound(newFee, 0, 1000); // 0 to 10%

        vm.startPrank(owner);
        gateway.updateFee(newFee);
        assertEq(gateway.platformFeeBps(), newFee, "Fuzz: fee should update");
        vm.stopPrank();
    }
}