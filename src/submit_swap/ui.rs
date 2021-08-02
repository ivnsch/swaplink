use std::rc::Rc;

use log::debug;
use yew::prelude::*;

use yew::{html, Component, ComponentLink, Html, ShouldRender};
use yewtil::future::LinkFuture;

use crate::model::SwapRequest;

use super::logic::SubmitSwapLogic;
use super::model::{SubmitSwapViewData, SubmitTransferViewData};

pub struct SubmitSwap {
    link: ComponentLink<Self>,
    props: SubmitSwapProps,
    swap: Option<SubmitSwapData>,
    error_msg: Option<String>,
    success_msg: Option<String>,
}

#[derive(Clone, Properties)]
pub struct SubmitSwapProps {
    pub logic: Rc<SubmitSwapLogic>,
    pub encoded_swap: String,
}

#[derive(Clone, Debug)]
pub enum Msg {
    Submit(SwapRequest),
    SetAndShowSwap(SubmitSwapData),
    ShowError(String),
    ShowSuccess(String),
}

impl Component for SubmitSwap {
    type Message = Msg;
    type Properties = SubmitSwapProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            props,
            swap: None,
            error_msg: None,
            success_msg: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Submit(swap_request) => {
                let logic = self.props.logic.clone();
                self.link
                    .send_future(async move { Self::submit(logic, swap_request).await })
            }
            Msg::SetAndShowSwap(swap) => self.swap = Some(swap),
            Msg::ShowError(msg) => self.error_msg = Some(msg),
            Msg::ShowSuccess(msg) => self.success_msg = Some(msg),
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
                <div class="submit-swap-title">{ "You got a swap request!" }</div>
                {
                    if let Some(error_msg) = &self.error_msg {
                        html! {<div class="error">{ "Error: " }{ error_msg }</div>}
                    } else {
                        html! {}
                    }
                }
                {
                    if let Some(success_msg) = &self.success_msg {
                        html! {<div class="success">{ success_msg }</div>}
                    } else {
                        html! {}
                    }
                }
                {
                    if let Some(swap) = &self.swap {
                        Self::swap_infos(&swap.view_data)
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
    fn swap_infos(view_data: &SubmitSwapViewData) -> Html {
        html! {
            <div>
                <div class="submit-swap-label">{ "From:" }</div>
                <div>{ view_data.peer.clone() }</div>
                <div class="submit-swap-label">{ "You send:" }</div>
                <div>{ Self::payment_infos(&view_data.send) }</div>
                <div class="submit-swap-label">{ "You receive:" }</div>
                <div>{ Self::payment_infos(&view_data.receive) }</div>
                <div class="submit-swap-label">{ "Your fee:" }</div>
                <div>{ view_data.my_fee.clone() }</div>
            </div>
        }
    }

    fn payment_infos(transfer: &SubmitTransferViewData) -> Html {
        match &transfer {
            SubmitTransferViewData::Algos { amount } => html! {
                <div>{ format!("{} Algos", amount) }</div>
            },
            SubmitTransferViewData::Asset { id, amount } => html! {
                <div>{ format!("Asset id: {}, amount: {}", id, amount) }</div>
            },
        }
    }

    fn submit_button(&self) -> Html {
        match self.swap.clone().map(|s| s.request) {
            Some(request) => {
                html! {
                <button class="submit-sign-and-submit-button" onclick=self.link.callback(move |_| Msg::Submit(request.clone()))>{ "Sign and submit" }</button> }
            }
            None => html! { <div/> },
        }
    }
}

impl SubmitSwap {
    async fn process_encoded_swap(logic: Rc<SubmitSwapLogic>, encoded_swap: String) -> Msg {
        let res = logic.to_swap_request(encoded_swap).await;
        debug!("Decoded swap request: {:?}", res);

        match res {
            Ok(request) => match logic.to_view_data(&request).await {
                Ok(view_data) => Msg::SetAndShowSwap(SubmitSwapData { request, view_data }),
                Err(e) => Msg::ShowError(format!("Error generating view data: {}", e)),
            },
            Err(e) => Msg::ShowError(format!("Error decoding swap request: {}", e)),
        }
    }

    async fn submit(logic: Rc<SubmitSwapLogic>, swap: SwapRequest) -> Msg {
        match logic.submit_swap(swap).await {
            Ok(tx_id) => Msg::ShowSuccess(format!("Swap success! transaction id: {}", tx_id)),
            Err(e) => Msg::ShowError(format!("Swap error: {}", e)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct SubmitSwapData {
    request: SwapRequest,
    view_data: SubmitSwapViewData,
}
