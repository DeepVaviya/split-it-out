import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroup, addExpense, deleteExpense, getExpenses } from '../services/api';
import { useGuest } from '../context/GuestContext';
import { Plus, Wallet, Receipt, Users, ArrowLeft, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [date, setDate] = useState(''); // Added date state

  // Guest Logic
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const { getGuestGroup, addGuestExpense, getGuestExpenses, deleteGuestExpense } = useGuest();

  const refreshData = async () => {
    try {
      if (isGuest) {
        const groupRes = await getGuestGroup(id);
        const expensesRes = await getGuestExpenses(id);
        setData({ group: groupRes.data.group, expenses: expensesRes.data, settlements: groupRes.data.settlements });
      } else {
        const res = await getGroup(id);
        // Backend now returns { group, settlements }, we fetch expenses separately
        const expensesRes = await getExpenses(id);
        setData({ ...res.data, expenses: expensesRes.data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!payerId) return alert("Select who paid!");
    
    const payload = {
      groupId: id,
      title,
      amount: parseFloat(amount),
      date: date || new Date().toISOString(), // Pass date
      payments: [{ member_id: payerId, amount: parseFloat(amount) }]
    };

    try {
        if (isGuest) await addGuestExpense(payload);
        else await addExpense(payload);
        
        setShowModal(false);
        setTitle(''); setAmount(''); setDate(''); // Reset date
        refreshData();
    } catch (err) {
        alert("Error adding expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
      if(!confirm("Delete this expense?")) return;
      if(isGuest) await deleteGuestExpense(expenseId);
      else await deleteExpense(expenseId);
      refreshData();
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Group not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-screen">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-4 transition">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{data.group.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    <Users size={16} />
                    {data.group.members.map(m => m.name).join(', ')}
                </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                {data.group.currency} Currency
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'expenses' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Expenses
        </button>
        <button 
          onClick={() => setActiveTab('settlements')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'settlements' ? 'bg-white dark:bg-gray-800 shadow text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Settlements
        </button>
      </div>

      {/* Content */}
      {activeTab === 'expenses' ? (
        <div className="space-y-4">
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} /> Add New Expense
          </button>

          {data.expenses && data.expenses.length > 0 ? (
              data.expenses.map(expense => (
                  <div key={expense._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${expense.isSettled ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                              <Receipt size={20} />
                          </div>
                          <div>
                              <h4 className={`font-bold text-gray-800 dark:text-gray-200 ${expense.isSettled ? 'line-through opacity-50' : ''}`}>{expense.title}</h4>
                              <p className="text-xs text-gray-500">
                                  Paid by <span className="font-medium">{data.group.members.find(m => m._id === expense.paid_by[0].member_id)?.name || 'Unknown'}</span>
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                              <div className="font-bold text-gray-800 dark:text-white">{data.group.currency} {expense.amount}</div>
                              <div className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleDeleteExpense(expense._id)} title="Delete" className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-500">
                                <Trash2 size={18} />
                            </button>
                          </div>
                      </div>
                  </div>
              ))
          ) : (
             <div className="text-center text-gray-400 py-10">No expenses yet. Add one above!</div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
            {!data.settlements || data.settlements.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-white dark:bg-gray-800 rounded-xl">All settled up! 🎉 No pending debts.</div>
            ) : (
                data.settlements.map((s, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                                <Wallet size={20} />
                            </div>
                            <div className="text-gray-800 dark:text-gray-200">
                                <span className="font-bold">{s.from}</span>
                                <span className="text-gray-500 px-2">owes</span>
                                <span className="font-bold">{s.to}</span>
                            </div>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">{data.group.currency} {s.amount}</span>
                    </div>
                ))
            )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Dinner at Taj" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Who Paid?</label>
                <select required value={payerId} onChange={e => setPayerId(e.target.value)} className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select Member</option>
                  {data.group.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-white bg-blue-600 rounded-lg font-bold">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}