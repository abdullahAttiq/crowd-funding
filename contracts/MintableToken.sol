// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract MintableToken {
    uint256 public totalSupply;

    // just a sample contract
    function mint(uint256 _value) public {
        totalSupply += _value;
    }
}
