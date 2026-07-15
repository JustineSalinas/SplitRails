import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { WalletProvider } from './context/WalletContext'
import { AuditComplete } from './pages/AuditComplete'
import { AuditLedger } from './pages/AuditLedger'
import { Dashboard } from './pages/Dashboard'
import { Finance } from './pages/Finance'
import { History } from './pages/History'
import { Login } from './pages/Login'
import { PasskeyDemo } from './pages/PasskeyDemo'
import { PaySlice } from './pages/PaySlice'
import { Profile } from './pages/Profile'
import { ReviewSplit } from './pages/ReviewSplit'
import { SentSuccess } from './pages/SentSuccess'
import { SignUp } from './pages/SignUp'
import { SliceLocked } from './pages/SliceLocked'
import { SplitCreator } from './pages/SplitCreator'
import { SplitExpired } from './pages/SplitExpired'
import { Vault } from './pages/Vault'
import { ViewAudit } from './pages/ViewAudit'

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
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
            <Route path="activity" element={<History />} />
            <Route path="vault" element={<Vault />} />
            <Route path="finance" element={<Finance />} />
            <Route path="profile" element={<Profile />} />
            <Route path="passkey-demo" element={<PasskeyDemo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App
