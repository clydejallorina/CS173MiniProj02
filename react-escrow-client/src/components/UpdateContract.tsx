import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface UpdateContractProps {
  contract: WalletContract | any;
  setUserBalance: Dispatch<SetStateAction<any>>;
  setEpoch: Dispatch<SetStateAction<number>>;
  Tezos: TezosToolkit;
  userAddress: string;
  isAdmin: boolean;
  party: string;
}

const UpdateContract = ({
  contract,
  setUserBalance,
  Tezos,
  userAddress,
  isAdmin,
  party,
  setEpoch,
}: UpdateContractProps) => {
  const [loadingAdminSetEpoch, setLoadingAdminSetEpoch] = useState<boolean>(false);
  const [loadingAdminSetPartyPayments, setLoadingAdminPartyPayments] = useState<boolean>(false);
  const [loadingAdminSetParties, setLoadingAdminSetParties] = useState<boolean>(false);
  const [loadingAdminRevert, setLoadingAdminRevert] = useState<boolean>(false);
  const [loadingOwnerAddBalance, setLoadingOwnerAddBalance] = useState<boolean>(false);
  const [loadingOwnerClaim, setLoadingOwnerClaim] = useState<boolean>(false);
  const [loadingOwnerRevert, setLoadingOwnerRevert] = useState<boolean>(false);
  const [loadingCounterpartyAddBalance, setCounterpartyAddBalance] = useState<boolean>(false);
  const [loadingCounterpartyClaim, setLoadingCounterpartyClaim] = useState<boolean>(false);
  const [loadingCounterpartyRevert, setLoadingCounterpartyRevert] = useState<boolean>(false);

  const [adminEpoch, setAdminEpoch] = useState<number>(0);
  const [adminOwnerPayment, setAdminOwnerPayment] = useState<number>(0);
  const [adminCounterPayment, setAdminCounterPayment] = useState<number>(0);

  const adminSetEpoch = async (): Promise<void> => {
    setLoadingAdminSetEpoch(true);
    try {
      const op = await contract.methods.adminSetEpoch(adminEpoch).send();
      await op.confirmation();
      const newStorage: any = await contract.storage();
      setEpoch(newStorage.epoch);
      setUserBalance(await Tezos.tz.getBalance(userAddress));
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoadingAdminSetEpoch(false);
    }
  }

  const handleAdminEpochInput = (event:any) => {
    console.log(event.target.value);
    setAdminEpoch(event.target.value);
  }

  if (!contract && !userAddress) return <div>&nbsp;</div>;
  return (
    <div className="buttons">
      {
        isAdmin && loadingAdminSetEpoch ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <div>
            <input onChange={handleAdminEpochInput} placeholder="1682179199"></input>
            <button onClick={adminSetEpoch}>
              <span>
                Set Epoch
              </span>
            </button>
          </div>
        )
      }
    </div>
  );
};

export default UpdateContract;
