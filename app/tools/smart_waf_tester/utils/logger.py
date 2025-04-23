import json
import os
from datetime import datetime

LOG_DIR = "logs"

def log_result_to_json(scan_result):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"scan_{timestamp}.json"
    filepath = os.path.join(LOG_DIR, filename)

    try:
        with open(filepath, 'w') as f:
            json.dump(scan_result, f, indent=4)
        return {"status": "logged", "filename": filename}
    except Exception as e:
        return {"status": "error", "error": str(e)}
