import { Suspense } from 'react'
import ApplicationsClient from './ApplicationsClient'

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-gray-500">Loading applications...</div>}>
      <ApplicationsClient />
    </Suspense>
  )
}
