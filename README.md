
# ![Logo](img/logo.png)

![Continuous integration](https://github.com/ivanschuetz/swaplink/actions/workflows/actions.yml/badge.svg)

Site to perform peer to peer atomic swaps on the Algorand blockchain

Live: https://test.swaplink.xyz

# Pre-requisites

[Rust](https://www.rust-lang.org/tools/install), [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) and [Node.js](https://nodejs.org/en/)

# Instructions

## WASM

Build in debug mode:

```
cd wasm
wasm-pack build --out-dir ../wasm-build --debug
```

Build in release mode:
```
cd wasm
wasm-pack build --out-dir ../wasm-build --release
```

### Environment variables:

- `NETWORK` sets the network to connect to. Possible (explicit) values: `test`. Defaults to private network.


- `ENV` sets the deployment environment. Possible (explicit) values: `prod`. Defaults to local environment. Used e.g. to determine the generated swap link base URL.

Complete build command example:
```
NETWORK=test ENV=prod wasm-pack build --out-dir ../wasm-build --release
```

## React 


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


# Contribute

1. Fork
2. Commit changes to a branch in your fork
3. Push your code and make a pull request
