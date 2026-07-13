import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Activity } from './pages/Activity'
import { Dashboard } from './pages/Dashboard'
import { PaySlice } from './pages/PaySlice'
import { ReviewSplit } from './pages/ReviewSplit'
import { SentSuccess } from './pages/SentSuccess'
import { SliceLocked } from './pages/SliceLocked'
import { SplitCreator } from './pages/SplitCreator'
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
          <Route path="activity" element={<Activity />} />
          <Route path="vault" element={<Vault />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
