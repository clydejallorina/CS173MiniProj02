<script lang="ts">
    import { TezosToolkit } from '@taquito/taquito';
    import { BeaconWallet } from '@taquito/beacon-wallet';

    export const tezos = new TezosToolkit("https://ghostnet.smartpy.io");
    export const wallet = new BeaconWallet({
        name: "Tezos Taquito Mini Project 2",
        iconUrl: 'https://tezostaquito.io/img/favicon.svg',
        preferredNetwork: 'chosen_network',
        eventHandlers: {},
    });
</script>