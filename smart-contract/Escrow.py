# Escrow - Example for illustrative purposes only.

# Contract deployed at Ghostnet (KT1EfV6G1166bu7GMWovdEADQuoHecmEv4nB)

import smartpy as sp

class Escrow(sp.Contract):
    def __init__(self, owner, fromOwner, counterparty, fromCounterparty, epoch, hashedSecret, admin):
        self.init(
            fromOwner           = fromOwner,
            fromCounterparty    = fromCounterparty,
            balanceOwner        = sp.tez(0),
            balanceCounterparty = sp.tez(0),
            hashedSecret        = hashedSecret,
            epoch               = epoch,
            owner               = owner,
            counterparty        = counterparty,
            admin               = admin,
            revertOwner         = False,
            revertCounterparty  = False,
        )

    @sp.entry_point
    def adminSetEpoch(self, params):
        sp.verify(sp.sender == self.data.admin, "INSUFFICIENT PRIVILEGES")
        sp.verify(sp.now < params.newEpoch, "EPOCH MUST BE AFTER CURRENT TIME")
        self.data.epoch = params.newEpoch

    @sp.entry_point
    def adminSetPartyPayments(self, params):
        sp.verify(sp.sender == self.data.admin, "INSUFFICIENT PRIVILEGES")
        self.data.fromOwner = params.newFromOwner
        self.data.fromCounterparty = params.newFromCounterparty

    @sp.entry_point
    def adminSetParties(self, params):
        sp.verify(sp.sender == self.data.admin, "INSUFFICIENT PRIVILEGES")
        self.data.owner = params.newOwner
        self.data.counterparty = params.newCounterparty

    @sp.entry_point
    def adminRevertOperation(self):
        sp.verify(sp.sender == self.data.admin, "INSUFFICIENT PRIVILEGES")
        sp.verify(self.data.revertOwner, "OWNER DID NOT APPROVE REVERSAL")
        sp.verify(self.data.revertCounterparty, "COUNTERPARTY DID NOT APPROVE REVERSAL")
        sp.send(self.data.owner, self.data.balanceOwner, "REVERT OPERATION APPROVED BY ADMIN")
        sp.send(self.data.counterparty, self.data.balanceCounterparty, "REVERT OPERATION APPROVED BY ADMIN")
        self.data.balanceOwner = sp.tez(0)
        self.data.balanceCounterparty = sp.tez(0)
        self.data.revertOwner = False
        self.data.revertCounterparty = False

    @sp.entry_point
    def addBalanceOwner(self):
        sp.verify(self.data.balanceOwner == sp.tez(0), "BALANCE ALREADY FILLED")
        sp.verify(sp.amount == self.data.fromOwner, "AMOUNT NEEDS TO BE EXACT")
        sp.verify(sp.sender == self.data.owner, "ONLY THE OWNER MAY ADD TO THEIR OWN BALANCE")
        self.data.balanceOwner = self.data.fromOwner

    @sp.entry_point
    def addBalanceCounterparty(self):
        sp.verify(self.data.balanceCounterparty == sp.tez(0), "BALANCE ALREADY FILLED")
        sp.verify(sp.amount == self.data.fromCounterparty, "AMOUNT NEEDS TO BE EXACT")
        sp.verify(sp.sender == self.data.counterparty, "ONLY THE COUNTERPARTY MAY ADD TO THEIR OWN BALANCE")
        self.data.balanceCounterparty = self.data.fromCounterparty

    def claim(self, identity):
        sp.verify(sp.sender == identity, "IDENTITY IS NOT WHAT IS EXPECTED")
        sp.send(identity, self.data.balanceOwner + self.data.balanceCounterparty)
        self.data.balanceOwner = sp.tez(0)
        self.data.balanceCounterparty = sp.tez(0)

    @sp.entry_point
    def claimCounterparty(self, params):
        sp.verify(sp.now < self.data.epoch, "CLAIMED TOO LATE")
        sp.verify(self.data.hashedSecret == sp.blake2b(params.secret), "WRONG SECRET")
        self.claim(self.data.counterparty)

    @sp.entry_point
    def claimOwner(self):
        sp.verify(self.data.epoch < sp.now, "CLAIMED TOO EARLY")
        self.claim(self.data.owner)

    @sp.entry_point
    def ownerRevert(self, params):
        sp.verify(self.data.hashedSecret == sp.blake2b(params.secret), "WRONG SECRET")
        sp.verify(sp.sender == self.data.owner, "IDENTITY IS NOT WHAT IS EXPECTED")
        self.data.revertOwner = True

    @sp.entry_point
    def counterpartyRevert(self, params):
        sp.verify(self.data.hashedSecret == sp.blake2b(params.secret), "WRONG SECRET")
        sp.verify(sp.sender == self.data.counterparty, "IDENTITY IS NOT WHAT IS EXPECTED")
        self.data.revertCounterparty = True
        

@sp.add_test(name = "Escrow")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Escrow")
    hashSecret = sp.blake2b(sp.bytes("0x01223344"))
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    admin = sp.test_account("Admin")
    c1 = Escrow(alice.address, sp.tez(50), bob.address, sp.tez(4), sp.timestamp(123), hashSecret, admin.address)
    scenario += c1
    c1.adminSetEpoch(newEpoch = sp.timestamp(122)).run(sender = admin)
    c1.addBalanceOwner().run(sender = alice, amount = sp.tez(50))
    c1.addBalanceCounterparty().run(sender = bob, amount = sp.tez(4))
    scenario.h3("Erronous secret")
    c1.claimCounterparty(secret = sp.bytes("0x01223343"))    .run(sender = bob, valid = False)
    scenario.h3("Correct secret")
    c1.claimCounterparty(secret = sp.bytes("0x01223344")).run(sender = bob)

sp.add_compilation_target(
    "escrow", 
    Escrow(
        sp.address("tz1PqtmCShuJwoJUSbad1GvX8V9t6aJSUUp4"), # owner
        sp.tez(50), # fromOwner
        sp.address("tz1Km2Ph2ibx8D5J9WePWsqEZYnPHngpT9EA"), # counterparty
        sp.tez(4), # fromCounterparty
        sp.timestamp(1682179199), # epoch
        sp.bytes("0x733ec559845c8942ee01dcbba29ef7a44e31bc38a6184bc7f044155f7a3ec0f8"), # hashed secret (this one is for "hunter2")
        sp.address("tz1fvD6AoMsYGtUTRGoBSqfQC9NqHY6n7Kf7") # admin
    )
)
