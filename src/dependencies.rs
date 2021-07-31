use std::rc::Rc;

use algonaut::algod::{v2::Algod, AlgodBuilder};
use my_algo::MyAlgo;

use crate::{generate_swap::logic::GenerateSwapLogic, submit_swap::logic::SubmitSwapLogic};

pub fn algod() -> Algod {
    AlgodBuilder::new()
        .bind("http://127.0.0.1:53630")
        .auth("44d70009a00561fe340b2584a9f2adc6fec6a16322554d44f56bef9e682844b9")
        .build_v2()
        // expect: algonaut::algod::v2::AlgodBuilder::build_v2 returns an error
        // if the URL or token are not provided or have an invalid format,
        // we are passing verified hardcoded values.
        .expect("Couldn't initialize algod")
}

pub fn my_algo() -> MyAlgo {
    MyAlgo {}
}

pub fn generate_swap_logic(algod: Rc<Algod>, my_algo: Rc<MyAlgo>) -> GenerateSwapLogic {
    GenerateSwapLogic::new(algod, my_algo)
}

pub fn submit_swap_logic(algod: Rc<Algod>, my_algo: Rc<MyAlgo>) -> SubmitSwapLogic {
    SubmitSwapLogic::new(algod, my_algo)
}
