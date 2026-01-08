import requests
import sys

def test_backend():
    """Test if backend is accessible"""
    urls = [
        "https://cloud-deploy-api-m77w.onrender.com/health",
        "https://cloud-deploy-api-m77w.onrender.com/",
        "https://cloud-deploy-api-m77w.onrender.com/docs"
    ]
    
    for url in urls:
        try:
            print(f"Testing {url}...")
            response = requests.get(url, timeout=10)
            print(f"✅ {url} - Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   Response: {response.json() if 'application/json' in response.headers.get('content-type', '') else 'OK'}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {url} - Error: {e}")
        print()

if __name__ == "__main__":
    test_backend()
