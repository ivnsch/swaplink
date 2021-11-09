# SwapLink

![Continuous integration](https://github.com/ivanschuetz/swaplink/actions/workflows/actions.yml/badge.svg)

Site to perform peer to peer atomic swaps on the Algorand blockchain

Live: http://www.swaplink.xyz

## Pre-requisites

[Rust](https://www.rust-lang.org/tools/install), [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) and [Node.js](https://nodejs.org/en/)

## Instructions

Build Rust in debug mode:

```
cd wasm
wasm-pack build --out-dir ../wasm-build --debug
```

Build Rust in release mode:
```
cd wasm
wasm-pack build --out-dir ../wasm-build --release
```

Use the `NETWORK` environment variable to set the network to connect to, e.g:
```
NETWORK=test wasm-pack build --out-dir ../wasm-build --release
```
Currently only `test` (TestNet) can be passed. It defaults to a private network configuration if it's not set.

Initialize the React app:

```
npm install
```

Run the React app:

```
cd react-app
npm start
```

See more instructions for React in the [app folder](https://github.com/ivanschuetz/swaplink/tree/main/react-app)


## Contribute

1. Fork
2. Commit changes to a branch in your fork
3. Push your code and make a pull request
