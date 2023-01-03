// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract UserInfo {
    struct info {
        string name;
        uint cnic;
    }
    info[] public userInfo;
    uint arraySize = 0;

    function addInfo(string memory name, uint cnic) public {
        userInfo.push(info(name, cnic));
        arraySize++;
    }
}
