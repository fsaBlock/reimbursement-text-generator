import { useState } from 'react'
import { CompanyField } from './components/CompanyField'
import { Layout, type TabId } from './components/Layout'
import { PrivateCarModule } from './components/PrivateCarModule'
import { RailModule } from './components/RailModule'
import { TollModule } from './components/TollModule'

function App() {
  const [company, setCompany] = useState('')
  const [tab, setTab] = useState<TabId>('car')

  return (
    <Layout
      activeTab={tab}
      onTabChange={setTab}
      companyField={<CompanyField value={company} onChange={setCompany} />}
    >
      {tab === 'car' && <PrivateCarModule company={company} />}
      {tab === 'toll' && <TollModule company={company} />}
      {tab === 'rail' && <RailModule company={company} />}
    </Layout>
  )
}

export default App
