import React from 'react';
import InvoiceForm from './components/InvoiceForm';

const App = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Invoice Builder</h1>
      <InvoiceForm />
    </div>
  );
};

export default App;
