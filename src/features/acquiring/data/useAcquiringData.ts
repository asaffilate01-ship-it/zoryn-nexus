/** Stage 4 — React Query hooks over the acquiring repository. */
import { useQuery } from "@tanstack/react-query";
import { acquiringRepository } from "./acquiringRepository";

export function useAcquiringMerchants() {
  return useQuery({
    queryKey: ["acquiring-merchants"],
    queryFn: acquiringRepository.listMerchants,
  });
}

export function useStores(merchantId?: string) {
  return useQuery({
    queryKey: ["acquiring-stores", merchantId],
    queryFn: () => acquiringRepository.listStores(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function usePaymentLinks(merchantId?: string) {
  return useQuery({
    queryKey: ["acquiring-payment-links", merchantId],
    queryFn: () => acquiringRepository.listPaymentLinks(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function useAcquiringPayments(merchantId?: string) {
  return useQuery({
    queryKey: ["acquiring-payments", merchantId],
    queryFn: () => acquiringRepository.listPayments(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function useRefunds(paymentId?: string) {
  return useQuery({
    queryKey: ["acquiring-refunds", paymentId],
    queryFn: () => acquiringRepository.listRefunds(paymentId!),
    enabled: Boolean(paymentId),
  });
}

export function useChargebacks(paymentId?: string) {
  return useQuery({
    queryKey: ["acquiring-chargebacks", paymentId],
    queryFn: () => acquiringRepository.listChargebacks(paymentId!),
    enabled: Boolean(paymentId),
  });
}

export function useAcquiringSettlements(merchantId?: string) {
  return useQuery({
    queryKey: ["acquiring-settlements", merchantId],
    queryFn: () => acquiringRepository.listSettlements(merchantId!),
    enabled: Boolean(merchantId),
  });
}

export function useTerminals(merchantId?: string) {
  return useQuery({
    queryKey: ["acquiring-terminals", merchantId],
    queryFn: () => acquiringRepository.listTerminals(merchantId!),
    enabled: Boolean(merchantId),
  });
}