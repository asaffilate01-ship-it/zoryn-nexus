import os, hashlib, hmac, json
from uuid import uuid4
from datetime import datetime, timezone
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from .models import CustomerCreate, BusinessCreate, TransferCreate, PaymentLinkCreate, CardCreate, CardStatusUpdate, RefundCreate, LoyaltyAdjust, SupportCaseCreate
from .integrations.mock import MockSwan, MockAdyen

app=FastAPI(title='Zoryn API', version='0.2.0', description='Provider-independent financial experience layer for LoungeTech')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS','http://localhost:8080').split(','), allow_methods=['*'], allow_headers=['*'])
banking=MockSwan(); acquiring=MockAdyen(); loyalty={}; support_cases={}; audit=[]

def log(action, entity, entity_id, detail=None):
    audit.append({'id':'aud_'+uuid4().hex[:10],'action':action,'entity':entity,'entity_id':entity_id,'detail':detail or {},'created_at':datetime.now(timezone.utc).isoformat()})

@app.get('/health')
async def health(): return {'status':'ok','version':'0.2.0','banking_provider':'mock-swan','acquiring_provider':'mock-adyen'}

@app.get('/v1/demo/summary')
async def demo_summary():
    return {'personal':{'balance':4250.75,'points':1840,'monthly_spend':1268.40},'business':{'balance':18420.60,'today_sales':1248.20,'pending_settlement':3180.40,'active_cards':8},'merchant':{'today_sales':1248.20,'transactions':47,'average_ticket':26.56,'refunds':1},'admin':{'customers':12480,'businesses':1680,'kyc_review':28,'alerts':7,'monthly_volume':3840000}}

@app.get('/v1/demo/transactions')
async def demo_transactions():
    return [
      {'id':'tx_1','description':'REWE Markt','amount':-62.35,'currency':'EUR','status':'Completed','date':'2026-08-01T08:22:00Z','category':'Groceries'},
      {'id':'tx_2','description':'Salary payment','amount':2850.00,'currency':'EUR','status':'Completed','date':'2026-07-31T09:00:00Z','category':'Income'},
      {'id':'tx_3','description':'ZorynPay settlement','amount':1248.20,'currency':'EUR','status':'Completed','date':'2026-07-31T17:45:00Z','category':'Settlement'},
      {'id':'tx_4','description':'Deutsche Bahn','amount':-48.90,'currency':'EUR','status':'Completed','date':'2026-07-30T12:10:00Z','category':'Travel'},
      {'id':'tx_5','description':'Cafe Morgen','amount':-12.40,'currency':'EUR','status':'Completed','date':'2026-07-30T08:05:00Z','category':'Dining'}]

@app.post('/v1/customers')
async def create_customer(body: CustomerCreate):
    item=await banking.create_customer(body.model_dump()); log('customer.created','customer',item['id']); return item
@app.post('/v1/customers/{customer_id}/accounts')
async def open_account(customer_id: str):
    item=await banking.open_account(customer_id); log('account.opened','account',item['id']); return item
@app.post('/v1/businesses')
async def create_business(body: BusinessCreate):
    merchant=await acquiring.create_merchant(body.model_dump()); log('business.created','merchant',merchant['id']); return {'organisation':body.model_dump(),'merchant':merchant}
@app.post('/v1/transfers')
async def create_transfer(body: TransferCreate):
    item=await banking.create_transfer(body.model_dump()); log('transfer.created','transfer',item['id']); return item
@app.post('/v1/cards')
async def create_card(body: CardCreate):
    item=await banking.create_card(body.model_dump()); log('card.created','card',item['id']); return item
@app.patch('/v1/cards/{card_id}')
async def update_card(card_id:str, body:CardStatusUpdate):
    item=await banking.update_card(card_id,body.frozen); log('card.updated','card',card_id,{'frozen':body.frozen}); return item
@app.post('/v1/payment-links')
async def payment_link(body: PaymentLinkCreate):
    item=await acquiring.create_payment_link(body.model_dump()); log('payment_link.created','payment_link',item['id']); return item
@app.post('/v1/demo/payments')
async def demo_payment():
    item=await acquiring.create_demo_payment(); log('payment.captured','payment',item['id']); return item
@app.post('/v1/refunds')
async def refund(body:RefundCreate):
    item=await acquiring.refund(body.model_dump()); log('refund.created','refund',item['id']); return item
@app.post('/v1/loyalty/adjust')
async def adjust_loyalty(body:LoyaltyAdjust):
    loyalty[body.customer_id]=loyalty.get(body.customer_id,0)+body.points
    item={'customer_id':body.customer_id,'balance':loyalty[body.customer_id],'adjustment':body.points,'reason':body.reason}; log('loyalty.adjusted','customer',body.customer_id,item); return item
@app.post('/v1/support-cases')
async def create_support(body:SupportCaseCreate):
    cid='case_'+uuid4().hex[:12]; item={**body.model_dump(),'id':cid,'status':'OPEN','created_at':datetime.now(timezone.utc).isoformat()}; support_cases[cid]=item; log('support.created','support_case',cid); return item
@app.get('/v1/admin/audit')
async def get_audit(): return list(reversed(audit[-100:]))

async def verify_webhook(request: Request, signature: str|None, secret_env: str):
    body=await request.body(); secret=os.getenv(secret_env,'dev-secret').encode(); expected=hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not signature or not hmac.compare_digest(signature, expected): raise HTTPException(401,'Invalid webhook signature')
    return json.loads(body or b'{}')
@app.post('/webhooks/swan')
async def swan_webhook(request: Request, x_zoryn_signature: str|None=Header(default=None)):
    event=await verify_webhook(request,x_zoryn_signature,'SWAN_WEBHOOK_SECRET'); log('webhook.received','swan',event.get('id','unknown')); return {'accepted':True,'provider':'swan','event_type':event.get('type','unknown')}
@app.post('/webhooks/adyen')
async def adyen_webhook(request: Request, x_zoryn_signature: str|None=Header(default=None)):
    event=await verify_webhook(request,x_zoryn_signature,'ADYEN_WEBHOOK_SECRET'); log('webhook.received','adyen',event.get('id','unknown')); return {'accepted':True,'provider':'adyen','event_type':event.get('eventCode',event.get('type','unknown'))}
