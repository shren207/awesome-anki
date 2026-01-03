import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CardBrowser } from './pages/CardBrowser';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Placeholder pages
function SplitWorkspace() {
  return (
    <div>
      <h1 className="text-3xl font-bold">분할 작업</h1>
      <p className="text-muted-foreground">Phase 3에서 구현 예정</p>
    </div>
  );
}

function BackupManager() {
  return (
    <div>
      <h1 className="text-3xl font-bold">백업 관리</h1>
      <p className="text-muted-foreground">Phase 4에서 구현 예정</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="split" element={<SplitWorkspace />} />
            <Route path="browse" element={<CardBrowser />} />
            <Route path="backups" element={<BackupManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
