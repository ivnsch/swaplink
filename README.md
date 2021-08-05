# SwapLink

![Continuous integration](https://github.com/ivanschuetz/swaplink/actions/workflows/actions.yml/badge.svg)

Site to perform peer to peer atomic swaps on the Algorand blockchain

Live: http://www.swaplink.xyz

## Pre-requisites

[Rust](https://www.rust-lang.org/tools/install), [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) and [Node.js](https://nodejs.org/en/)

## Instructions

Build Rust:

```
cd wasm
wasm-pack build --out-dir ../wasm-build
```

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
