use std::rc::Rc;

use crate::{generate_swap::logic::GenerateSwapLogic, submit_swap::logic::SubmitSwapLogic};
use algonaut::{
    algod::{v2::Algod, AlgodBuilder, AlgodCustomEndpointBuilder},
    indexer::{v2::Indexer, IndexerBuilder, IndexerCustomEndpointBuilder},
};

pub fn algod() -> Algod {
    testnet_algod()
}

pub fn indexer() -> Indexer {
    testnet_indexer()
}

pub fn generate_swap_logic(algod: Rc<Algod>, indexer: Rc<Indexer>) -> GenerateSwapLogic {
    GenerateSwapLogic::new(algod, indexer)
}

pub fn submit_swap_logic(algod: Rc<Algod>, indexer: Rc<Indexer>) -> SubmitSwapLogic {
    SubmitSwapLogic::new(algod, indexer)
}

fn testnet_algod() -> Algod {
    AlgodCustomEndpointBuilder::new()
        .bind("https://testnet-algorand.api.purestake.io/ps2/")
        .headers(vec![(
            "x-api-key",
            "Ii8MvLymlZ8mxE5hT94KG4nEWfH1A7cP6WMWTfkk",
        )])
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

fn testnet_indexer() -> Indexer {
    IndexerCustomEndpointBuilder::new()
        .bind("https://testnet-algorand.api.purestake.io/idx2/")
        .headers(vec![(
            "x-api-key",
            "Ii8MvLymlZ8mxE5hT94KG4nEWfH1A7cP6WMWTfkk",
        )])
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

#[allow(dead_code)]
fn private_network_algod() -> Algod {
    AlgodBuilder::new()
        .bind("http://127.0.0.1:53630")
        .auth("44d70009a00561fe340b2584a9f2adc6fec6a16322554d44f56bef9e682844b9")
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

#[allow(dead_code)]
fn private_network_indexer() -> Indexer {
    IndexerBuilder::new()
        .bind("http://127.0.0.1:8980")
        .build_v2()
        // expect: build returns an error if the URL is not provided or has an invalid format,
        // we are passing a verified hardcoded value.
        .expect("Couldn't initialize indexer")
}
