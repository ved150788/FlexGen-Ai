import sqlite3
import requests

conn = sqlite3.connect('threat_intel.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM iocs')
print('IOC count:', c.fetchone()[0])
conn.close()

url = "http://localhost:3000/api/tools/threat-intelligence/search?query="
try:
    response = requests.get(url)
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error connecting to API:", e) 