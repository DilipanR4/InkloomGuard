import json
import sys
import types

import pytest

from app.services.llm_reviewer import LLMReviewer


def _install_fake_gemini(monkeypatch, response_text):
    calls = {"configured_key": None, "model": None, "prompt": None}

    class FakeModel:
        def __init__(self, **kwargs):
            calls["model"] = kwargs

        def generate_content(self, prompt):
            calls["prompt"] = prompt
            return types.SimpleNamespace(text=response_text)

    fake_genai = types.ModuleType("google.generativeai")
    fake_genai.configure = lambda *, api_key: calls.update(configured_key=api_key)
    fake_genai.GenerativeModel = FakeModel
    monkeypatch.setitem(sys.modules, "google.generativeai", fake_genai)
    return calls


def test_gemini_valid_response_is_parsed_without_network(monkeypatch):
    response = [{
        "category": "Unsupported Claim",
        "severity": "high",
        "excerpt": "cures fatigue",
        "reason": "Unsupported medical claim.",
        "evidence_status": "unsupported",
        "source_ids": ["GUIDE-002"],
        "source_excerpt": "Do not make unsupported health claims.",
        "suggested_rewrite": "Human review required",
        "confidence": 0.95,
    }]
    calls = _install_fake_gemini(monkeypatch, json.dumps(response))
    reviewer = LLMReviewer()
    reviewer.api_key = "unit-test-gemini-key"

    findings = reviewer.analyze_content("cures fatigue", "Ad", [], [], [])

    assert len(findings) == 1
    assert findings[0].excerpt == "cures fatigue"
    assert calls["configured_key"] == "unit-test-gemini-key"
    assert calls["model"]["model_name"] == "gemini-1.5-flash"
    assert calls["prompt"]


@pytest.mark.parametrize("error", [TimeoutError("provider timed out"), ConnectionError("provider unavailable")])
def test_gemini_transport_errors_use_fallback(monkeypatch, error):
    reviewer = LLMReviewer()
    reviewer.api_key = "unit-test-gemini-key"
    fallback_result = []
    fallback_calls = []

    def fail_request(*args):
        raise error

    def fallback(text, content_type, guidelines, facts):
        fallback_calls.append((text, content_type, guidelines, facts))
        return fallback_result

    monkeypatch.setattr(reviewer, "_call_gemini_api", fail_request)
    monkeypatch.setattr(reviewer, "_heuristic_fallback_review", fallback)

    result = reviewer.analyze_content("review this", "Ad", [], [], [])

    assert result is fallback_result
    assert fallback_calls == [("review this", "Ad", [], [])]


@pytest.mark.parametrize("response_text", ['{"unexpected": []}', '{"findings": "not an array"}', 'null'])
def test_unexpected_gemini_response_uses_fallback(monkeypatch, response_text):
    _install_fake_gemini(monkeypatch, response_text)
    reviewer = LLMReviewer()
    reviewer.api_key = "unit-test-gemini-key"
    fallback_result = []
    fallback_calls = []

    def fallback(text, content_type, guidelines, facts):
        fallback_calls.append(text)
        return fallback_result

    monkeypatch.setattr(reviewer, "_heuristic_fallback_review", fallback)

    result = reviewer.analyze_content("review this", "Ad", [], [], [])

    assert result is fallback_result
    assert fallback_calls == ["review this"]
