## [1.1.1](https://github.com/kirruss/core/compare/v1.1.0...v1.1.1) (2020-09-18)


### Bug Fixes

* reordered imports to prevent bundled definitions bug exporting everything as types ([1dce487](https://github.com/kirruss/core/commit/1dce4878849d5efb96776b0b3c3b6c58468a302e))

# [1.1.0](https://github.com/kirruss/core/compare/v1.0.0...v1.1.0) (2020-09-17)


### Bug Fixes

* added the option to provide non-promise inputs to reduce ([60773c6](https://github.com/kirruss/core/commit/60773c6eee37c9968e7bf1712e78ccb203544b0d))
* declared types export as such ([f6ddc7d](https://github.com/kirruss/core/commit/f6ddc7d59ca9144e712c7368604af67c85534ccc))
* fixed nullness check in discard combinators for void returning effects ([e3597ab](https://github.com/kirruss/core/commit/e3597ab19741154fffead9cba56a52ce7c84d630))


### Features

* added a bubblefailures option to the discard combinator ([6f6049e](https://github.com/kirruss/core/commit/6f6049e20ab95cb3bf1f2076d8aefe116400f4b5))
* expanded effectul to allow taking async functions that return null ([259d072](https://github.com/kirruss/core/commit/259d072ec6615d9e4ff488d246b50331c89da21d))
* expanded task definition to allow synchronous functions ([568c4d1](https://github.com/kirruss/core/commit/568c4d1d96b99036df212c10dd302d5fa78e814c))

# 1.0.0 (2020-09-14)


### Bug Fixes

* exported combinators ([6a8e7b3](https://github.com/kirruss/core/commit/6a8e7b3e3f267dfb1b8fba2245e9f6e546ce531d))


### Features

* added a choose combinator for two tasks ([b77421e](https://github.com/kirruss/core/commit/b77421e21adbbd5074b7d8b5d5964bce102d717b))
* added a combinator for catching errors ([b6dd553](https://github.com/kirruss/core/commit/b6dd553263ef14f7622d4991afd240d7801e95e0))
* added a compose combinator ([df80567](https://github.com/kirruss/core/commit/df805670b553d76d688c452bdc9a406702b0f364))
* added a filter combinator ([6945434](https://github.com/kirruss/core/commit/6945434da218324741b23c29406674e119263813))
* added a helper type for endotasks ([78c7ed4](https://github.com/kirruss/core/commit/78c7ed45a23aa45ec53d2cd836e1522a927742b9))
* added a never combinator ([6be7ecf](https://github.com/kirruss/core/commit/6be7ecf22d6a16f7489678677ffac1295fd5fcff))
* added a pack combinator ([6986b28](https://github.com/kirruss/core/commit/6986b28df3e960cbf72625bf9d4851a8dd006602))
* added a reduce combinator ([310d64b](https://github.com/kirruss/core/commit/310d64bacb81eba61800a16d6c48395431145fa2))
* added a tryto combinator ([ed60ffb](https://github.com/kirruss/core/commit/ed60ffb5ab6af6015b9ea63f61b2e3540df39cce))
* added a warbler combinator ([e138eaf](https://github.com/kirruss/core/commit/e138eaf99afbfc4bd2b24be3e8dccbbd45b453e9))
* added an always combinator ([e2de545](https://github.com/kirruss/core/commit/e2de545cd9f1a42004b2c2b7a07616bab68eb964))
* added an effectul combinator ([134c242](https://github.com/kirruss/core/commit/134c24247d1cf2eb5cd740c95b8858884eb4e1a6))
* added utility functions ([b1e18b6](https://github.com/kirruss/core/commit/b1e18b64797019a99893fa05c99bab22ec40d86c))
* added utility types ([ad12b57](https://github.com/kirruss/core/commit/ad12b57e38b7864d44e0ea0a43ee8746ed6b43f3))
