import { Suspense } from 'react';
import { SkeletonCurrencyConverter } from './components/SkeletonCurrencyConverter';
import { CurrencyConverter } from './components/CurrencyConverter';

const App = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SkeletonCurrencyConverter />
      </div>
    }
  >
    <CurrencyConverter />
  </Suspense>
);

export default App;
