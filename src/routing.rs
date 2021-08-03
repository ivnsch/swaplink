use yew::{html::IntoPropValue, web_sys::Url};
use yew_router::prelude::*;

#[derive(Clone, Debug, Switch)]
pub enum AppRoute {
    #[to = "/submit/{}"]
    Submit(String),
    #[to = "/"]
    Generate,
}

impl AppRoute {
    pub fn into_public(self) -> PublicUrlSwitch {
        PublicUrlSwitch(self)
    }
}

// See https://github.com/yewstack/yew/blob/v0.18/examples/router/src/switch.rs

#[derive(Clone, Debug)]
pub struct PublicUrlSwitch(AppRoute);
impl PublicUrlSwitch {
    fn base_url() -> Url {
        if let Ok(Some(href)) = yew::utils::document().base_uri() {
            // since this always returns an absolute URL we turn it into `Url`
            // so we can more easily get the path.
            Url::new(&href).unwrap()
        } else {
            Url::new("/").unwrap()
        }
    }

    fn base_path() -> String {
        let mut path = Self::base_url().pathname();
        if path.ends_with('/') {
            // pop the trailing slash because AppRoute already accounts for it
            path.pop();
        }

        path
    }

    pub fn route(self) -> AppRoute {
        self.0
    }
}

impl Switch for PublicUrlSwitch {
    fn from_route_part<STATE>(part: String, state: Option<STATE>) -> (Option<Self>, Option<STATE>) {
        if let Some(part) = part.strip_prefix(&Self::base_path()) {
            let (route, state) = AppRoute::from_route_part(part.to_owned(), state);
            (route.map(Self), state)
        } else {
            (None, None)
        }
    }

    fn build_route_section<STATE>(self, route: &mut String) -> Option<STATE> {
        route.push_str(&Self::base_path());
        self.0.build_route_section(route)
    }
}

// this allows us to pass `AppRoute` to components which take `PublicUrlSwitch`.

impl IntoPropValue<PublicUrlSwitch> for AppRoute {
    fn into_prop_value(self: AppRoute) -> PublicUrlSwitch {
        self.into_public()
    }
}

// type aliases to make life just a bit easier

// pub type AppRouter = Router<AppRoute>;
pub type AppRouter = Router<PublicUrlSwitch>;
