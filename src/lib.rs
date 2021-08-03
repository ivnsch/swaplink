#![recursion_limit = "1024"]

mod asset_infos;
mod dependencies;
mod generate_swap;
mod model;
mod routing;
mod submit_swap;

use std::rc::Rc;

use algonaut::{algod::v2::Algod, indexer::v2::Indexer};
use my_algo::MyAlgo;
use routing::{AppRoute, PublicUrlSwitch};
use wasm_bindgen::prelude::*;

use anyhow::Result;
use wasm_bindgen::JsValue;
use yew::{html, Component, ComponentLink, Html, ShouldRender};

use crate::{generate_swap::ui::GenerateSwap, routing::AppRouter, submit_swap::ui::SubmitSwap};

pub struct Model {
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
    indexer: Rc<Indexer>,
}

#[derive(Clone, Debug)]
pub enum Msg {}

impl Component for Model {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self {
            algod: Rc::new(dependencies::algod()),
            my_algo: Rc::new(dependencies::my_algo()),
            indexer: Rc::new(dependencies::indexer()),
        }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        let algod = self.algod.clone();
        let my_algo = self.my_algo.clone();
        let indexer = self.indexer.clone();
        html! {
            <div id="root">
                <div id="wrapper">
                    <AppRouter
                        render=AppRouter::render(move |a| Self::switch(algod.clone(), my_algo.clone(), indexer.clone(), a))
                    />
                </div>
            </div>
        }
    }
}

impl Model {
    fn switch(
        algod: Rc<Algod>,
        my_algo: Rc<MyAlgo>,
        indexer: Rc<Indexer>,
        switch: PublicUrlSwitch,
    ) -> Html {
        match switch.route() {
            AppRoute::Generate => {
                html! { <GenerateSwap
                    logic=Rc::new(dependencies::generate_swap_logic(algod, my_algo, indexer))
                /> }
            }
            AppRoute::Submit(encoded_swap) => {
                html! { <SubmitSwap
                    logic=Rc::new(dependencies::submit_swap_logic(algod, my_algo, indexer)) encoded_swap=encoded_swap
                /> }
            }
        }
    }
}

#[wasm_bindgen]
pub fn run_app() -> Result<(), JsValue> {
    wasm_logger::init(wasm_logger::Config::default());
    yew::start_app::<Model>();
    Ok(())
}
