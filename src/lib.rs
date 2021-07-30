#![recursion_limit = "1024"]

mod dependencies;
mod generate_swap;
mod provider;
mod routing;
mod submit_swap;

use std::rc::Rc;

use provider::Provider;
use routing::AppRoute;
use wasm_bindgen::prelude::*;

use anyhow::Result;
use wasm_bindgen::JsValue;
use yew::{html, Component, ComponentLink, Html, ShouldRender};

use crate::{generate_swap::GenerateSwap, routing::AppRouter, submit_swap::SubmitSwap};

pub struct Model {
    provider: Rc<Provider>,
}

#[derive(Clone, Debug)]
pub enum Msg {}

impl Component for Model {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        let provider = dependencies::provider(dependencies::algod(), dependencies::my_algo());
        Self {
            provider: Rc::new(provider),
        }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        let provider = self.provider.clone();
        html! {
            <AppRouter render=AppRouter::render(move |a| Self::switch(provider.clone(), a)) />
        }
    }
}

impl Model {
    fn switch(provider: Rc<Provider>, switch: AppRoute) -> Html {
        match switch {
            AppRoute::Generate => {
                html! { <GenerateSwap provider=provider/> }
            }
            AppRoute::Submit(encoded_swap) => {
                html! { <SubmitSwap  provider=provider encoded_swap=encoded_swap /> }
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
