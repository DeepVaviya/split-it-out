import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroup, addExpense } from '../services/api';
import { Plus, Wallet, Receipt, Users } from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');

  const refreshData = async () => {
    const res = await getGroup(id);
    setData(res.data);
  };

  useEffect(() => { refreshData(); }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!payerId) return alert("Select who paid!");
    
    // Simple logic: 1 person paid everything (as per prompt simplicity req)
    // You can expand this to multi-payer inputs if needed
    await addExpense({
      groupId: id,
      title,
      amount: parseFloat(amount),
      payments: [{ member_id: payerId, amount: parseFloat(amount) }]
    });
    
    setShowModal(false);
    setTitle(''); setAmount('');
    refreshData();
  };

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">{data.group.name}</h1>
        <div className="text-gray-500 text-sm mt-1">
           Members: {data.group.members.map(m => m.name).join(', ')}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-200 p-1 rounded-lg">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${activeTab === 'expenses' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
        >
          Expenses
        </button>
        <button 
          onClick={() => setActiveTab('settlements')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${activeTab === 'settlements' ? 'bg-white shadow text-green-600' : 'text-gray-600'}`}
        >
          Settlements
        </button>
      </div>

      {/* Content */}
      {activeTab === 'expenses' ? (
        <div className="space-y-3">
          {/* Add Button */}
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Expense
          </button>

          {/* Expense List (Currently empty in new group, would map here) */}
             <div className="text-center text-gray-400 py-4 text-sm">
                Expenses will appear here.
             </div>
        </div>
      ) : (
        <div className="space-y-3">
            {data.settlements.length === 0 ? (
                <div className="text-center text-gray-500 py-10">All settled up! 🎉</div>
            ) : (
                data.settlements.map((s, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <Wallet size={18} />
                            </div>
                            <div>
                                <span className="font-semibold text-gray-800">{s.from}</span>
                                <span className="text-gray-500 text-sm px-2">pays</span>
                                <span className="font-semibold text-gray-800">{s.to}</span>
                            </div>
                        </div>
                        <span className="font-bold text-green-600">{data.group.currency} {s.amount}</span>
                    </div>
                ))
            )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="e.g. Dinner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 p-2 border rounded-lg" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Who Paid?</label>
                <select required value={payerId} onChange={e => setPayerId(e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-white">
                  <option value="">Select Member</option>
                  {data.group.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-white bg-blue-600 rounded-lg font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}