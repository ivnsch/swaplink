use std::rc::Rc;

use crate::{
    dependencies,
    provider::{Provider, SwapLink, Transfer, ValidatedSwapInputs},
};
use yew::prelude::*;

use algonaut::core::{Address, MicroAlgos};
use anyhow::Result;
use yew::{html, Component, ComponentLink, Html, ShouldRender};
use yewtil::future::LinkFuture;

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
    pub provider: Rc<Provider>,
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
                let provider = self.props.provider.clone();
                self.link
                    .send_future(async move { Self::connect_wallet(provider).await })
            }
            Msg::Send => {
                let address = self.address;
                let inputs = self.inputs.clone();
                self.link.send_future(async move {
                    match address {
                        Some(address) => match Self::submit_swap(address, inputs).await {
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
                        placeholder={ Self::amount_placeholder(&self.inputs.send_unit) }
                        size=22
                        value=self.inputs.send_amount.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateSendAmountInput(e.value))
                    />
                    <div>
                        { self.unit_select_box(&self.inputs.send_unit, Role::Sender) }
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
                        placeholder={ Self::amount_placeholder(&self.inputs.receive_unit) }
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
                        { self.unit_select_box(&self.inputs.receive_unit, Role::Receiver) }
                    </div>

                    <div>{ "Your fee" }</div>
                    <input
                        placeholder="Fee (microAlgos)"
                        size=22
                        value=self.inputs.my_fee.clone()
                        oninput=self.link.callback(|e: InputData| Msg::UpdateMyFeeInput(e.value))
                    />
                    <div>{ "Peer's fee" }</div>
                    <input
                        placeholder="Fee (microAlgos)"
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
    fn amount_placeholder(unit: &SwapInputUnit) -> String {
        match unit {
            SwapInputUnit::Algos => "Amount (microAlgos)",
            SwapInputUnit::Asset => "Amount (ASA base units)",
        }
        .to_owned()
    }

    fn unit_select_box(&self, unit: &SwapInputUnit, role: Role) -> Html {
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
                            Role::Sender => Msg::UpdateSendUnitInput(unit),
                            Role::Receiver => Msg::UpdateReceiveUnitInput(unit)
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
    async fn connect_wallet(provider: Rc<Provider>) -> Msg {
        match provider.connect_wallet().await {
            Ok(address) => Msg::SetAddress(address),
            Err(e) => Msg::ShowError(format!("Error connecting wallet: {}", e)),
        }
    }

    async fn submit_swap(me: Address, inputs: SwapInputs) -> Result<SwapLink> {
        let validated_inputs = Self::validate_swap_inputs(inputs)?;
        let provider = dependencies::provider(dependencies::algod(), dependencies::my_algo());
        Ok(provider.generate_link(validated_inputs.to_swap(me)).await?)
    }

    fn validate_swap_inputs(inputs: SwapInputs) -> Result<ValidatedSwapInputs> {
        let peer = inputs.peer.parse().map_err(anyhow::Error::msg)?;

        let send_amount = inputs.send_amount.parse()?;
        let receive_amount = inputs.receive_amount.parse()?;

        let send = Self::to_transfer(inputs.send_unit, send_amount, inputs.send_asset_id)?;
        let receive =
            Self::to_transfer(inputs.receive_unit, receive_amount, inputs.receive_asset_id)?;

        let my_fee = MicroAlgos(inputs.my_fee.parse()?);
        let peer_fee = MicroAlgos(inputs.peer_fee.parse()?);

        Ok(ValidatedSwapInputs {
            peer,
            send,
            receive,
            my_fee,
            peer_fee,
        })
    }

    fn to_transfer(
        input_unit: SwapInputUnit,
        amount: u64,
        asset_id_input: String,
    ) -> Result<Transfer> {
        match input_unit {
            SwapInputUnit::Algos => Ok(Transfer::Algos { amount }),
            SwapInputUnit::Asset => Ok(Transfer::Asset {
                id: asset_id_input.parse()?,
                amount,
            }),
        }
    }
}

#[derive(Debug, Clone)]
struct SwapInputs {
    peer: String,
    send_amount: String,
    send_unit: SwapInputUnit,
    send_asset_id: String,
    receive_amount: String,
    receive_unit: SwapInputUnit,
    receive_asset_id: String,
    my_fee: String,
    peer_fee: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SwapInputUnit {
    Algos,
    Asset,
}

enum Role {
    Sender,
    Receiver,
}
