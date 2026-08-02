import { createFileRoute } from "@tanstack/react-router";
import { LaunchBlockersCentre } from "@/features/go-live/LaunchBlockersCentre";

export const Route = createFileRoute("/_authenticated/launch-blockers")({
  component: LaunchBlockersCentre,
});
