import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Activity } from './pages/Activity'
import { Dashboard } from './pages/Dashboard'
import { ReviewSplit } from './pages/ReviewSplit'
import { SplitCreator } from './pages/SplitCreator'
import { Vault } from './pages/Vault'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<SplitCreator />} />
          <Route path="review" element={<ReviewSplit />} />
          <Route path="activity" element={<Activity />} />
          <Route path="vault" element={<Vault />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
