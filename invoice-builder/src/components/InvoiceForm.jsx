import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const InvoiceForm = () => {
  const [client, setClient] = useState({
    name: '',
    address: '',
    invoiceNumber: '',
    date: '',
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const [taxRate, setTaxRate] = useState(0.18); // 18%

  // Handle client field change
  const handleClientChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  // Handle line item field change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === 'description' ? value : parseFloat(value);
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    setItems(updatedItems);
  };

  // Add new line item
  const addItem = () => {
    const lastItem = items[items.length - 1];
    if (!lastItem.description.trim()) return;
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  // Remove a line item
  const removeItem = (index) => {
    if (items.length === 1) {
      alert('At least one item is required.');
      return;
    }
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Calculations
  const calculateSubtotal = () => items.reduce((acc, item) => acc + item.amount, 0);
  const calculateTax = () => calculateSubtotal() * taxRate;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  // Export to PDF
  const downloadPDF = () => {
    const invoice = document.getElementById('invoice-preview');
    html2pdf()
      .set({
        margin: 0.5,
        filename: `${client.invoiceNumber || 'invoice'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .from(invoice)
      .save();
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {['name', 'address', 'invoiceNumber', 'date'].map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize mb-1">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={field === 'date' ? 'date' : 'text'}
              name={field}
              value={client[field]}
              onChange={handleClientChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}
        <div>
          <label className="block font-medium mb-1">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={taxRate * 100}
            onChange={(e) => setTaxRate(e.target.value / 100)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Items</h2>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 items-center">
          <input
            type="text"
            placeholder="Description"
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            min="0"
            value={item.rate}
            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <div className="flex justify-between items-center">
            <span className="font-semibold mr-2">₹{item.amount.toFixed(2)}</span>
            {items.length > 1 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    removeItem(index);
                  }
                }}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add Item
      </button>

      <div id="invoice-preview" className="border-t pt-4 mt-6 text-sm">
        <h2 className="text-xl font-semibold mb-2">Invoice Summary</h2>
        <p>
          <strong>Client Name:</strong> {client.name}
        </p>
        <p>
          <strong>Address:</strong> {client.address}
        </p>
        <p>
          <strong>Invoice No:</strong> {client.invoiceNumber}
        </p>
        <p>
          <strong>Date:</strong> {client.date}
        </p>

        <table className="w-full mt-4 text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Rate</th>
              <th className="p-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="p-2 border">{item.description}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">₹{item.rate.toFixed(2)}</td>
                <td className="p-2 border">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <p>
            <strong>Subtotal:</strong> ₹{calculateSubtotal().toFixed(2)}
          </p>
          <p>
            <strong>Tax ({(taxRate * 100).toFixed(0)}%):</strong> ₹{calculateTax().toFixed(2)}
          </p>
          <p className="text-lg font-bold">
            <strong>Total:</strong> ₹{calculateTotal().toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4 no-print">
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Print Invoice
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
