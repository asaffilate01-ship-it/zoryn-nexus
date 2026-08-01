from fastapi.testclient import TestClient
from services.api.app.main import app
client=TestClient(app)
def test_health():
    r=client.get('/health'); assert r.status_code==200; assert r.json()['version']=='0.2.0'
def test_demo_summary():
    r=client.get('/v1/demo/summary'); assert r.status_code==200; assert 'business' in r.json()
def test_customer_account_card_transfer_flow():
    c=client.post('/v1/customers',json={'first_name':'Amer','last_name':'Saleem','email':'amer@example.com','country':'DE'}).json()
    a=client.post(f"/v1/customers/{c['id']}/accounts").json()
    card=client.post('/v1/cards',json={'account_id':a['id'],'cardholder_name':'Amer Saleem','card_type':'virtual','monthly_limit':2500})
    assert card.status_code==200 and card.json()['last4']
    t=client.post('/v1/transfers',json={'account_id':a['id'],'beneficiary_name':'Demo GmbH','iban':'DE89370400440532013000','amount':25,'currency':'EUR','reference':'Demo'})
    assert t.status_code==200 and t.json()['status']=='APPROVED'
def test_business_payment_link():
    b=client.post('/v1/businesses',json={'legal_name':'LoungeTech GmbH','registration_number':'HRB123','email':'ops@example.com','country':'DE'}).json()
    r=client.post('/v1/payment-links',json={'merchant_id':b['merchant']['id'],'amount':19.99,'currency':'EUR','description':'Subscription'})
    assert r.status_code==200 and r.json()['url'].startswith('https://')
