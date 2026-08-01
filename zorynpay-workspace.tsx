import { createFileRoute } from '@tanstack/react-router'
import { ProductionReady } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/production-ready')({ component: ProductionReady })
