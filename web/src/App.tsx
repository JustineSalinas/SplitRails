import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Activity } from './pages/Activity'
import { AuditComplete } from './pages/AuditComplete'
import { AuditLedger } from './pages/AuditLedger'
import { Dashboard } from './pages/Dashboard'
import { PaySlice } from './pages/PaySlice'
import { ReviewSplit } from './pages/ReviewSplit'
import { SentSuccess } from './pages/SentSuccess'
import { SliceLocked } from './pages/SliceLocked'
import { SplitCreator } from './pages/SplitCreator'
import { SplitExpired } from './pages/SplitExpired'
import { Vault } from './pages/Vault'
import { ViewAudit } from './pages/ViewAudit'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<SplitCreator />} />
          <Route path="review" element={<ReviewSplit />} />
          <Route path="sent" element={<SentSuccess />} />
          <Route path="pay" element={<PaySlice />} />
          <Route path="locked" element={<SliceLocked />} />
          <Route path="audit" element={<ViewAudit />} />
          <Route path="audit-complete" element={<AuditComplete />} />
          <Route path="audit-ledger" element={<AuditLedger />} />
          <Route path="expired" element={<SplitExpired />} />
          <Route path="activity" element={<Activity />} />
          <Route path="vault" element={<Vault />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
