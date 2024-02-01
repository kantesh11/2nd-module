// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    Transaction[] public transactions;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);
    event TransactionCleared();

    struct Transaction {
        address account;
        string action; // "Deposit" or "Withdraw"
        uint256 amount;
    }

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        transactions.push(Transaction({ account: msg.sender, action: "Deposit", amount: _amount }));
        emit Deposit(msg.sender, _amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({ balance: balance, withdrawAmount: _withdrawAmount });
        }
        balance -= _withdrawAmount;
        transactions.push(Transaction({ account: msg.sender, action: "Withdraw", amount: _withdrawAmount }));
        emit Withdraw(msg.sender, _withdrawAmount);
    }

   
 function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint index) public view returns (address, string memory, uint256) {
        require(index < transactions.length, "Invalid index");
        Transaction memory transaction = transactions[index];
        return (transaction.account, transaction.action, transaction.amount);
    }

    function clearTransactionHistory() public {
        require(msg.sender == owner, "You are not the owner of this account");
        delete transactions;
        emit TransactionCleared();
    }
}
