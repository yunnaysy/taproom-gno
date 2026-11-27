# Taproom on Onyx (onyx-1) — deployment record

- Realm: `gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom`
- Deployer / poster: `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`
- gnoweb: https://onyx.testnets.gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
- Web UI: https://taproom-gno.vercel.app

| Step | Signer | Height | Tx hash (base64; links to the RPC tx query) |
| --- | --- | --- | --- |
| addpkg taproom | poster | 1450746 | [`Cxi+V4K4BpeBdrNmzK2szlSOpN9+EbMAS9Al6Uz5dxQ=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x0b18be5782b806978176b366ccadacce548ea4df7e11b3004bd025e94cf97714) |
| PostQuest #1, 5 GNOT | poster | 1450792 | [`Q+ThDj8gAuqSlkTGE45VJcLUbEB5T9lKSSc/GSy3DoA=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x43e4e10e3f2002ea929644c6138e5525c2d46c40794fd94a49273f192cb70e80) |
| PostQuest #2, 3 GNOT | poster | 1450793 | [`g0GpXL617/jnQZXHykbWhmjg/2O5HmdMCW2VUSSffnc=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x8341a95cbeb5eff8e74195c7ca46d68668e0ff63b91e674c096d9551249f7e77) |
| Submit #1 | hunter | 1458938 | [`jFw4BZQ2+ZQJzHGCGDhS4gqZcHxo9AtWF+D9X+wpYYM=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x8c5c38059436f99409cc7182183852e20a99707c68f40b5617e0fd5fec296183) |
| Award #1 to hunter (5 GNOT paid out) | poster | 1458941 | [`JivdF2ZLgOjME+Wc/04M6ebDyV+4JQ6BsFVLcS1UGY0=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x262bdd17664b80e8cc13e59cff4e0ce9e6c3c95fb8250e81b0554b712d54198d) |
| Reclaim #2 (3 GNOT refunded, no answers) | poster | 1458943 | [`YP4FU5N1rWv+bY7akwIGFOT1p45bvIBf63Sk2regz0s=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x60fe05539375ad6bfe6d8eda93020614e4f5a78e5bbc805feb74a4dab7a0cf4b) |
| PostQuest #3, 2 GNOT (left open) | poster | 1458949 | [`U3p2xu3iwS7Au2zmjVD8oHFdRYRF5GyoWTHxCzSHABA=`](https://rpc.onyx.testnets.gno.land/tx?hash=0x537a76c6ede2c12ec0bb6ce68d50fca0715d458445e46ca85931f10b34870010) |

Keys: poster `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`, hunter `g1g4c3zh3vh7dvn9lvrcxemgfvfujtlkhw2vczk4`. Both are throwaway test keys controlled by the same author, so the hunter answer on quest #1 is a flow demonstration, not an independent bounty result. Hunter balance after the flow: 303.5217 GNOT (300 from the faucet + 5 awarded - fees).

Chain: `onyx-1`, RPC https://rpc.onyx.testnets.gno.land:443 (node v1.0.0-rc.0). Local toolchain: gno v1.8.0, GNOROOT at gnolang/gno commit `4073c1d`. Quest IDs are in the step names. The 7-day review window was not exercised on Onyx (local test only).

Final board state on Onyx: 1 open quest (#3, 2 GNOT escrowed), 5 GNOT paid to hunters, 3 quests pinned.

Also on chain, same key: a throwaway `.../hellotest` package (tx `VPwnw7APCZW/hjUqdk/zBK0Ur61PHpMhidreqtu4NVY=`) used to diagnose query lag. It is not part of the entry.

Note: after `addpkg`, public RPC queries (`vm/qrender`, `vm/qfile`) and simulations returned "package not found" / an internal error for about a minute before the package became visible. Wait about 1–2 minutes after deploying before the first call.
