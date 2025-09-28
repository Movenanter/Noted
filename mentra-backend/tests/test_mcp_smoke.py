from app.mcp import server as mcp
from app.services import llm_service


def test_mcp_tools_list_and_generate(monkeypatch):
    # Mock LLM service to avoid network and produce deterministic output
    monkeypatch.setenv("DEV_FAKE_LLM", "0")

    def fake_gen(text, types, max_per_type):
        out = {"qa": [], "cloze": [], "mc": []}
        if "qa" in types:
            out["qa"] = [{"question": "Q", "answer": "A", "source_ts": 0}]
        if "mc" in types:
            out["mc"] = [{"question": "M?", "answer": {"correct": "C", "choices": ["C","D1","D2","D3"]}, "source_ts": 1}]
        return out

    monkeypatch.setattr(llm_service, "generate_flashcards", fake_gen)
    monkeypatch.setattr(llm_service, "generate_from_image", fake_gen)

    # List tools
    assert "flashcards.generate" in mcp.TOOLS
    assert "flashcards.from_image" in mcp.TOOLS

    # Call generate with minimal params
    res = mcp.TOOLS["flashcards.generate"]({
        "transcript_text": "Newton's laws basics",
        "types": ["qa", "mc"],
        "max_per_type": 2,
    })
    assert isinstance(res, list)
    assert any(item.get("type") == "qa" for item in res)

    # Call from_image
    res2 = mcp.TOOLS["flashcards.from_image"]({
        "image_url": "https://example.com/foo.png",
        "types": ["qa"],
        "max_per_type": 1,
    })
    assert isinstance(res2, list)