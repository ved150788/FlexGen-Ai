from flask import Blueprint, request, jsonify
from utils.payloads import get_payloads
from utils.waf_detector import detect_waf
from utils.response_analyzer import analyze_response
from utils.logger import log_result_to_json
import requests

scan_bp = Blueprint('scan', __name__)

@scan_bp.route('/scan', methods=['POST'])
def run_scan():
    data = request.json

    # Required input: target URL
    target = data.get('target')
    if not target:
        return jsonify({"error": "Target URL is required"}), 400

    method = data.get('method', 'GET').upper()
    headers = data.get('headers', {})

    # Fetch payloads
    payloads = get_payloads()

    results = []

    # Loop through each payload
    for payload in payloads:
        try:
            if method == 'GET':
                response = requests.get(f"{target}?input={payload}", headers=headers, timeout=5)
            else:
                response = requests.post(target, data={"input": payload}, headers=headers, timeout=5)

            analysis = analyze_response(response)

            results.append({
                "payload": payload,
                "status_code": response.status_code,
                "length": len(response.text),
                "analysis": analysis
            })

        except Exception as e:
            results.append({
                "payload": payload,
                "error": str(e)
            })

    # WAF detection
    waf_info = detect_waf(target)

    # Build result summary
    scan_summary = {
        "target": target,
        "method": method,
        "waf": waf_info,
        "results": results
    }

    # Log results to JSON
    log_status = log_result_to_json(scan_summary)

    # Return both the summary and log file info
    return jsonify({
        "scan": scan_summary,
        "log_status": log_status
    })
