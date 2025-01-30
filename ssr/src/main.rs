use askama::Template;
use axum::{
    extract::Path,
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::get,
    Router,
};
use reqwest;
use serde::Deserialize;
use std::error::Error;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .or_else(|_| EnvFilter::try_new("ssr=debug,tower_http=debug"))
                .unwrap(),
        )
        .init();

    let app = Router::new()
        .route("/", get(root))
        .route("/rt/{location}", get(render_flu_data))
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:4242")
        .await
        .unwrap();

    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Go to /rt/US to see Rt estimates for the United States"
}

async fn render_flu_data(Path(location): Path<String>) -> impl IntoResponse {
    match fetch_flu_data(&location).await {
        Ok(records) => {
            if records.is_empty() {
                return (
                    StatusCode::NOT_FOUND,
                    format!("No flu data found for location: {location}"),
                )
                    .into_response();
            }
            let template = RtDataTemplate {
                location: &records[0].state,
                records: &records
            };
            match template.render() {
                Ok(html) => Html(html).into_response(),
                Err(err) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to render template. Error: {err}"),
                )
                    .into_response(),
            }
        }
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to fetch data. Error: {err}"),
        ).into_response(),
    }
}

#[derive(Debug, Deserialize)]
struct FluData {
    state: String,
    date: String,
    median: String,
    // lower: String,
    // upper: String,
    // interval_width: String,
    state_abb: String,
    // is_plotted_date: bool,
    // pathogen: String,
    // ISO_3166_2: String,
    // rt_date: String,
}

#[derive(Template)]
#[template(path = "rt.html")]
struct RtDataTemplate<'a> {
    location: &'a str,
    records: &'a Vec<FluData>,
}

async fn fetch_flu_data(location: &str) -> Result<Vec<FluData>, Box<dyn Error>> {
    let url = "https://www.cdc.gov/wcms/vizdata/cfa/RtEstimates/flu/flu_timeseries_data.csv";
    let response = reqwest::get(url).await?.text().await?;

    let mut rdr = csv::Reader::from_reader(response.as_bytes());
    let mut records = Vec::new();

    let location = location.to_lowercase();
    for result in rdr.deserialize() {
        let record: FluData = result?;
        if record.state_abb.to_lowercase() == location {
            records.push(record);
        }
    }

    Ok(records)
}
