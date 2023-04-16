import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-dapp";

type ButtonProps = {
  Tezos: TezosToolkit;
  setContract: Dispatch<SetStateAction<any>>;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setParty: Dispatch<SetStateAction<string>>;
  setEpoch: Dispatch<SetStateAction<number>>;
  setOwnerPayment: Dispatch<SetStateAction<number>>;
  setOwnerPaid: Dispatch<SetStateAction<number>>;
  setOwnerRevert: Dispatch<SetStateAction<boolean>>;
  setCounterPayment: Dispatch<SetStateAction<number>>;
  setCounterPaid: Dispatch<SetStateAction<number>>;
  setCounterRevert: Dispatch<SetStateAction<boolean>>;
  contractAddress: string;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  wallet: BeaconWallet;
};

const ConnectButton = ({
  Tezos,
  setContract,
  setWallet,
  setUserAddress,
  setUserBalance,
  setIsAdmin,
  setParty,
  setEpoch,
  setOwnerPayment,
  setOwnerPaid,
  setOwnerRevert,
  setCounterPayment,
  setCounterPaid,
  setCounterRevert,
  contractAddress,
  setBeaconConnection,
  setPublicToken,
  wallet
}: ButtonProps): JSX.Element => {
  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);
    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());
    // creates contract instance
    const contract = await Tezos.wallet.at(contractAddress);
    const storage: any = await contract.storage();
    console.log(storage);
    setContract(contract);
    setIsAdmin(storage.admin.toString() === userAddress);
    setEpoch(storage.epoch);
    setOwnerPayment(storage.fromOwner);
    setOwnerPaid(storage.balanceOwner);
    setOwnerRevert(storage.revertOwner);
    setCounterPayment(storage.fromCounterparty);
    setCounterPaid(storage.balanceCounterparty);
    setCounterRevert(storage.revertCounterparty);
    if (storage.owner.toString() === userAddress)
      setParty("owner");
    else if (storage.counterparty.toString() === userAddress)
      setParty("counterparty");
    else
      setParty("none");
  };

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.GHOSTNET,
          rpcUrl: "https://ghostnet.ecadinfra.com"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
    } catch (error: any) {
      if (error.message === undefined)
        console.log(error);
      else
        alert(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      // creates a wallet instance
      const wallet = new BeaconWallet({
        name: "MiniProj02: Escrow Contract",
        preferredNetwork: NetworkType.GHOSTNET,
        disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
        eventHandlers: {
          // To keep the pairing alert, we have to add the following default event handlers back
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: data => setPublicToken(data.publicKey)
          }
        }
      });
      Tezos.setWalletProvider(wallet);
      setWallet(wallet);
      // checks if wallet was connected before
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        setBeaconConnection(true);
      }
    })();
  }, []);

  return (
    <div className="buttons">
      <button className="button" onClick={connectWallet}>
        <span>
          <i className="fas fa-wallet"></i>&nbsp; Connect wallet
        </span>
      </button>
    </div>
  );
};

export default ConnectButton;
