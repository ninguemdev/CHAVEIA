import type { ReactNode } from 'react'
import { PageLayout } from './PageLayout'
import { SiteHeader } from './SiteHeader'

type AuthenticatedShellProps = {
  subtitle: string
  children: ReactNode
  showBackButton?: boolean
  backTo?: string
}

export function AuthenticatedShell({
  subtitle,
  children,
  showBackButton = true,
  backTo,
}: AuthenticatedShellProps) {
  return (
    <div className="app-shell">
      <SiteHeader subtitle={subtitle} />
      <main className="app-main">
        <PageLayout showBackButton={showBackButton} backTo={backTo}>
          {children}
        </PageLayout>
      </main>
    </div>
  )
}
