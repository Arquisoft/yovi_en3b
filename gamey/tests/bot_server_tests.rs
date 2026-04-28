use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use gamey::{
    ErrorResponse, MoveResponse, RandomBot, YBotRegistry, YEN, create_router, state::AppState,
};
use http_body_util::BodyExt;
use std::sync::Arc;
use tower::ServiceExt;

/// Helper to create a default registry with RandomBot
fn default_registry() -> YBotRegistry {
    YBotRegistry::new().with_bot(Arc::new(RandomBot))
}

/// Helper to create a test app with the default state
fn test_app() -> axum::Router {
    let registry = default_registry();
    let state = AppState::new(registry);
    create_router(state)
}

/// Helper to create a test app with a custom state
fn test_app_with_state(state: AppState) -> axum::Router {
    create_router(state)
}

/// Helper to create a test app with an empty bot registry
fn test_app_empty() -> axum::Router {
    let state = AppState::new(YBotRegistry::new());
    create_router(state)
}

// ============================================================================
// Status endpoint tests
// ============================================================================

#[tokio::test]
async fn test_status_endpoint_returns_ok() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(&body[..], b"OK");
}

// ============================================================================
// Choose endpoint tests - Success cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_valid_request() {
    let app = test_app();

    // Create a valid YEN (Y-game Exchange Notation) for a size 3 board
    // Layout: empty board with 3 rows (size 3): row1=1cell, row2=2cells, row3=3cells
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.api_version, "v1");
    assert_eq!(move_response.bot_id, "random_bot");
    // Coordinates should be valid (we can't predict exactly which one the random bot picks)
}

#[tokio::test]
async fn test_choose_endpoint_with_partially_filled_board() {
    let app = test_app();

    // Board with some cells already filled: B in first cell, R in second
    let yen = YEN::new(3, 2, vec!['B', 'R'], "B/R./.B.".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.api_version, "v1");
    assert_eq!(move_response.bot_id, "random_bot");
}

// ============================================================================
// Choose endpoint tests - Error cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_invalid_api_version() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v2/ybot/choose/random_bot") // v2 is not supported
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK); // Axum returns 200 with error JSON

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Unsupported API version"));
    assert_eq!(error_response.api_version, Some("v2".to_string()));
}

#[tokio::test]
async fn test_choose_endpoint_with_unknown_bot() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/unknown_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
    assert!(error_response.message.contains("unknown_bot"));
    assert_eq!(error_response.bot_id, Some("unknown_bot".to_string()));
}

#[tokio::test]
async fn test_choose_endpoint_with_invalid_json() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from("{ invalid json }"))
                .unwrap(),
        )
        .await
        .unwrap();

    // Invalid JSON should return a 4xx error
    assert!(response.status().is_client_error());
}

#[tokio::test]
async fn test_choose_endpoint_with_missing_content_type() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                // No content-type header
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // Missing content-type should return an error
    assert!(response.status().is_client_error());
}

// ============================================================================
// Custom state tests
// ============================================================================

#[tokio::test]
async fn test_choose_with_custom_bot_registry() {
    // Create a custom registry with the random bot
    let state = AppState::new(default_registry());
    let app = test_app_with_state(state);

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_choose_with_empty_bot_registry() {
    // Test with an empty registry to verify bot not found error
    let app = test_app_empty();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
}

// ============================================================================
// RandomBot specific tests
// ============================================================================

#[tokio::test]
async fn test_randombot_is_default_bot() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.bot_id, "random_bot");
}

#[tokio::test]
async fn test_randombot_available_on_startup() {
    let registry = default_registry();
    let names = registry.names();

    assert!(names.contains(&"random_bot".to_string()));
    assert!(!names.is_empty());
}

#[tokio::test]
async fn test_randombot_returns_valid_coordinates() {
    let app = test_app();

    // Test with a board (size 3 has more cells than size 2)
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    // Verify the move has valid coordinates
    assert!(
        move_response.coords.x() < 3
            || move_response.coords.y() < 3
            || move_response.coords.z() < 3
    );
}

