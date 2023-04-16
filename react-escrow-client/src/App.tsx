import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import UpdateContract from "./components/UpdateContract";
import Transfers from "./components/Transfers";
import AdminUtils from "./components/AdminUtils";

enum BeaconConnection {
  NONE = "",
  LISTENING = "Listening to P2P channel",
  CONNECTED = "Channel connected",
  PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
  PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
}

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://ghostnet.smartpy.io")
  );
  const [contract, setContract] = useState<any>(undefined);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [party, setParty] = useState<string>("");
  const [epoch, setEpoch] = useState<number>(0);
  const [ownerPayment, setOwnerPayment] = useState<number>(0);
  const [ownerPaid, setOwnerPaid] = useState<number>(0);
  const [ownerRevert, setOwnerRevert] = useState<boolean>(false);
  const [counterPayment, setCounterPayment] = useState<number>(0);
  const [counterPaid, setCounterPaid] = useState<number>(0);
  const [counterRevert, setCounterRevert] = useState<boolean>(false);
  
  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("transfer");

  // Ghostnet Increment/Decrement contract
  const contractAddress: string = "KT1EfV6G1166bu7GMWovdEADQuoHecmEv4nB";

  const generateQrCode = (): { __html: string } => {
    const qr = qrcode(0, "L");
    qr.addData(publicToken || "");
    qr.make();

    return { __html: qr.createImgTag(4) };
  };

  if (publicToken && (!userAddress || isNaN(userBalance))) { // Connecting to wallet via Beacon...
    return (
      <div className="main-box">
        <h1>Mini Project 2: Escrow Contract</h1>
        <div id="dialog">
          <div id="content">
            <p className="text-align-center">
              <i className="fas fa-broadcast-tower"></i>&nbsp; Connecting to
              your wallet
            </p>
            <div
              dangerouslySetInnerHTML={generateQrCode()}
              className="text-align-center"
            ></div>
            <p id="public-token">
              {copiedPublicToken ? (
                <span id="public-token-copy__copied">
                  <i className="far fa-thumbs-up"></i>
                </span>
              ) : (
                <span
                  id="public-token-copy"
                  onClick={() => {
                    if (publicToken) {
                      navigator.clipboard.writeText(publicToken);
                      setCopiedPublicToken(true);
                      setTimeout(() => setCopiedPublicToken(false), 2000);
                    }
                  }}
                >
                  <i className="far fa-copy"></i>
                </span>
              )}

              <span>
                Public token: <span>{publicToken}</span>
              </span>
            </p>
            <p className="text-align-center">
              Status: {beaconConnection ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
  } else if (userAddress && !isNaN(userBalance)) { // Successfully obtained user address and balance from Beacon
    return (
      <div className="main-box">
        <h1>Mini Project 2: Escrow Contract</h1>
        <div id="tabs">
          { // TODO: Add Admin tab for contract admin, Deposit tab for Owner/Counterparty, Claim tab for Owner/Counterparty
          /* <div
            id="transfer"
            className={activeTab === "transfer" ? "active" : ""}
            onClick={() => setActiveTab("transfer")}
          >
            Make a transfer
          </div> */}
          <div
            id="contract"
            className={activeTab === "contract" ? "active" : ""}
            onClick={() => setActiveTab("contract")}
          >
            Interact with a contract
          </div>
        </div>
        <div id="dialog">
          <div id="content">
            {activeTab === "transfer" ? (
              <div id="transfers">
                <h3 className="text-align-center">Make a transfer</h3>
                <Transfers
                  Tezos={Tezos}
                  setUserBalance={setUserBalance}
                  userAddress={userAddress}
                />
              </div>
            ) : (
              <div>
                {!beaconConnection ? (<span><i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait</span>) : (
                  <div>
                    <div className="text-align-center">
                      <p>Is Admin: <span>{isAdmin.toString()}</span></p>
                      <p>Is Owner: <span>{(party === "owner").toString()}</span></p>
                      <p>Is Counterparty: <span>{(party === "counterparty").toString()}</span></p>
                      <p>Epoch: <span>{epoch.toString()}</span></p>
                      <p>Owner Payment: <span>{ownerPayment.toString()}</span></p>
                      <p>Owner Paid: <span>{ownerPaid.toString()}</span></p>
                      <p>Owner Revoke: <span>{ownerRevert.toString()}</span></p>
                      <p>Counterparty Payment: <span>{counterPayment.toString()}</span></p>
                      <p>Counterparty Paid: <span>{counterPaid.toString()}</span></p>
                      <p>Counterparty Revoke: <span>{counterRevert.toString()}</span></p>
                    </div>
                    {
                      isAdmin ? (
                        <AdminUtils
                          contract={contract}
                          setUserBalance={setUserBalance}
                          Tezos={Tezos}
                          userAddress={userAddress}
                          isAdmin={isAdmin}
                          party={party}
                          setEpoch={setEpoch}
                          setParty={setParty}
                          setOwnerPayment={setOwnerPayment}
                          setOwnerPaid={setOwnerPaid}
                          setOwnerRevert={setOwnerRevert}
                          setCounterPayment={setCounterPayment}
                          setCounterPaid={setCounterPaid}
                          setCounterRevert={setCounterRevert}
                        />
                      ) : (<span></span>)
                    }
                  </div>
                )}
              </div>
            )}
            <p>
              <i className="far fa-file-code"></i>&nbsp;
              <a
                href={`https://better-call.dev/ghostnet/${contractAddress}/operations`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contractAddress}
              </a>
            </p>
            <p>
              <i className="far fa-address-card"></i>&nbsp; {userAddress}
            </p>
            <p>
              <i className="fas fa-piggy-bank"></i>&nbsp;
              {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
            </p>
          </div>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
  } else if (!publicToken && !userAddress && !userBalance) {
    return (
      <div className="main-box">
        <div className="title">
          <h1>Mini Project 2: Escrow Contract</h1>
        </div>
        <div id="dialog">
          <header>Awaiting wallet information...</header>
          <div id="content">
            <p>Hello!</p>
            <p>
              This dApp was made using the 
              <a
                href="https://github.com/ecadlabs/taquito-react-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                Taquito React template
              </a>
            </p>
            <p>Use the Connect button below to interact with the Escrow contract.</p>
          </div>
          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setIsAdmin={setIsAdmin}
            setParty={setParty}
            setEpoch={setEpoch}
            setOwnerPayment={setOwnerPayment}
            setOwnerPaid={setOwnerPaid}
            setOwnerRevert={setOwnerRevert}
            setCounterPayment={setCounterPayment}
            setCounterPaid={setCounterPaid}
            setCounterRevert={setCounterRevert}
            contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
          />
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
  } else {
    return <div>An error has occurred</div>;
  }
};

export default App;
