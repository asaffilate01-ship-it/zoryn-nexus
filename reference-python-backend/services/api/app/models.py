from enum import StrEnum
from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class Status(StrEnum):
    DRAFT='DRAFT'; IN_REVIEW='IN_REVIEW'; ACTION_REQUIRED='ACTION_REQUIRED'; APPROVED='APPROVED'; RESTRICTED='RESTRICTED'; SUSPENDED='SUSPENDED'; CLOSED='CLOSED'

class CustomerCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    country: str = 'DE'

class BusinessCreate(BaseModel):
    legal_name: str = Field(min_length=2, max_length=160)
    registration_number: str = Field(min_length=2, max_length=80)
    email: EmailStr
    country: str = 'DE'

class TransferCreate(BaseModel):
    account_id: str
    beneficiary_name: str
    iban: str
    amount: float = Field(gt=0, le=1_000_000)
    currency: str = 'EUR'
    reference: str = Field(default='', max_length=140)

class PaymentLinkCreate(BaseModel):
    merchant_id: str
    amount: float = Field(gt=0, le=1_000_000)
    currency: str = 'EUR'
    description: str = Field(default='', max_length=180)

class CardCreate(BaseModel):
    account_id: str
    cardholder_name: str
    card_type: Literal['virtual','physical']='virtual'
    monthly_limit: float = Field(default=2500, ge=0)

class CardStatusUpdate(BaseModel):
    frozen: bool

class RefundCreate(BaseModel):
    payment_id: str
    amount: float = Field(gt=0)
    reason: str = Field(default='customer_request', max_length=120)

class LoyaltyAdjust(BaseModel):
    customer_id: str
    points: int
    reason: str = Field(min_length=2, max_length=160)

class SupportCaseCreate(BaseModel):
    requester_id: str
    subject: str = Field(min_length=3, max_length=160)
    category: Literal['account','card','payment','verification','complaint','other']='other'
    description: str = Field(min_length=5, max_length=4000)
