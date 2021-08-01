use std::rc::Rc;

use yew::prelude::*;

use algonaut::core::Address;
use yew::{html, Component, ComponentLink, Html, ShouldRender};
use yewtil::future::LinkFuture;

use crate::generate_swap::model::SwapRole;

use super::{
    logic::GenerateSwapLogic,
    model::{SwapInputUnit, SwapInputs, SwapLink},
};

pub struct GenerateSwap {
    link: ComponentLink<Self>,
    props: GenerateSwapProps,
    address: Option<Address>,
    inputs: SwapInputs,
    swap_link: Option<SwapLink>,
    error_msg: Option<String>,
}

#[derive(Clone, Debug)]
pub enum Msg {
    Connect,
    Send,
    SetAddress(Address),
    UpdateReceiverInput(String),
    UpdateSendAmountInput(String),
    UpdateReceiveAmountInput(String),
    UpdateSendAssetIdInput(String),
    UpdateReceiveAssetIdInput(String),
    UpdateSendUnitInput(SwapInputUnit),
    UpdateReceiveUnitInput(SwapInputUnit),
    UpdateMyFeeInput(String),
    UpdatePeerFeeInput(String),
    ShowLink(SwapLink),
    ShowError(String),
}

#[derive(Clone, Properties)]
pub struct GenerateSwapProps {
    pub logic: Rc<GenerateSwapLogic>,
}

impl Component for GenerateSwap {
    type Message = Msg;
    type Properties = GenerateSwapProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            link,
            props,
            address: None,
            inputs: SwapInputs {
                peer: "".to_owned(),
                send_amount: "".to_owned(),
                send_unit: SwapInputUnit::Algos,
                send_asset_id: "".to_owned(),
                receive_amount: "".to_owned(),
                receive_unit: SwapInputUnit::Asset,
                receive_asset_id: "".to_owned(),
                my_fee: "".to_owned(),
                peer_fee: "".to_owned(),
            },
            swap_link: None,
            error_msg: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Connect => {
                let provider = self.props.logic.clone();
                self.link
                    .send_future(async move { Self::connect_wallet(provider).await })
            }
            Msg::Send => {
                let address = self.address;
                let inputs = self.inputs.clone();
                let logic = self.props.logic.clone();
                self.link.send_future(async move {
                    match address {
                        Some(address) => match logic.generate_swap_link(address, inputs).await {
                            Ok(swap_link) => Msg::ShowLink(swap_link),
                            Err(e) => Msg::ShowError(format!("Error: {}", e)),
                        },
                        None => Msg::ShowError("Wallet not connected or no addresses".to_owned()),
                    }
                });
            }
            Msg::UpdateReceiverInput(input) => self.inputs.peer = input,
            Msg::UpdateSendAmountInput(input) => self.inputs.send_amount = input,
            Msg::UpdateReceiveAmountInput(input) => self.inputs.receive_amount = input,
            Msg::UpdateSendAssetIdInput(input) => self.inputs.send_asset_id = input,
            Msg::UpdateReceiveAssetIdInput(input) => self.inputs.receive_asset_id = input,
            Msg::UpdateSendUnitInput(input) => self.inputs.send_unit = input,
            Msg::UpdateReceiveUnitInput(input) => self.inputs.receive_unit = input,
            Msg::UpdateMyFeeInput(input) => self.inputs.my_fee = input,
            Msg::UpdatePeerFeeInput(input) => self.inputs.peer_fee = input,
            Msg::SetAddress(address) => self.address = Some(address),
            Msg::ShowLink(link) => self.swap_link = Some(link),
            Msg::ShowError(msg) => self.error_msg = Some(msg),
        }
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        html! {
            <div>
                <button onclick=self.link.callback(|_| Msg::Connect)>{ "Connect wallet" }</button>
                <div class="your-address">{ "Your address: " }{ self.address.map(|a| a.to_string()).unwrap_or_else(|| "".to_owned()) }</div>
                {
                    if let Some(error_msg) = &self.error_msg {
                        html! {<div>{ "Error: " }{ error_msg }</div>}
                    } else {
                        html! {}
                    }
                }
                <div class="form">
                    <div>{ "Peer" }</div>
                    <input
                        placeholder="Peer address"
                        size=64
                        value=self.inputs.peer.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateReceiverInput(e.value))
                    />
                    <div>{ "You send" }</div>

                    <input
                        placeholder={ "Amount" }
                        size=22
                        value=self.inputs.send_amount.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateSendAmountInput(e.value))
                    />
                    <div>
                        { self.unit_select_box(&self.inputs.send_unit, SwapRole::Sender) }
                    </div>
                    {
                        if self.inputs.send_unit == SwapInputUnit::Asset {
                            html! {
                                <input
                                    placeholder="ASA id"
                                    size=22
                                    value=self.inputs.send_asset_id.clone()
                                    oninput=self.link.callback(|e: InputData| Msg::UpdateSendAssetIdInput(e.value))
                                />
                            }
                        }
                        else { html! {} }
                    }
                    <div>{ "You receive" }</div>
                    <input
                        placeholder={ "Amount" }
                        size=22
                        value=self.inputs.receive_amount.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateReceiveAmountInput(e.value))
                    />
                    {
                        if self.inputs.receive_unit == SwapInputUnit::Asset {
                            html! {
                                <input
                                    placeholder="ASA id"
                                    size=22
                                    value=self.inputs.receive_asset_id.clone()
                                    oninput=self.link.callback(|e: InputData| Msg::UpdateReceiveAssetIdInput(e.value))
                                />
                            }
                        }
                        else { html! {} }
                    }
                    <div>
                        { self.unit_select_box(&self.inputs.receive_unit, SwapRole::Receiver) }
                    </div>

                    <div>{ "Your fee" }</div>
                    <input
                        placeholder="Fee"
                        size=22
                        value=self.inputs.my_fee.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateMyFeeInput(e.value))
                    />
                    <div>{ "Peer's fee" }</div>
                    <input
                        placeholder="Fee"
                        size=22
                        value=self.inputs.peer_fee.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdatePeerFeeInput(e.value))
                    />
                    <button onclick=self.link.callback(|_| Msg::Send)>{ "Generate link" }</button>
                </div>
                {
                    if let Some(link) = &self.swap_link {
                        html! {
                            <div>
                                <div>{ "Send this link to your peer! Upon opening, they can confirm and submit the swap. Note that the link expires in ~1 hour." }</div>
                                <div>{ link.0.clone() } </div>
                            </div>
                        }
                    } else {
                        html! {}
                    }
                }
            </div>
        }
    }
}

