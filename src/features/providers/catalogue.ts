export type ProviderName = "swan" | "adyen";

export const requiredProviderOperations: Record<ProviderName, string[]> = {
  swan: [
    "start_individual_onboarding",
    "start_company_onboarding",
    "get_onboarding_status",
    "list_accounts",
    "get_account_balance",
    "list_transactions",
    "create_transfer",
    "confirm_transfer",
    "issue_card",
    "activate_card",
    "freeze_card",
    "unfreeze_card",
  ],
  adyen: [
    "create_legal_entity",
    "create_account_holder",
    "create_store",
    "get_capabilities",
    "create_payment_session",
    "create_payment_link",
    "capture_payment",
    "cancel_payment",
    "refund_payment",
    "list_settlements",
    "register_terminal",
    "create_tap_to_pay_session",
  ],
};
