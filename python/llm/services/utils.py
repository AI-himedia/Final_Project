from typing import Optional

def merge_analysis_results(previous: Optional[dict], current: dict) -> dict:
    if not previous:
        return current

    merged = {}

    # tone_style은 가장 최근 걸로 덮어씀
    merged["tone_style"] = current.get("tone_style") or previous.get("tone_style")

    # common_phrases와 example_lines는 중복 없이 합치기
    merged["common_phrases"] = list({
        phrase.strip()
        for phrase in (previous.get("common_phrases", []) + current.get("common_phrases", []))
        if phrase.strip()
    })

    merged["example_lines"] = list({
        line.strip()
        for line in (previous.get("example_lines", []) + current.get("example_lines", []))
        if line.strip()
    })

    return merged
