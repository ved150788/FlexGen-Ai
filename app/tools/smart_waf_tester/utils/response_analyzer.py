def analyze_response(response):
    if response.status_code in [403, 406, 501, 999]:
        return "Likely blocked by WAF"
    elif "access denied" in response.text.lower():
        return "Blocked by rule"
    elif response.status_code == 200:
        return "Bypass may be successful"
    else:
        return "Unclear - needs manual review"
