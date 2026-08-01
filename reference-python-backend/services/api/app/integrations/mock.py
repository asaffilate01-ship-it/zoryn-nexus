from uuid import uuid4
from datetime import datetime, timezone

NOW=lambda: datetime.now(timezone.utc).isoformat()

class MockSwan:
    def __init__(self):
        self.customers={}; self.accounts={}; self.cards={}; self.transfers={}
    async def create_customer(self,data):
        cid='cus_'+uuid4().hex[:12]
        item={**data,'id':cid,'status':'IN_REVIEW','provider':'mock-swan','created_at':NOW()}
        self.customers[cid]=item; return item
    async def open_account(self,customer_id):
        aid='acc_'+uuid4().hex[:12]
        item={'id':aid,'customer_id':customer_id,'iban':'DE89 3704 0044 '+str(int(uuid4().hex[:12],16))[:10], 'currency':'EUR','available_balance':4250.75,'status':'APPROVED','provider':'mock-swan','created_at':NOW()}
        self.accounts[aid]=item; return item
    async def create_transfer(self,data):
        tid='trf_'+uuid4().hex[:12]
        item={**data,'id':tid,'status':'APPROVED','provider':'mock-swan','created_at':NOW()}
        self.transfers[tid]=item; return item
    async def create_card(self,data):
        cid='crd_'+uuid4().hex[:12]
        item={**data,'id':cid,'last4':str(int(uuid4().hex[:8],16))[-4:],'scheme':'VISA','status':'ACTIVE','frozen':False,'provider':'mock-swan','created_at':NOW()}
        self.cards[cid]=item; return item
    async def update_card(self,card_id,frozen):
        item=self.cards.get(card_id,{'id':card_id,'status':'ACTIVE'})
        item['frozen']=frozen; item['status']='FROZEN' if frozen else 'ACTIVE'; self.cards[card_id]=item
        return item

class MockAdyen:
    def __init__(self): self.merchants={}; self.links={}; self.payments={}; self.refunds={}
    async def create_merchant(self,data):
        mid='mrc_'+uuid4().hex[:12]
        item={**data,'id':mid,'status':'IN_REVIEW','provider':'mock-adyen','created_at':NOW()}
        self.merchants[mid]=item; return item
    async def create_payment_link(self,data):
        lid='plink_'+uuid4().hex[:12]
        item={**data,'id':lid,'url':f'https://pay.zoryn.test/{lid}','status':'ACTIVE','provider':'mock-adyen','created_at':NOW()}
        self.links[lid]=item; return item
    async def create_demo_payment(self,merchant_id='mrc_demo',amount=24.90):
        pid='pay_'+uuid4().hex[:12]
        item={'id':pid,'merchant_id':merchant_id,'amount':amount,'currency':'EUR','status':'CAPTURED','method':'contactless','provider':'mock-adyen','created_at':NOW()}
        self.payments[pid]=item; return item
    async def refund(self,data):
        rid='ref_'+uuid4().hex[:12]
        item={**data,'id':rid,'status':'RECEIVED','provider':'mock-adyen','created_at':NOW()}
        self.refunds[rid]=item; return item
