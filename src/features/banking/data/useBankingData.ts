/** Stage 2 — React Query hooks over the banking repository. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bankingRepository } from "./bankingRepository";

export function useBankingCustomers() {
  return useQuery({ queryKey: ["banking-customers"], queryFn: bankingRepository.getCustomers });
}

export function useBankingAccounts() {
  return useQuery({ queryKey: ["banking-accounts"], queryFn: bankingRepository.listAccounts });
}

export function useBankingTransactions(accountId?: string) {
  return useQuery({
    queryKey: ["banking-transactions", accountId],
    queryFn: () => bankingRepository.listTransactions(accountId!),
    enabled: Boolean(accountId),
  });
}

export function useBankingCards(accountId?: string) {
  return useQuery({
    queryKey: ["banking-cards", accountId],
    queryFn: () => bankingRepository.listCards(accountId!),
    enabled: Boolean(accountId),
  });
}

export function useBankingBeneficiaries() {
  return useQuery({
    queryKey: ["banking-beneficiaries"],
    queryFn: bankingRepository.listBeneficiaries,
  });
}

export function useOnboardingActions(caseId?: string) {
  return useQuery({
    queryKey: ["banking-onboarding-actions", caseId],
    queryFn: () => bankingRepository.listOnboardingActions(caseId!),
    enabled: Boolean(caseId),
  });
}

export function useCreateBankingTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bankingRepository.createTransfer,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["banking-accounts"] });
      void queryClient.invalidateQueries({
        queryKey: ["banking-transactions", variables.accountId],
      });
    },
  });
}