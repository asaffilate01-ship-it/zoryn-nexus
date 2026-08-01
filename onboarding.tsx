import { createFileRoute } from '@tanstack/react-router'
import { ScenarioLab } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/scenario-lab')({ component: ScenarioLab })
