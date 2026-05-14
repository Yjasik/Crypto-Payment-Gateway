// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CryptoPaymentGateway.sol";

contract DeploySepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer address:", deployer);
        console.log("Network: Sepolia");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy payment gateway only (без MockERC20)
        CryptoPaymentGateway gateway = new CryptoPaymentGateway(deployer);
        console.log("CryptoPaymentGateway deployed at:", address(gateway));

        vm.stopBroadcast();

        console.log("\n=== Deploy Complete ===");
        console.log("Gateway address:", address(gateway));
        console.log("\nAdd to src/lib/constants/contracts.ts:");
        console.log("SEPOLIA_GATEWAY_ADDRESS:", address(gateway));
    }
}