impl GenerateSwap {
    fn unit_select_box(&self, unit: &SwapInputUnit, role: SwapRole) -> Html {
        let options = vec![
            Self::option("Algo", *unit == SwapInputUnit::Algos),
            Self::option("ASA", *unit == SwapInputUnit::Asset),
        ];

        html! {
            <select onchange=self.link.callback(move |cd: ChangeData| {
                match cd {
                    ChangeData::Select(e) =>  {
                        let unit = match e.value().as_ref() {
                            "Algo" => SwapInputUnit::Algos,
                            "ASA" => SwapInputUnit::Asset,
                            _ => panic!("invalid unit str")
                        };
                        match role {
                            SwapRole::Sender => Msg::UpdateSendUnitInput(unit),
                            SwapRole::Receiver => Msg::UpdateReceiveUnitInput(unit)
                        }
                    },
                    _ => panic!("Unexpected ChangeData: {:?}", cd)
                }
            })>
            { for options }
            </select>
        }
    }

    fn option(text: &'static str, is_selected: bool) -> Html {
        if is_selected {
            html! {
                <option value={ text } selected=true>{ text }</option>
            }
        } else {
            html! {
                <option value={ text }>{ text }</option>
            }
        }
    }
}

impl GenerateSwap {
    async fn connect_wallet(logic: Rc<GenerateSwapLogic>) -> Msg {
        match logic.connect_wallet().await {
            Ok(address) => Msg::SetAddress(address),
            Err(e) => Msg::ShowError(format!("Error connecting wallet: {}", e)),
        }
    }
}
