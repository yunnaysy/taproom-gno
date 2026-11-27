# Taproom on Onyx (onyx-1) — deployment record

- Realm: `gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom`
- Deployer / poster: `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`
- gnoweb: https://onyx.testnets.gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
- Web UI: https://taproom-gno.vercel.app

| Step | Signer | Height | Tx hash (base64) |
| --- | --- | --- | --- |
| addpkg taproom | poster | 1450746 | `Cxi+V4K4BpeBdrNmzK2szlSOpN9+EbMAS9Al6Uz5dxQ=` |
| PostQuest #1, 5 GNOT | poster | 1450792 | `Q+ThDj8gAuqSlkTGE45VJcLUbEB5T9lKSSc/GSy3DoA=` |
| PostQuest #2, 3 GNOT | poster | 1450793 | `g0GpXL617/jnQZXHykbWhmjg/2O5HmdMCW2VUSSffnc=` |
| Submit #1 | hunter | 1458938 | `jFw4BZQ2+ZQJzHGCGDhS4gqZcHxo9AtWF+D9X+wpYYM=` |
| Award #1 to hunter (5 GNOT paid out) | poster | 1458941 | `JivdF2ZLgOjME+Wc/04M6ebDyV+4JQ6BsFVLcS1UGY0=` |
| Reclaim #2 (3 GNOT refunded, no answers) | poster | 1458943 | `YP4FU5N1rWv+bY7akwIGFOT1p45bvIBf63Sk2regz0s=` |
| PostQuest #3, 2 GNOT (left open) | poster | 1458949 | `U3p2xu3iwS7Au2zmjVD8oHFdRYRF5GyoWTHxCzSHABA=` |

Keys: poster `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`, hunter `g1g4c3zh3vh7dvn9lvrcxemgfvfujtlkhw2vczk4`. Both are throwaway test keys controlled by the same author, so the hunter answer on quest #1 is a flow demonstration, not an independent bounty result. Hunter balance after the flow: 303.5217 GNOT (300 from the faucet + 5 awarded - fees).

Final board state on Onyx: 1 open quest (#3, 2 GNOT escrowed), 5 GNOT paid to hunters, 3 quests pinned.

Also on chain, same key: a throwaway `.../hellotest` package (tx `VPwnw7APCZW/hjUqdk/zBK0Ur61PHpMhidreqtu4NVY=`) used to diagnose query lag. It is not part of the entry.

Note: after `addpkg`, public RPC queries (`vm/qrender`, `vm/qfile`) and simulations returned "package not found" / an internal error for about a minute before the package became visible. Wait about 1–2 minutes after deploying before the first call.
