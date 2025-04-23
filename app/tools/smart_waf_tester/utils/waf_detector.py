import requests

def detect_waf(target):
    try:
        res = requests.get(target, timeout=5)
        server = res.headers.get('Server', 'Unknown')
        waf_detected = any(waf in server.lower() for waf in ['cloudflare', 'sucuri', 'imperva'])
        return {
            "server_header": server,
            "possible_waf": waf_detected
        }
    except:
        return {
            "server_header": "Error",
            "possible_waf": False
        }
