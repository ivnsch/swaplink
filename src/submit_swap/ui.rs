use std::rc::Rc;

use algonaut::transaction::{Transaction, TransactionType};
use log::debug;
use yew::prelude::*;

use yew::{html, Component, ComponentLink, Html, ShouldRender};
use yewtil::future::LinkFuture;

use crate::model::SwapRequest;

use super::logic::SubmitSwapLogic;

pub struct SubmitSwap {
    link: ComponentLink<Self>,
    props: SubmitSwapProps,
    swap_request: Option<SwapRequest>,
    error_msg: Option<String>,
}

#[derive(Clone, Properties)]
pub struct SubmitSwapProps {
    pub logic: Rc<SubmitSwapLogic>,
    pub encoded_swap: String,
}

#[derive(Clone, Debug)]
pub enum Msg {
    Submit(SwapRequest),
    SetSwapRequest(SwapRequest),
    ShowError(String),
}

impl Component for SubmitSwap {
    type Message = Msg;
    type Properties = SubmitSwapProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            props,
            swap_request: None,
            error_msg: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Submit(swap_request) => {
                let logic = self.props.logic.clone();
                self.link
                    .send_future(async move { Self::submit(logic, swap_request).await })
            }
            Msg::SetSwapRequest(request) => self.swap_request = Some(request),
            Msg::ShowError(msg) => self.error_msg = Some(msg),
        }
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        true
    }

    fn rendered(&mut self, first_render: bool) {
        if first_render {
            let encoded_swap = self.props.encoded_swap.clone();
            let logic = self.props.logic.clone();
            self.link
                .send_future(async { Self::process_encoded_swap(logic, encoded_swap).await });
        }
    }

    fn view(&self) -> Html {
        html! {
            <div>
                {
                    if let Some(error_msg) = &self.error_msg {
                        html! {<div>{ "Error: " }{ error_msg }</div>}
                    } else {
                        html! {}
                    }
                }
                {
                    if let Some(request) = &self.swap_request {
                        Self::request_infos(request)
                    } else {
                        html! {}
                    }
                }
                {self.submit_button()}
            </div>
        }
    }
}

impl SubmitSwap {
    fn request_infos(request: &SwapRequest) -> Html {
        html! {
            <div>
                <div>{ "You got a swap request!" }</div>
                <div>{ "From:" }</div>
                <div>{ request.signed_tx.transaction.sender().to_string() }</div>
                <div>{ "You send:" }</div>
                <div>{ Self::payment_infos(&request.unsigned_tx) }</div>
                <div>{ "You receive:" }</div>
                <div>{ Self::payment_infos(&request.signed_tx.transaction) }</div>
                <div>{ "Fee:" }</div>
                <div>{ request.unsigned_tx.fee.to_string() }</div>
            </div>
        }
    }

    fn payment_infos(tx: &Transaction) -> Html {
        match &tx.txn_type {
            TransactionType::Payment(p) => html! {
                <div>{ format!("{} Algos", p.amount) }</div>
            },
            TransactionType::AssetTransferTransaction(t) => html! {
                <div>{ format!("Asset id: {}, amount: {}", t.xfer, t.amount) }</div>
            },
            _ => panic!("Not supported type"),
        }
    }

    fn submit_button(&self) -> Html {
        let swap_request = self.swap_request.clone();
        match swap_request {
            Some(request) => {
                html! { <button onclick=self.link.callback(move |_| Msg::Submit(request.clone()))>{ "Sign and submit" }</button> }
            }
            None => html! { <div/> },
        }
    }
}

impl SubmitSwap {
    async fn process_encoded_swap(logic: Rc<SubmitSwapLogic>, encoded_swap: String) -> Msg {
        let swap_request_res = logic.decode_swap(encoded_swap).await;
        debug!("Decoded swap request: {:?}", swap_request_res);

        match swap_request_res {
            Ok(swap_request) => Msg::SetSwapRequest(swap_request),
            Err(e) => Msg::ShowError(format!("Swap error: {}", e)),
        }
    }

    async fn submit(logic: Rc<SubmitSwapLogic>, swap: SwapRequest) -> Msg {
        match logic.submit_swap(swap).await {
            Ok(tx_id) => Msg::ShowError(format!("Swap success! tx id: {}", tx_id)),
            Err(e) => Msg::ShowError(format!("Swap error: {}", e)),
        }
    }
}
