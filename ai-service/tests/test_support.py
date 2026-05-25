from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ask_support_mocked():
    payload = {
        "phone_number": "5511999999999",
        "tenant_id": "tenant-123",
        "message": "Preciso de ajuda com o meu atestado."
    }
    
    response = client.post("/api/support/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Entendi que você precisa de ajuda" in data["reply"]
    assert "tenant-123" in data["reply"]
