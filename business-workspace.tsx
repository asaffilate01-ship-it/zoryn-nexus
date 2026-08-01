import { createFileRoute } from '@tanstack/react-router'
import { OperationsWorkspace } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/operations')({ component: OperationsWorkspace })
