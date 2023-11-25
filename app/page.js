
"use client";
import React, { useState, useEffect } from "react";
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
// Knowledge about Ether.js https://docs.ethers.org/v6/getting-started/
import { ethers } from "ethers";
import { formatEther, parseUnits } from "ethers";
import abi from "./abi.json";


const [ metaMask , hooks ] = initializeConnector((actions) => new MetaMask({ actions }))
const { useChainId , useAccounts, useIsActivating , useIsActive , useProvider } = hooks
const contractChain = 11155111 
const contractAddress = '0xfA8586F464D059E23bcd6F60F55295232769b8f9'


export default function Home() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActive = useIsActive()
  const provider = useProvider()
  const [error, setError] = useState(undefined)

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  }, [])

  //เชือ่มต่อ
  const handleConnect = () => {
    metaMask.activate(contractChain)
  }
  //ยกเลิกการเชื่อมต่อ
  const handleDisconnect = () => {
    metaMask.resetState()
  }

  const [ balance , setBalance ] = useState("") 
  useEffect (() => {
    const fetchBalance = async () => {
      const signer = provider.getSigner()
      const smartContract = new ethers.Contract( contractAddress, abi , signer )
      const myBalance = await smartContract.balanceOf(accounts[0])
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance))
      
    }
    if (isActive) {
      fetchBalance()
    }
  },[isActive])


  
  const [aonValue, setAonValue] = useState(0);

  const handleSetAonValue = event => {
    setAonValue(event.target.value);
  };

  const handleBuy = async () => {
    try {
      if (aonValue <= 0) {
        return;
      }

      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const buyValue = parseUnits(aonValue.toString(), "ether");
      const tx = await smartContract.buy({
        value: buyValue.toString(),
      });
      console.log("Transaction hash:", tx.hash);
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <div className="container mx-auto justify-center">
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-neutral text-xl">My wallet</a>
      </div>
      {isActive ? (
          <>
            <div className="navbar-end">
              <a className="btn btn-accent text-xl" onClick={handleDisconnect}>
                Disconnect
              </a>
            </div>
          </>
        ) : (
          <div className="navbar-end">
            <a className="btn btn-accent text-xl" onClick={handleConnect}>
              Connect
            </a>
          </div>
        )}
      </div>
    {isActive ? (
      <>
      <div className="container mx-auto flex justify-center mt-10">
      <div className="card w-96 bg-neutral text-neutral-content w-[60%]">
      <div className="card-body items-center text-center mt-3">
        <h2 className="card-title text-4xl">My wallet balance !</h2>
        <p>You can transfer tokens to this address.</p>
        <h2 className="card-title text-xl">Address</h2>
        <input 
          id="outlined-basic"
          label="Address"
          value={accounts && accounts.length > 0 ? accounts[0] : ""}
          className="input input-bordered input-info   w-full max-w-xl text-center" />
          <h2 className="card-title text-xl mt-2">Aon Balance</h2>
        <input 
          id="outlined-basic"
          label="Aon Balance"
          value={balance}
          className="input input-bordered input-accent  w-full max-w-xl text-center" />
        
          <h2 className="card-title text-xl mt-5">Buy Aon Token</h2>
          <input 
            id="outlined-required"
            label="Enter amount of Ether you want to buy Aon Token"
            defaultValue=""
            type="number"
            onChange={handleSetAonValue}
            className="input input-bordered input-primary w-full max-w-xl text-center" />
          <button className="btn btn-secondary mt-5 text-white" onClick={handleBuy}> Buy Aon Token</button>
      </div>
    </div>
  </div>
  </>
  ) : (
    <div className="container mx-auto flex justify-center mt-52">
        <h2 className="card-title text-4xl">Please log in to your metamask !</h2>
    </div>
  )}
  </div>
    
  );
  
}
