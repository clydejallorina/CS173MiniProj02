Instructions for starting the project:

    Familiarize yourself with the basics of Tezos blockchain and smart contract development using SmartPy.
    Install Taquito.js library and any other dependencies required for your frontend application.
    Connect to a Tezos node using Taquito.js.
    Deploy the Escrow contract on the Tezos blockchain using SmartPy.
    Use Taquito.js to interact with the Escrow contract from your frontend application.


Explanation of the Smart Contract:
The Escrow contract is a simple contract that allows two parties (owner and counterparty) to deposit funds into an escrow account. The funds can only be claimed by the owner or counterparty after a specified epoch time and only if the correct hashed secret is provided. The contract also ensures that each party can only deposit funds once.

Project Milestones:

    Milestone 1: Set up the development environment, install dependencies, and deploy the Escrow contract using SmartPy. Verify that the contract has been deployed successfully by reading the contract storage.
    Milestone 2: Use Taquito.js to create a UI for the Escrow contract, including a form for depositing funds into the escrow account and a button for claiming funds. Test the UI by depositing funds from both parties into the escrow account.
    Milestone 3: Implement the functionality for claiming funds by both parties. This involves creating functions in Taquito.js that call the appropriate entry points in the Escrow contract and passing the correct parameters.
    Milestone 4: Implement the ability for the admin to revert funds from the contract in case both parties accept to withdraw the escrow. This involves adding a new entry point to the Escrow contract that can only be called by the admin, and modifying the existing entry points to include a check for whether the admin has authorized the withdrawal. In the frontend application, create a new button and form that allows the admin to initiate the fund reversion process. This should involve sending a transaction to the Escrow contract with the appropriate parameters. Once the admin has authorized the withdrawal, the funds should be returned to their respective parties. This milestone requires a deeper understanding of the Escrow contract and may be more challenging than the previous milestones. It is important to thoroughly test the contract and frontend application to ensure that everything is working correctly.
    Milestone 5: Implement additional features, such as error handling, confirmation messages, and UI improvements. Test the final application thoroughly to ensure that it works as expected.

NEW FUNCTIONS TO ADD TO THE CONTRACT:
1. Milestone 4: Revert funds from contract. Can only be called by admin.

Directory `react-escrow-client` is derived from [this React Template](https://github.com/ecadlabs/taquito-react-template).
