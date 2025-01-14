## [1.2.4](https://github.com/gooftroop/pino-sentry-transport/compare/v1.2.3...v1.2.4) (2023-03-19)


### Bug Fixes

* add exports field for types ([aa2e8ee](https://github.com/gooftroop/pino-sentry-transport/commit/aa2e8eecfab04510966d536c01d5f9f911ec6011))

## [1.2.3](https://github.com/gooftroop/pino-sentry-transport/compare/v1.2.2...v1.2.3) (2023-03-19)


### Bug Fixes

* remove legacy package entry points in favor of exports ([e78e74b](https://github.com/gooftroop/pino-sentry-transport/commit/e78e74b72578aa496ddbe534383d1bea6c1a9659))

## [1.2.2](https://github.com/gooftroop/pino-sentry-transport/compare/v1.2.1...v1.2.2) (2022-10-21)


### Bug Fixes

* proper import and typing resolution for browser ([4fff8e6](https://github.com/gooftroop/pino-sentry-transport/commit/4fff8e685384468b5fa2a6e68f478f8f63127af3))

## [1.2.1](https://github.com/gooftroop/pino-sentry-transport/compare/v1.2.0...v1.2.1) (2022-10-19)


### Bug Fixes

* build output formats to properly support cjs and esm ([2bec790](https://github.com/gooftroop/pino-sentry-transport/commit/2bec79054be8a2ef390f03b2b04be692ee4012e6))
* test by using built cjs file ([f06ef72](https://github.com/gooftroop/pino-sentry-transport/commit/f06ef721cb2f30322f8d35c30b7daa58b6264d5b))

## [1.2.0](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.7...v1.2.0) (2022-10-18)


### Features

* add browser write support ([01aa80c](https://github.com/gooftroop/pino-sentry-transport/commit/01aa80c00807e5a32cf0feeed4783833b8cd1a1a))


### Bug Fixes

* browser fn nain ([bb58e51](https://github.com/gooftroop/pino-sentry-transport/commit/bb58e5193a71baa0e984d177ae64f80006fa8c42))
* make browser options optional ([a0f22f9](https://github.com/gooftroop/pino-sentry-transport/commit/a0f22f975ae07230a55efa5477e243f6e54bee16))

## [1.1.7](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.6...v1.1.7) (2022-10-18)


### Bug Fixes

* properly ensure error is type Error ([3acd5b9](https://github.com/gooftroop/pino-sentry-transport/commit/3acd5b9e8be7c5a0e4cf9ecefceee725a85fa5f3))

## [1.1.6](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.5...v1.1.6) (2022-10-17)


### Bug Fixes

* recreate Error from error-like object ([8849636](https://github.com/gooftroop/pino-sentry-transport/commit/8849636fa17b0d935d132b57a2f49112b389ba2f))

## [1.1.5](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.4...v1.1.5) (2022-10-17)


### Bug Fixes

* walk back some changes that introduced bugs ([1adfed9](https://github.com/gooftroop/pino-sentry-transport/commit/1adfed9881940792b5f1d60d31f582b614719465))

## [1.1.4](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.3...v1.1.4) (2022-10-17)


### Bug Fixes

* set err and msg properly ([be4e117](https://github.com/gooftroop/pino-sentry-transport/commit/be4e117a6cacbbce9bda5924f59eee8af5ad1332))

## [1.1.3](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.2...v1.1.3) (2022-10-16)


### Bug Fixes

* handle the case where data is a stringified obj, other fixes ([1c176e6](https://github.com/gooftroop/pino-sentry-transport/commit/1c176e6e61fcb855abf71430c7c4f37ec8d40d63))

## [1.1.2](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.1...v1.1.2) (2022-10-09)


### Bug Fixes

* remove object mode and return value as string ([6dd630d](https://github.com/gooftroop/pino-sentry-transport/commit/6dd630d4dae08329b6eb0c61e987fe64d6f62b02))

## [1.1.1](https://github.com/gooftroop/pino-sentry-transport/compare/v1.1.0...v1.1.1) (2022-10-08)


### Bug Fixes

* minify build ([051c064](https://github.com/gooftroop/pino-sentry-transport/commit/051c064cce30aaab6b570b71285e6a58a7dee822))

## [1.1.0](https://github.com/gooftroop/pino-sentry-transport/compare/v1.0.3...v1.1.0) (2022-10-08)


### Features

* support node 18 stream by setting object mode when init split ([9ef8275](https://github.com/gooftroop/pino-sentry-transport/commit/9ef8275f181b4755a5be1c6252d9a4d27aef0552))


### Bug Fixes

* remove patch-package from postinstall step ([74c9888](https://github.com/gooftroop/pino-sentry-transport/commit/74c9888ea8db6c82900d0a678ead24720f9bf0de))

## [1.0.3](https://github.com/gooftroop/pino-sentry-transport/compare/v1.0.2...v1.0.3) (2022-10-04)


### Bug Fixes

* use stream events to process obj instead of async loop to see if that handles errors better ([6bbbcea](https://github.com/gooftroop/pino-sentry-transport/commit/6bbbcea34697dc9776e6ea7237243ba38589628f))

## [1.0.2](https://github.com/gooftroop/pino-sentry-transport/compare/v1.0.1...v1.0.2) (2022-10-04)


### Bug Fixes

* capture error and unknown events from stream ([6be64a2](https://github.com/gooftroop/pino-sentry-transport/commit/6be64a20e978dc73017df2d53d5394ffa3c92531))

## [1.0.1](https://github.com/gooftroop/pino-sentry-transport/compare/v1.0.0...v1.0.1) (2022-10-04)


### Bug Fixes

* allow passing build options, add exception handling for default close on err ([dca6cb4](https://github.com/gooftroop/pino-sentry-transport/commit/dca6cb40bafc485ac52da0cabc5a171875757638))

## 1.0.0 (2022-10-02)


### Features

* add exception handling, improve source typing ([e14fc96](https://github.com/gooftroop/pino-sentry-transport/commit/e14fc9617de03996d76e9707352a70d516b778a0))


### Bug Fixes

* add correct git plugin for release ([5e56f3e](https://github.com/gooftroop/pino-sentry-transport/commit/5e56f3e8c315db3d085a501062148ff52403c9fc))
* formatting of releaserc file ([52f2561](https://github.com/gooftroop/pino-sentry-transport/commit/52f2561d88762c3b1366cddd9f50a4f1d71fbc7c))
* **release:**  first release ([164c623](https://github.com/gooftroop/pino-sentry-transport/commit/164c623c7abee83a646554861ea8f3f76256fd6a))
* remove git+ from repository url ([2ffb0f0](https://github.com/gooftroop/pino-sentry-transport/commit/2ffb0f03d7b7ed282b5871bcee48e3e368ddb002))
* update repository url to be valid fqdn ([ebc6210](https://github.com/gooftroop/pino-sentry-transport/commit/ebc62100f6ba883753ba97341e34bef98b98d1c3))
* use coirrect repositry protocol in package.json ([31217b0](https://github.com/gooftroop/pino-sentry-transport/commit/31217b02c0a67f4eae44852e467430854f6f6fef))
* use main instead of master for branches configuration in release ([578c9f4](https://github.com/gooftroop/pino-sentry-transport/commit/578c9f40a5ba52ba89878f5e5699d2e68b562ad9))
* use node to execute make in scripts ([6355ca7](https://github.com/gooftroop/pino-sentry-transport/commit/6355ca7418931f74bcc072332317bc6375890638))
