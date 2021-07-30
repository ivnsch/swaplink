use yew_router::{router::Router, Switch};

#[derive(Clone, Debug, Switch)]
pub enum AppRoute {
    #[to = "/submit/{}"]
    Submit(String),
    #[to = "/"]
    Generate,
}

pub type AppRouter = Router<AppRoute>;
