// Networks the front end can read from. Everything shown on the page is read
// live from the realm over JSON-RPC (vm/qrender); nothing is hard-coded.
window.TAPROOM_NETWORKS = {
  local: {
    label: "Local gnodev",
    rpc: "http://127.0.0.1:26657",
    chainId: "dev",
    realm: "gno.land/r/dev/taproom",
    gnoweb: "http://127.0.0.1:8888",
  },
  onyx: {
    label: "Onyx testnet",
    rpc: "https://rpc.onyx.testnets.gno.land:443",
    chainId: "onyx-1",
    // Set this to gno.land/r/<your g1 address>/taproom after deploying (see DEPLOY.md).
    realm: "",
    gnoweb: "https://onyx.testnets.gno.land",
  },
};
