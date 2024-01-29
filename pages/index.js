import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [pin, setPin] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(1);
  const [isPinSet, setIsPinSet] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        // Check if pin is set before processing the deposit
        if (!isPinSet) {
          alert("Please set your PIN before making a transaction.");
          return;
        }

        // Here you can add additional logic for pin verification with your smart contract
        // For example, if there is a function verifyPin in your contract:
        // const isPinVerified = await atm.verifyPin(pin);

        // For the sake of this example, we're assuming the pin is verified successfully
        const isPinVerified = true;

        if (isPinVerified) {
          let tx = await atm.deposit(transactionAmount);
          await tx.wait();
          getBalance();
        } else {
          alert("Invalid PIN. Please try again.");
        }
      } catch (error) {
        console.error("Deposit error:", error);
        alert("Error occurred during deposit. Please try again.");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        // Check if pin is set before processing the withdrawal
        if (!isPinSet) {
          alert("Please set your PIN before making a transaction.");
          return;
        }

        // Here you can add additional logic for pin verification with your smart contract
        // For example, if there is a function verifyPin in your contract:
        // const isPinVerified = await atm.verifyPin(pin);

        // For the sake of this example, we're assuming the pin is verified successfully
        const isPinVerified = true;

        if (isPinVerified) {
          let tx = await atm.withdraw(transactionAmount);
          await tx.wait();
          getBalance();
        } else {
          alert("Invalid PIN. Please try again.");
        }
      } catch (error) {
        console.error("Withdrawal error:", error);
        alert("Error occurred during withdrawal. Please try again.");
      }
    }
  };

  const setPinAndConfirm = () => {
    if (pin !== confirmedPin) {
      alert("Pin and Confirm Pin must match");
      return;
    }

    // Here you can call a contract function to set the pin.
    // For example, if there is a function setPin in your contract:
    // await atm.setPin(pin);

    // For the sake of this example, we're just logging the pin.
    console.log("Pin set:", pin);

    setIsPinSet(true);
  };

  const handleTransactionAmountChange = (event) => {
    setTransactionAmount(event.target.value);
  };

  const handlePinChange = (event) => {
    setPin(event.target.value);
  };

  const handleConfirmedPinChange = (event) => {
    setConfirmedPin(event.target.value);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>Please connect your Metamask wallet</button>
        </div>
      );
    }

    if (!isPinSet) {
      return (
        <div>
          <label>
            Set PIN:
            <input type="password" value={pin} onChange={handlePinChange} />
          </label>
          <br />
          <label>
            Confirm PIN:
            <input type="password" value={confirmedPin} onChange={handleConfirmedPinChange} />
          </label>
          <br />
          <button onClick={setPinAndConfirm}>Set PIN</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Transaction Amount:
          <input
            type="number"
            value={transactionAmount}
            onChange={handleTransactionAmountChange}
          />
        </label>
        <button onClick={deposit} disabled={!isPinSet}>
          Deposit
        </button>
        <button onClick={withdraw} disabled={!isPinSet}>
          Withdraw
        </button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #d2b48c; /* Light Brown */
        }
      `}</style>
    </main>
  );
}

