import { createFileRoute } from '@tanstack/react-router'
import { PersonalWorkspace } from '@/features/production-ready/workspaces'
export const Route = createFileRoute('/personal-workspace')({ component: PersonalWorkspace })
