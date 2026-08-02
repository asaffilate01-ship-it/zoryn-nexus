/**
 * Stage 2 — React Query hooks over the Supabase repository.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformDataRepository } from "./platformDataRepository";

export function useProfile() {
  return useQuery({ queryKey: ["platform-profile"], queryFn: platformDataRepository.getProfile });
}

export function useOrganisations() {
  return useQuery({ queryKey: ["platform-organisations"], queryFn: platformDataRepository.getOrganisations });
}

export function useOrganisationMembers(organisationId?: string) {
  return useQuery({
    queryKey: ["platform-organisation-members", organisationId],
    queryFn: () => platformDataRepository.getOrganisationMembers(organisationId!),
    enabled: Boolean(organisationId),
  });
}

export function useAccounts() {
  return useQuery({ queryKey: ["platform-accounts"], queryFn: platformDataRepository.getAccounts });
}

export function usePots(accountId?: string) {
  return useQuery({
    queryKey: ["platform-pots", accountId],
    queryFn: () => platformDataRepository.getPots(accountId!),
    enabled: Boolean(accountId),
  });
}

export function useBeneficiaries() {
  return useQuery({ queryKey: ["platform-beneficiaries"], queryFn: platformDataRepository.getBeneficiaries });
}

export function useTransfers(accountId?: string) {
  return useQuery({
    queryKey: ["platform-transfers", accountId],
    queryFn: () => platformDataRepository.getTransfers(accountId!),
    enabled: Boolean(accountId),
  });
}

export function useCards(accountId?: string) {
  return useQuery({
    queryKey: ["platform-cards", accountId],
    queryFn: () => platformDataRepository.getCards(accountId!),
    enabled: Boolean(accountId),
  });
}

export function useMerchants() {
  return useQuery({ queryKey: ["platform-merchants"], queryFn: platformDataRepository.getMerchants });
}

export function usePayments(merchantId?: string) {
  return useQuery({
    queryKey: ["platform-payments", merchantId],
    queryFn: () => platformDataRepository.getPayments(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function useSettlements(merchantId?: string) {
  return useQuery({
    queryKey: ["platform-settlements", merchantId],
    queryFn: () => platformDataRepository.getSettlements(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformDataRepository.createTransfer,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["platform-transfers", variables.accountId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-accounts"] });
    },
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformDataRepository.createBeneficiary,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["platform-beneficiaries"] }),
  });
}

export function useCreatePot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformDataRepository.createPot,
    onSuccess: (_data, variables) =>
      void queryClient.invalidateQueries({ queryKey: ["platform-pots", variables.accountId] }),
  });
}

export function useCreateSupportCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformDataRepository.createSupportCase,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["platform-support-cases"] }),
  });
}
