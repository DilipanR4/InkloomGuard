import hmac
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from fastapi.security import HTTPAuthorizationCredentials

from app import main
from app.schemas.review import KnowledgePayload, ReviewRequest


TEST_TOKEN = "test-only-ai-service-token"
review_payload = {
    "content_id": "auth-test-content",
    "version_number": 1,
    "submitted_text": "FreshPlus is a refreshing fruit beverage.",
}
index_payload = {"guidelines": [], "facts": []}
protected_paths = ["/v1/review", "/v1/index"]


def route_for(path):
    return next(
        route for route in main.app.routes
        if isinstance(route, APIRoute) and route.path == path
    )


def assert_route_has_service_auth(path):
    route = route_for(path)
    assert any(dependency.call is main.require_service_auth for dependency in route.dependant.dependencies)


@pytest.mark.parametrize("path", protected_paths)
def test_protected_routes_reject_missing_credentials(path):
    assert_route_has_service_auth(path)
    with pytest.raises(HTTPException) as error:
        main.require_service_auth(None)

    assert error.value.status_code == 401
    assert "service credentials" in error.value.detail


@pytest.mark.parametrize("path", protected_paths)
def test_protected_routes_reject_invalid_credentials(path):
    assert_route_has_service_auth(path)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid-test-credential")

    with pytest.raises(HTTPException) as error:
        main.require_service_auth(credentials)

    assert error.value.status_code == 401
    assert "invalid-test-credential" not in error.value.detail


def test_valid_service_credential_passes_constant_time_comparison(monkeypatch):
    compare = Mock(wraps=hmac.compare_digest)
    monkeypatch.setattr(main.hmac, "compare_digest", compare)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=TEST_TOKEN)

    assert main.require_service_auth(credentials) is None
    compare.assert_called_once()


def test_authenticated_review_preserves_review_response(monkeypatch):
    assert_route_has_service_auth("/v1/review")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=TEST_TOKEN)
    assert main.require_service_auth(credentials) is None
    monkeypatch.setattr(main.llm_reviewer, "analyze_content", lambda **kwargs: [])

    response = main.review_content(ReviewRequest(**review_payload))

    assert response.content_id == review_payload["content_id"]
    assert response.version_number == 1
    assert response.findings == []


def test_authenticated_indexing_preserves_index_response(monkeypatch):
    assert_route_has_service_auth("/v1/index")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=TEST_TOKEN)
    assert main.require_service_auth(credentials) is None
    build_index = Mock(return_value=2)
    monkeypatch.setattr(main.global_vector_index, "build_index", build_index)

    response = main.index_knowledge(KnowledgePayload(**index_payload))

    assert response["success"] is True
    assert response["chunks_count"] == 2
    build_index.assert_called_once_with([], [])


def test_cors_is_configured_with_only_explicit_trusted_origins():
    cors = next(middleware for middleware in main.app.user_middleware if middleware.cls.__name__ == "CORSMiddleware")
    assert cors.kwargs["allow_origins"] == ["https://inkloomguard.xyz"]
    assert "*" not in cors.kwargs["allow_origins"]


def test_missing_service_token_fails_configuration_without_disclosing_value(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "")

    with pytest.raises(RuntimeError, match="AI_SERVICE_TOKEN is required") as error:
        main.load_service_token()

    assert TEST_TOKEN not in str(error.value)


def test_wildcard_cors_configuration_is_rejected(monkeypatch):
    monkeypatch.setenv("AI_ALLOWED_ORIGINS", "*")

    with pytest.raises(RuntimeError, match="wildcard origins are not allowed"):
        main.load_trusted_origins()
