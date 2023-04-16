import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface CounterOperationsProps {
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
  fromCounter: number;
  counterPaid: any;
  counterRevert: boolean;
}

interface SecretParams {
  secret: any;
}

const CounterOperations = ({
    contract,
    setUserBalance,
    Tezos,
    userAddress,
    isAdmin,
    fromCounter,
    counterPaid,
    counterRevert,
    party,
    setEpoch,
    setParty,
    setOwnerPayment,
    setOwnerPaid,
    setOwnerRevert,
    setCounterPayment,
    setCounterPaid,
    setCounterRevert,
  }: CounterOperationsProps) => {
    const [loadingCounterAddBalance, setLoadingCounterAddBalance] = useState<boolean>(false);
    const [loadingCounterClaim, setLoadingCounterClaim] = useState<boolean>(false);
    const [loadingCounterRevert, setLoadingCounterRevert] = useState<boolean>(false);
  
    const [secret, setSecret] = useState<string>("");
  
    const CounterPayEscrow = async (): Promise<void> => {
        setLoadingCounterAddBalance(true);
        try {
            const op = await contract.methods.addBalanceCounterparty().send({amount: fromCounter, mutez: true});
            await op.confirmation();
            const newStorage: any = await contract.storage();
            setCounterPaid(newStorage.balanceCounterparty);
            setUserBalance(await Tezos.tz.getBalance(userAddress));
        }
        catch (error: any) {
            if (error.message === undefined)
                console.log(error);
            else
                alert(error.message);
        }
        finally {
            setLoadingCounterAddBalance(false);
        }
    }

    const CounterClaimEscrow = async (): Promise<void> => {
      setLoadingCounterClaim(true);
      try {
          const op = await contract.methods.claimCounterparty(new Buffer(secret).toString("hex")).send();
          await op.confirmation();
          const newStorage: any = await contract.storage();
          setCounterPaid(newStorage.balanceCounterparty);
          setOwnerPaid(newStorage.balanceOwner);
          setUserBalance(await Tezos.tz.getBalance(userAddress));
      }
      catch (error: any) {
          if (error.message === undefined)
              console.log(error);
          else
              alert(error.message);
      }
      finally {
          setLoadingCounterClaim(false);
      }
  }

  const CounterRevertEscrow = async (): Promise<void> => {
    setLoadingCounterRevert(true);
    try {
        const op = await contract.methods.counterpartyRevert(new Buffer(secret).toString("hex")).send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        setCounterRevert(newStorage.revertCounterparty);
        setUserBalance(await Tezos.tz.getBalance(userAddress));
    }
    catch (error: any) {
      console.log(error);
      if (error.message === undefined)
          console.log(error);
      else
          alert(error.message);
    }
    finally {
        setLoadingCounterRevert(false);
    }
  }

  const handleSecretInput = (event: any) => {
    setSecret(event.target.value);
  }
  
  if (!contract && !userAddress) return <div>&nbsp;</div>;
  return (
    <div>
      {
        counterPaid.eq(0) ? (
          loadingCounterAddBalance ? (
              <span>
                  <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
              </span>
          ) : (
              <div>
                <button onClick={CounterPayEscrow}>
                  <span>
                    Pay {fromCounter / 1000000} tez to the Escrow
                  </span>
                </button>
              </div>
          )
        ) : (
          <div>
            <p>You have already paid the required sum.</p>
          </div>
        )
      }
      <input onChange={handleSecretInput} placeholder="Input secret" type="text"></input>
      {
        loadingCounterClaim ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <div>
            <button onClick={CounterClaimEscrow}>
              <span>
                Attempt Claim from Escrow
              </span>
            </button>
          </div>
        )
      }
      {
        loadingCounterRevert ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <div>
            <button onClick={CounterRevertEscrow}>
              <span>
                {counterRevert ? "Disallow": "Allow"} Admin To Revert Transaction
              </span>
            </button>
          </div>
        )
      }
      <br></br>
    </div>
  );
};
  
  export default CounterOperations;
  