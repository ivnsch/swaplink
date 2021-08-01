use std::rc::Rc;

use algonaut::{
    algod::{v2::Algod, AlgodBuilder},
    indexer::{v2::Indexer, IndexerBuilder},
};
use my_algo::MyAlgo;

use crate::{generate_swap::logic::GenerateSwapLogic, submit_swap::logic::SubmitSwapLogic};

pub fn algod() -> Algod {
    AlgodBuilder::new()
        .bind("http://127.0.0.1:53630")
        .auth("44d70009a00561fe340b2584a9f2adc6fec6a16322554d44f56bef9e682844b9")
        .build_v2()
        // expect: build returns an error if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

pub fn indexer() -> Indexer {
    IndexerBuilder::new()
        .bind("http://127.0.0.1:8980")
        .build_v2()
        // expect: build returns an error if the URL is not provided or has an invalid format,
        // we are passing a verified hardcoded value.
        .expect("Couldn't initialize indexer")
}

pub fn my_algo() -> MyAlgo {
    MyAlgo {}
}

pub fn generate_swap_logic(
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
    indexer: Rc<Indexer>,
) -> GenerateSwapLogic {
    GenerateSwapLogic::new(algod, my_algo, indexer)
}

pub fn submit_swap_logic(
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
    indexer: Rc<Indexer>,
) -> SubmitSwapLogic {
    SubmitSwapLogic::new(algod, my_algo, indexer)
}
