# [LZ4 Playground](https://lz4-play.vercel.app)

This is an tiny interactive playground app for testing out the [@nick/lz4] package without leaving your browser.
It's 100% client-side, meaning that none of the data is transferred to any server whatsoever - everything runs
in the client's browser, and the metrics data is persisted locally with the `localStorage` API. 

The playground allows you to compress/decompress data either by "uploading" a file or simply pasting it in as text,
using any of the published versions of the package. The speed, throughput, and compression ratio are logged for each
run, and displayed in a visual aggregation area underneath the main input/output area. It also supports charting the
performance differences from version to version of the package.

---

**Copyright © [Nicholas Berlette]. All rights reserved. [MIT License].**

_Not affiliated with the [official LZ4 project] by [Yann Collet]._

[@nick/lz4]: https://github.com/nberlette/lz4#readme
[MIT License]: https://nick.mit-license.org
[Nicholas Berlette]: https://github.com/nberlette
[Yann Collet]: https://github.com/cyan4973
[official LZ4 project]: https://github.com/lz4/lz4
