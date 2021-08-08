# SwapLink

![Continuous integration](https://github.com/ivanschuetz/swaplink/actions/workflows/actions.yml/badge.svg)

Site to perform peer to peer atomic swaps on the Algorand blockchain

Live: http://www.swaplink.xyz

Community project: no additional fees or charges.

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


## Contribute

1. Fork
2. Commit changes to a branch in your fork
3. Push your code and make a pull request
