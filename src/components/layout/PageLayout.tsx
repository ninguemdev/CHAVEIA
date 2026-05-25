import type { ReactNode } from 'react'
import { PageBackButton } from './PageBackButton'

type PageLayoutProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  showBackButton?: boolean
  backTo?: string
}

export function PageLayout({
  children,
  title,
  subtitle,
  actions,
  showBackButton = true,
  backTo,
}: PageLayoutProps) {
  const titleId = title ? `${title.toLowerCase().replace(/\s+/g, '-')}-title` : undefined

  return (
    <>
      {showBackButton && <PageBackButton fallbackHref={backTo} />}
      {title && (
        <section className="page-header" aria-labelledby={titleId}>
          <div>
            <h1 id={titleId}>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="page-header-action">{actions}</div>}
        </section>
      )}
      {children}
    </>
  )
}
