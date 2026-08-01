import { createFileRoute } from '@tanstack/react-router'
import { PayWorkspace } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/zorynpay-workspace')({ component: PayWorkspace })
