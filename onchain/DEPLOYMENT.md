# Taproom on Onyx (onyx-1) — deployment record

- Realm: `gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom`
- Deployer / poster: `g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej`
- gnoweb: https://onyx.testnets.gno.land/r/g1jacahne0v3s27d6g872s8qu30ryvuec3lzsjej/taproom
- Web UI: https://taproom-gno.vercel.app

| Step | Height | Tx hash (base64) |
| --- | --- | --- |
| addpkg taproom | 1450746 | `Cxi+V4K4BpeBdrNmzK2szlSOpN9+EbMAS9Al6Uz5dxQ=` |
| PostQuest #1, 5 GNOT | 1450792 | `Q+ThDj8gAuqSlkTGE45VJcLUbEB5T9lKSSc/GSy3DoA=` |
| PostQuest #2, 3 GNOT | 1450793 | `g0GpXL617/jnQZXHykbWhmjg/2O5HmdMCW2VUSSffnc=` |

Also on chain, same key: a throwaway `.../hellotest` package (tx `VPwnw7APCZW/hjUqdk/zBK0Ur61PHpMhidreqtu4NVY=`) used to diagnose query lag. It is not part of the entry.

Note: after `addpkg`, public RPC queries (`vm/qrender`, `vm/qfile`) and simulations returned "package not found" / an internal error for about a minute before the package became visible. Wait about 1–2 minutes after deploying before the first call.