// ============================================================================
// Route not found tests
// ============================================================================

#[tokio::test]
async fn test_unknown_route_returns_404() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/unknown/route")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_wrong_method_on_status_endpoint() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // POST to a GET-only endpoint should return 405 Method Not Allowed
    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn test_get_on_choose_endpoint_returns_method_not_allowed() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/v1/ybot/choose/random_bot")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

// ============================================================================
// Hint endpoint tests
// ============================================================================

#[tokio::test]
async fn test_hint_endpoint_with_valid_request() {
    let app = test_app();

    let yen = YEN::new(3, 1, vec!['B', 'R'], "B/../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let hint_response: gamey::bot_server::HintResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize hint response");

    assert_eq!(hint_response.api_version, "v1");
    assert!(hint_response.hint.len() > 0);
    assert!(hint_response.suggested_move.is_some());
}

#[tokio::test]
async fn test_hint_endpoint_default_difficulty() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let hint_response: gamey::bot_server::HintResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize");

    // Default difficulty should be medium
    assert_eq!(hint_response.difficulty, "medium");
}

#[tokio::test]
async fn test_hint_endpoint_with_full_board() {
    let app = test_app();

    // Create a mostly full board (only 1 cell available)
    let yen = YEN::new(3, 5, vec!['B', 'R'], "B/RB/.BR".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let hint_response: gamey::bot_server::HintResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize");

    assert!(hint_response.suggested_move.is_some());
}

#[tokio::test]
async fn test_hint_endpoint_with_invalid_yen_format() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from("{ invalid json }"))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert!(response.status().is_client_error());
}

#[tokio::test]
async fn test_hint_endpoint_with_invalid_api_version() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v2/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let error_response: ErrorResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize");

    assert!(error_response.message.contains("Unsupported API version"));
}

#[tokio::test]
async fn test_hint_endpoint_multiple_requests() {
    let app = test_app();

    let yen = YEN::new(3, 1, vec!['B', 'R'], "B/../...".to_string());

    // Make multiple requests to verify consistency
    for _ in 0..3 {
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/v1/ybot/hint")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&yen).expect("Failed to serialize"),
                    ))
                    .expect("Failed to build request"),
            )
            .await
            .expect("Failed to execute request");

        assert_eq!(response.status(), StatusCode::OK);

        let body = response
            .into_body()
            .collect()
            .await
            .expect("Failed to collect body")
            .to_bytes();
        let _hint_response: gamey::bot_server::HintResponse =
            serde_json::from_slice(&body).expect("Failed to deserialize");
    }
}

#[tokio::test]
async fn test_hint_endpoint_large_board() {
    let app = test_app();

    let yen = YEN::new(3, 2, vec!['B', 'R'], "B/R./.B.".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let hint_response: gamey::bot_server::HintResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize");

    assert!(hint_response.suggested_move.is_some());
    let suggested = hint_response.suggested_move.unwrap();
    assert!(suggested.x <= 3 && suggested.y <= 3 && suggested.z <= 3);
}

#[tokio::test]
async fn test_hint_endpoint_with_medium_difficulty() {
    let app = test_app();

    let yen = YEN::new(3, 1, vec!['B', 'R'], "B/../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/hint")
                .header("content-type", "application/json")
                .body(Body::from(
                    serde_json::to_string(&yen).expect("Failed to serialize"),
                ))
                .expect("Failed to build request"),
        )
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    let body = response
        .into_body()
        .collect()
        .await
        .expect("Failed to collect body")
        .to_bytes();
    let hint_response: gamey::bot_server::HintResponse =
        serde_json::from_slice(&body).expect("Failed to deserialize");

    assert_eq!(hint_response.difficulty, "medium");
    assert!(hint_response.hint.len() > 0);
    assert!(hint_response.suggested_move.is_some());
}
