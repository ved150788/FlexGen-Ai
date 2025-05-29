#!/usr/bin/env python3
import requests

def test_search():
    """Test search functionality"""
    print("🔍 Testing Search Functionality")
    print("=" * 40)
    
    test_queries = ["T1055", "malware", "CVE-", "192.168"]
    
    for query in test_queries:
        try:
            # Test Flask backend directly
            response = requests.get(f"http://localhost:5000/api/search?query={query}")
            print(f"Flask Backend - Query '{query}': Status {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                results_count = len(data.get('results', []))
                print(f"  Results: {results_count}")
            
            # Test Next.js API route
            response2 = requests.get(f"http://localhost:3000/api/tools/threat-intelligence/search?query={query}")
            print(f"Next.js API - Query '{query}': Status {response2.status_code}")
            if response2.status_code == 200:
                data2 = response2.json()
                results_count2 = len(data2.get('results', []))
                print(f"  Results: {results_count2}")
            
        except Exception as e:
            print(f"Error testing '{query}': {str(e)}")
        print()

if __name__ == "__main__":
    test_search() 