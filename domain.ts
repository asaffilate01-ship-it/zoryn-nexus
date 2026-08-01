import { createFileRoute } from "@tanstack/react-router";
import { ProviderReadyCentre } from "@/features/provider-ready/components/ProviderReadyCentre";
export const Route = createFileRoute("/scenario-lab")({ component: ProviderReadyCentre });
