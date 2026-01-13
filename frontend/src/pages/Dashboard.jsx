import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyGroups, createGroup, deleteGroup } from '../services/api';
import { useGuest } from '../context/GuestContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Plus, Trash2, Moon, Sun, Users } from 'lucide-react';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  // FIX: Corrected variable name from 'SF' to 'setLoading'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  
  // Guest Context
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const { getGuestGroups, createGuestGroup, deleteGuestGroup } = useGuest();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchGroups = async () => {
    try {
      const res = isGuest ? await getGuestGroups() : await getMyGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to load groups", err);
    } finally {
      // This caused the error because setLoading was named SF before
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const membersArray = newGroupMembers.split(',').map(m => m.trim()).filter(m => m);
    // Add current user to members if not guest
    if (!isGuest && user.name && !membersArray.includes(user.name)) {
        membersArray.push(user.name);
    }

    const payload = {
      name: newGroupName,
      members: membersArray.length > 0 ? membersArray : ['Member 1', 'Member 2'],
      currency: '₹'
    };

    try {
      if (isGuest) {
        await createGuestGroup(payload);
      } else {
        await createGroup(payload);
      }
      setShowModal(false);
      setNewGroupName('');
      setNewGroupMembers('');
      fetchGroups();
    } catch (err) {
      alert("Failed to create group");
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      if (isGuest) {
        await deleteGuestGroup(id);
      } else {
        await deleteGroup(id);
      }
      fetchGroups();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">split-it-out</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-300 hidden sm:block">Hi, {user.name || 'Guest'}</span>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium">
            <LogOut size={20} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Your Groups</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage expenses with your friends</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition transform hover:scale-105"
          >
            <Plus size={20} /> Create Group
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">No groups yet</h3>
            <p className="text-gray-500 mb-6">Create a group to start splitting expenses!</p>
            <button onClick={() => setShowModal(true)} className="text-blue-600 hover:underline">Create your first group</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => (
              <Link to={`/group/${group._id}`} key={group._id} className="block group relative">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition h-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {group.name}
                    </h3>
                    <button 
                      onClick={(e) => handleDelete(e, group._id)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-4 flex items-center gap-2">
                    <Users size={16} />
                    {group.members?.length || 0} Members
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Goa Trip 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Members (comma separated)</label>
                <input 
                  type="text" 
                  value={newGroupMembers}
                  onChange={e => setNewGroupMembers(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John, Alice, Bob"
                />
                <p className="text-xs text-gray-500 mt-1">You are automatically added to the group.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1yb py-3 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
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