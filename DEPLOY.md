# Deploying Taproom to the Gno.land testnet (Onyx, `onyx-1`)

Prerequisites: the Gno toolchain (`curl -fsSL https://raw.githubusercontent.com/gnolang/gno/master/misc/install.sh | sh`).

```sh
# 1. a key (write the mnemonic down; never commit it)
gnokey add taproom-deployer

# 2. fund it at https://faucet.gno.land (Onyx testnet GNOT, free)
gnokey query bank/balances/$(gnokey list | awk '/taproom-deployer/{print $6}') \
  -remote https://rpc.onyx.testnets.gno.land:443

# 3. deploy (address-based namespace: gno.land/r/<your g1 address>/taproom)
scripts/deploy-onyx.sh taproom-deployer

# 4. point the front end at it
#    edit web/config.js -> onyx.realm = "gno.land/r/<your g1 address>/taproom"
cd web && python3 -m http.server 4173   # open http://localhost:4173, choose "Onyx testnet"
```

Then exercise it for the demo video, with two keys (a poster and a hunter):

```sh
# poster pins a quest with 2 GNOT
gnokey maketx call -pkgpath <realm> -func PostQuest -args "Title" -args "Details" -args 7 \
  -send 2000000ugnot -gas-fee 1000000ugnot -gas-wanted 30000000 -broadcast \
  -chainid onyx-1 -remote https://rpc.onyx.testnets.gno.land:443 poster
# hunter answers
gnokey maketx call -pkgpath <realm> -func Submit -args 1 -args "My answer" -args "https://example.com" ... hunter
# poster awards
gnokey maketx call -pkgpath <realm> -func Award -args 1 -args <hunter g1 address> ... poster
```

`scripts/local-e2e.sh` runs the same flow against a local `gnodev` chain with throwaway keys.
