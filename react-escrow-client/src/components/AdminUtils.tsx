import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface AdminUtilsProps {
  contract: WalletContract | any;
  setUserBalance: Dispatch<SetStateAction<any>>;
  setEpoch: Dispatch<SetStateAction<number>>;
  setParty: Dispatch<SetStateAction<string>>;
  setOwnerPayment: Dispatch<SetStateAction<number>>;
  setOwnerPaid: Dispatch<SetStateAction<number>>;
  setOwnerRevert: Dispatch<SetStateAction<boolean>>;
  setCounterPayment: Dispatch<SetStateAction<number>>;
  setCounterPaid: Dispatch<SetStateAction<number>>;
  setCounterRevert: Dispatch<SetStateAction<boolean>>;
  Tezos: TezosToolkit;
  userAddress: string;
  isAdmin: boolean;
  party: string;
}

interface PartyPayments {
  newFromOwner: number;
  newFromCounterparty: number;
}

interface Parties {
  newOwner: string;
  newCounterparty: string;
}

const AdminUtils = ({
    contract,
    setUserBalance,
    Tezos,
    userAddress,
    isAdmin,
    party,
    setEpoch,
    setParty,
    setOwnerPayment,
    setOwnerPaid,
    setOwnerRevert,
    setCounterPayment,
    setCounterPaid,
    setCounterRevert,
  }: AdminUtilsProps) => {
    const [loadingAdminSetEpoch, setLoadingAdminSetEpoch] = useState<boolean>(false);
    const [loadingAdminSetPartyPayments, setLoadingAdminPartyPayments] = useState<boolean>(false);
    const [loadingAdminSetParties, setLoadingAdminSetParties] = useState<boolean>(false);
    const [loadingAdminRevert, setLoadingAdminRevert] = useState<boolean>(false);
  
    const [adminEpoch, setAdminEpoch] = useState<number>(0);
    const [adminOwnerPayment, setAdminOwnerPayment] = useState<number>(0);
    const [adminCounterPayment, setAdminCounterPayment] = useState<number>(0);
    const [adminNewOwner, setAdminNewOwner] = useState<string>("");
    const [adminNewCounter, setAdminNewCounter] = useState<string>("");
  
    const adminSetEpoch = async (): Promise<void> => {
      setLoadingAdminSetEpoch(true);
      try {
        const op = await contract.methods.adminSetEpoch(adminEpoch).send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        setEpoch(newStorage.epoch);
        setUserBalance(await Tezos.tz.getBalance(userAddress));
      }
      catch (error: any) {
        if (error.message === undefined)
          console.log(error);
        else
          alert(error.message);
      }
      finally {
        setLoadingAdminSetEpoch(false);
      }
    }

    const adminSetPartyPayments = async (): Promise<void> => {
      setLoadingAdminPartyPayments(true);
      try {
        const parameters: PartyPayments = {
          newFromOwner: adminOwnerPayment,
          newFromCounterparty: adminCounterPayment
        };
        const op = await contract.methods.adminSetPartyPayments(parameters).send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        setOwnerPayment(newStorage.fromOwner);
        setCounterPayment(newStorage.fromCounterparty);
        setUserBalance(await Tezos.tz.getBalance(userAddress));
      }
      catch (error: any) {
        if (error.message === undefined)
          console.log(error);
        else
          alert(error.message);
      }
      finally {
        setLoadingAdminPartyPayments(false);
      }
    }

    const adminSetParties = async (): Promise<void> => {
      setLoadingAdminSetParties(true);
      try {
        const parameters: Parties = {
          newOwner: adminNewOwner,
          newCounterparty: adminNewCounter,
        };
        const op = await contract.methods.adminSetPartyPayments(parameters).send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        if (newStorage.owner === userAddress)
          setParty("owner");
        else if (newStorage.counterparty === userAddress)
          setParty("counterparty");
        else
          setParty("none");
        setUserBalance(await Tezos.tz.getBalance(userAddress));
      }
      catch (error: any) {
        if (error.message === undefined)
          console.log(error);
        else
          alert(error.message);
      }
      finally {
        setLoadingAdminSetParties(false);
      }
    }

    const adminRevert = async (): Promise<void> => {
      setLoadingAdminRevert(true);
      try {
        const op = await contract.methods.adminRevertOperation().send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        setOwnerPayment(newStorage.fromOwner);
        setOwnerPaid(newStorage.balanceOwner);
        setOwnerRevert(newStorage.revertOwner);
        setCounterPayment(newStorage.fromCounterparty);
        setCounterPaid(newStorage.balanceCounterparty);
        setCounterRevert(newStorage.revertCounterparty);
        setUserBalance(await Tezos.tz.getBalance(userAddress));
      }
      catch (error: any) {
        if (error.message === undefined)
          console.log(error);
        else
          alert(error.message);
      }
      finally {
        setLoadingAdminRevert(false);
      }
    }
  
    const handleAdminEpochInput = (event:any) => {
      setAdminEpoch(event.target.value);
    }

    const handleAdminOwnerPaymentInput = (event:any) => {
      setAdminOwnerPayment(event.target.value);
    }

    const handleAdminCounterPaymentInput = (event:any) => {
      setAdminCounterPayment(event.target.value);
    }

    const handleAdminOwnerInput = (event:any) => {
      setAdminNewOwner(event.target.value);
    }

    const handleAdminCounterInput = (event:any) => {
      setAdminNewCounter(event.target.value);
    }
  
    if (!contract && !userAddress) return <div>&nbsp;</div>;
    return (
      <div>
        {
          loadingAdminSetEpoch ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
            </span>
          ) : (
            <div>
              <input onChange={handleAdminEpochInput} placeholder="1682179199" type="number"></input>
              <button onClick={adminSetEpoch}>
                <span>
                  Set Epoch
                </span>
              </button>
            </div>
          )
        }
        <br></br>
        {
          loadingAdminSetPartyPayments ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
            </span>
          ) : (
            <div>
              <input onChange={handleAdminOwnerPaymentInput} placeholder="newFromOwner" type="number"></input>
              <input onChange={handleAdminCounterPaymentInput} placeholder="newFromCounterparty" type="number"></input>
              <button onClick={adminSetPartyPayments}>
                <span>
                  Set Party Payments
                </span>
              </button>
            </div>
          )
        }
        <br></br>
        {
          loadingAdminSetParties ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
            </span>
          ) : (
            <div>
              <input onChange={handleAdminOwnerInput} placeholder="newOwner" type="text"></input>
              <input onChange={handleAdminCounterInput} placeholder="newCounterparty" type="text"></input>
              <button onClick={adminSetParties}>
                <span>
                  Set Parties
                </span>
              </button>
            </div>
          )
        }
        <br></br>
        {
          loadingAdminRevert ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
            </span>
          ) : (
            <div>
              <button onClick={adminRevert}>
                <span>
                  Revert Transaction
                </span>
              </button>
            </div>
          )
        }
      </div>
    );
  };
  
  export default AdminUtils;
  