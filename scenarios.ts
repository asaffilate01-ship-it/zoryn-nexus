export type PlatformRole = 'personal_customer'|'business_owner'|'business_admin'|'finance_manager'|'employee'|'merchant_manager'|'support_agent'|'compliance_reviewer'|'platform_admin'
export type LifecycleStatus = 'draft'|'verification_required'|'action_required'|'under_review'|'active'|'restricted'|'suspended'|'closing'|'closed'|'rejected'
export type TransactionStatus = 'pending'|'booked'|'failed'|'returned'|'reversed'|'refunded'|'disputed'
export type ProviderName = 'mock'|'swan'|'adyen'|'rewards'
export interface Money { amount: number; currency: 'EUR' }
export interface ActionRequired { code:string; title:string; description:string; cta:string; severity:'info'|'warning'|'critical' }
export interface Scenario { id:string; area:'personal'|'business'|'pay'|'admin'; title:string; description:string; status:LifecycleStatus; tags:string[] }
