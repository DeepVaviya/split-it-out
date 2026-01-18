import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, getGroups, deleteGroup } from '../services/api';
import { useGuest } from '../context/GuestContext';
import { useToast } from '../context/ToastContext'; // Import Toast
import { useConfirm } from '../context/ConfirmContext'; // Import Confirm
import { useTheme } from '../context/ThemeContext'; // Import Theme
import { Plus, Users, Trash2, LogIn, UserPlus, Moon, Sun } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { darkMode, toggleTheme } = useTheme();
  
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [members, setMembers] = useState(['', '']);

  // Guest Logic
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const { createGuestGroup, getGuestGroups, deleteGuestGroup } = useGuest();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = isGuest ? await getGuestGroups() : await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const validMembers = members.filter(m => m.trim() !== '');
    if (validMembers.length < 2) {
      return addToast("Add at least 2 members!", "error");
    }

    if (!newGroupName.trim()) {
      return addToast("Please enter a group name!", "error");
    }

    try {
      const payload = { name: newGroupName, currency, members: validMembers };
      if (isGuest) await createGuestGroup(payload);
      else await createGroup(payload);
      
      setShowModal(false);
      setNewGroupName('');
      setMembers(['', '']);
      loadGroups();
      addToast("Group created successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error creating group";
      addToast(errorMessage, "error");
      console.error("Create group error:", err);
    }
  };

  const handleDeleteGroup = async (e, groupId) => {
    e.stopPropagation(); // Prevent clicking the card
    
    // Replaced window.confirm
    const isConfirmed = await confirm({
      title: "Delete Group?",
      message: "This will permanently remove the group and all its expenses."
    });

    if (!isConfirmed) return;

    try {
      if (isGuest) await deleteGuestGroup(groupId);
      else await deleteGroup(groupId);
      
      loadGroups();
      addToast("Group deleted successfully!"); // Added success toast
    } catch (err) {
      addToast("Failed to delete group", "error");
    }
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMemberField = () => setMembers([...members, '']);

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your shared expenses</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
          </button>
          {!isGuest && (
             <button onClick={() => {
                 localStorage.removeItem('token');
                 navigate('/');
                 addToast("Logged out successfully");
             }} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition">
               Logout
             </button>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:scale-105"
          >
            <Plus size={20} /> New Group
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div 
            key={group._id}
            onClick={() => navigate(`/group/${group._id}`)}
            className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{group.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Users size={16} />
                        <span>{group.members.length} members</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                        {group.currency}
                    </span>
                    {/* Delete Button */}
                    <button 
                        onClick={(e) => handleDeleteGroup(e, group._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition flex-shrink-0"
                        title="Delete Group"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
          </div>
        ))}
        
        {groups.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
                <div className="mb-4 flex justify-center"><Users size={48} className="opacity-20" /></div>
                <p>No groups yet. Create one to get started!</p>
            </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                  <input 
                    required
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
                    placeholder="e.g. Goa Trip 🌴" 
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select 
                        value={currency} 
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none dark:text-white"
                    >
                        <option value="₹">₹ INR</option>
                        <option value="$">$ USD</option>
                        <option value="€">€ EUR</option>
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Members</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {members.map((m, i) => (
                      <input 
                        key={i} 
                        value={m} 
                        onChange={e => handleMemberChange(i, e.target.value)} 
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none dark:text-white text-sm"
                        placeholder={`Member ${i + 1} Name`} 
                      />
                    ))}
                  </div>
                  <button 
                    type="button" 
                    onClick={addMemberField}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <UserPlus size={16} /> Add another member
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}