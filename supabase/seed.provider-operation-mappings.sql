-- Development/staging only: mock operation mappings so provider activation can
-- be run in mock mode. Never seed sandbox or live mappings here.
insert into public.platform_provider_operation_mappings(
  provider,operation,environment,api_family,http_method,endpoint_template,enabled,metadata
) values
  ('swan','start_individual_onboarding','mock','onboarding','POST','/mock/swan/onboarding/individual',true,'{"fixture":true}'),
  ('swan','start_company_onboarding','mock','onboarding','POST','/mock/swan/onboarding/company',true,'{"fixture":true}'),
  ('swan','create_transfer','mock','payments','POST','/mock/swan/transfers',true,'{"fixture":true}'),
  ('swan','issue_card','mock','cards','POST','/mock/swan/cards',true,'{"fixture":true}'),
  ('adyen','create_legal_entity','mock','legal-entity','POST','/mock/adyen/legal-entities',true,'{"fixture":true}'),
  ('adyen','create_store','mock','management','POST','/mock/adyen/stores',true,'{"fixture":true}'),
  ('adyen','create_payment_session','mock','checkout','POST','/mock/adyen/sessions',true,'{"fixture":true}'),
  ('adyen','create_payment_link','mock','checkout','POST','/mock/adyen/payment-links',true,'{"fixture":true}'),
  ('adyen','refund_payment','mock','checkout','POST','/mock/adyen/refunds',true,'{"fixture":true}')
on conflict(provider,operation,environment) do update
set endpoint_template=excluded.endpoint_template,
    enabled=excluded.enabled,
    metadata=excluded.metadata;