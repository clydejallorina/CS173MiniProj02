import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface OwnerOperationsProps {
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
  fromOwner: number;
  ownerPaid: any;
  ownerRevert: boolean;
}

const OwnerOperations = ({
    contract,
    setUserBalance,
    Tezos,
    userAddress,
    isAdmin,
    fromOwner,
    party,
    ownerPaid,
    ownerRevert,
    setEpoch,
    setParty,
    setOwnerPayment,
    setOwnerPaid,
    setOwnerRevert,
    setCounterPayment,
    setCounterPaid,
    setCounterRevert,
  }: OwnerOperationsProps) => {
    const [loadingOwnerAddBalance, setLoadingOwnerAddBalance] = useState<boolean>(false);
    const [loadingOwnerClaim, setLoadingOwnerClaim] = useState<boolean>(false);
    const [loadingOwnerRevert, setLoadingOwnerRevert] = useState<boolean>(false);
  
    const [secret, setSecret] = useState<string>("");
  
    const ownerPayEscrow = async (): Promise<void> => {
        setLoadingOwnerAddBalance(true);
        try {
            const op = await contract.methods.addBalanceOwner().send({amount: fromOwner, mutez: true});
            await op.confirmation();
            const newStorage: any = await contract.storage();
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
            setLoadingOwnerAddBalance(false);
        }
    }

    const ownerClaimEscrow = async (): Promise<void> => {
      setLoadingOwnerClaim(true);
      try {
          const op = await contract.methods.claimOwner().send();
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
          setLoadingOwnerClaim(false);
      }
  }

  const ownerRevertEscrow = async (): Promise<void> => {
    setLoadingOwnerRevert(true);
    try {
        const op = await contract.methods.ownerRevert(new Buffer(secret).toString("hex")).send();
        await op.confirmation();
        const newStorage: any = await contract.storage();
        setOwnerRevert(newStorage.revertOwner);
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
        setLoadingOwnerRevert(false);
    }
  }

  const handleSecretInput = (event: any) => {
    setSecret(event.target.value);
  }
  
  if (!contract && !userAddress) return <div>&nbsp;</div>;
  return (
    <div>
      {
        ownerPaid.eq(0) ? (
          loadingOwnerAddBalance ? (
              <span>
                  <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
              </span>
          ) : (
              <div>
                <button onClick={ownerPayEscrow}>
                  <span>
                    Pay {fromOwner / 1000000} tez to the Escrow
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
      {
        loadingOwnerClaim ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <div>
            <button onClick={ownerClaimEscrow}>
              <span>
                Attempt Claim from Escrow
              </span>
            </button>
          </div>
        )
      }
      {
        loadingOwnerRevert ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <div>
            <input onChange={handleSecretInput} placeholder="Input secret (AS TEXT)" type="text"></input>
            <button onClick={ownerRevertEscrow}>
              <span>
                {ownerRevert ? "Disallow": "Allow"} Admin To Revert Transaction
              </span>
            </button>
          </div>
        )
      }
      <br></br>
    </div>
  );
};
  
export default OwnerOperations;
  