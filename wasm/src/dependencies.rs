use std::rc::Rc;

use crate::{generate_swap::logic::GenerateSwapLogic, submit_swap::logic::SubmitSwapLogic};
use algonaut::algod::{v2::Algod, AlgodBuilder, AlgodCustomEndpointBuilder};

#[derive(Debug)]
pub enum Network {
    Private,
    Test,
}

#[derive(Debug)]
pub enum Env {
    Local,
    Prod,
}

pub fn network() -> Network {
    let str = option_env!("NETWORK");
    log::debug!("Network str: {:?}", str);

    let network = match str.as_deref() {
        Some("test") => Network::Test,
        _ => Network::Private,
    };
    log::info!("Network: {:?}", network);
    network
}

pub fn env() -> Env {
    let str = option_env!("ENV");
    log::debug!("env str: {:?}", str);

    let env = match str.as_deref() {
        Some("prod") => Env::Prod,
        _ => Env::Local,
    };
    log::info!("Env: {:?}", env);
    env
}

pub fn base_url<'a>() -> &'a str {
    match env() {
        Env::Local => "http://localhost:3000",
        Env::Prod => "http://swaplink.xyz",
    }
}

pub fn algod(network: &Network, api_key: &str) -> Algod {
    match network {
        Network::Private => private_network_algod(),
        Network::Test => testnet_algod(api_key),
    }
}

pub fn generate_swap_logic(algod: Rc<Algod>) -> GenerateSwapLogic {
    GenerateSwapLogic::new(algod)
}

pub fn submit_swap_logic(algod: Rc<Algod>) -> SubmitSwapLogic {
    SubmitSwapLogic::new(algod)
}

fn testnet_algod(api_key: &str) -> Algod {
    AlgodCustomEndpointBuilder::new()
        .bind("https://testnet-algorand.api.purestake.io/ps2/")
        .headers(vec![("x-api-key", api_key)])
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

#[allow(dead_code)]
fn private_network_algod() -> Algod {
    AlgodBuilder::new()
        .bind("http://127.0.0.1:4001")
        .auth("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}
