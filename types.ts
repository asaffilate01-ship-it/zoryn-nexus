import { createFileRoute } from '@tanstack/react-router'
import { OnboardingWorkspace } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/onboarding')({ component: OnboardingWorkspace })
