# Escrow - Example for illustrative purposes only.

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
    def adminRevertOperation(self):
        sp.verify(sp.sender == self.data.admin, "INSUFFICIENT PRIVILEGES")
        sp.verify(self.data.revertOwner, "OWNER DID NOT APPROVE REVERSAL")
        sp.verify(self.data.revertCounterparty, "COUNTERPARTY DID NOT APPROVE REVERSAL")
        sp.send(self.data.owner, self.data.balanceOwner, "REVERT OPERATION APPROVED BY ADMIN")
        sp.send(self.data.counterparty, self.data.balanceCounterparty, "REVERT OPERATION APPROVED BY ADMIN")
        self.data.revertOwner = False
        self.data.revertCounterparty = False

    @sp.entry_point
    def addBalanceOwner(self):
        sp.verify(self.data.balanceOwner == sp.tez(0), "BALANCE ALREADY FILLED")
        sp.verify(sp.amount == self.data.fromOwner, "AMOUNT NEEDS TO BE EXACT")
        self.data.balanceOwner = self.data.fromOwner

    @sp.entry_point
    def addBalanceCounterparty(self):
        sp.verify(self.data.balanceCounterparty == sp.tez(0), "BALANCE ALREADY FILLED")
        sp.verify(sp.amount == self.data.fromCounterparty, "AMOUNT NEEDS TO BE EXACT")
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

sp.add_compilation_target("escrow", Escrow(sp.address("tz1Rp4Bv8iUhYnNoCryHQgNzN2D7i3L1LF9C"), sp.tez(50), sp.address("tz1WxrQuZ4CK1MBUa2GqUWK1yJ4J6EtG1Gwi"), sp.tez(4), sp.timestamp(123), sp.bytes("0xc2e588e23a6c8b8192da64af45b7b603ac420aefd57cc1570682350154e9c04e"), sp.address("tz1Rp4Bv8iUhYnNoCryHQgNzN2D7i3L1LF9C")))
