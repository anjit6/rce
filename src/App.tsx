import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RulesPage from './pages/rules';
import RuleCreatePage from './pages/rules/create';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/rules" replace />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/rule/create/:ruleId" element={<RuleCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
