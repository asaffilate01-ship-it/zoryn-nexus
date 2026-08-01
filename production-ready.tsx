import { createFileRoute } from '@tanstack/react-router'
import { BusinessWorkspace } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/business-workspace')({ component: BusinessWorkspace })
