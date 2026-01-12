import { useState, useEffect } from 'react';
import { getMyGroups, createGroup } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [membersStr, setMembersStr] = useState(''); // "Rahul, Aman"
  const navigate = useNavigate();

  useEffect(() => {
    getMyGroups().then(res => setGroups(res.data)).catch(() => navigate('/'));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const members = membersStr.split(',').map(s => s.trim()).filter(Boolean);
    if(members.length < 1) return alert("Add at least 1 member");
    
    await createGroup({ name: newGroupName, members, currency: '₹' });
    setNewGroupName(''); setMembersStr('');
    
    // Refresh list
    const res = await getMyGroups();
    setGroups(res.data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Groups</h1>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-red-500 text-sm">Logout</button>
      </div>

      {/* Create Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="font-semibold mb-4">Start a new group</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input 
            placeholder="Group Name (e.g. Goa Trip)" 
            className="w-full p-3 border rounded-lg"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            required
          />
          <input 
            placeholder="Members (comma separated: Rahul, Priya)" 
            className="w-full p-3 border rounded-lg"
            value={membersStr}
            onChange={e => setMembersStr(e.target.value)}
            required
          />
          <button className="w-full bg-black text-white py-3 rounded-lg font-medium">Create Group</button>
        </form>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {groups.map(g => (
          <Link to={`/group/${g._id}`} key={g._id} className="block bg-white p-5 rounded-xl border hover:border-blue-500 transition shadow-sm">
            <div className="flex justify-between">
              <span className="font-bold text-lg">{g.name}</span>
              <span className="bg-gray-100 text-xs px-2 py-1 rounded">{g.currency}</span>
            </div>
            <div className="text-gray-500 text-sm mt-1">{g.members.length} members</div>
          </Link>
        ))}
      </div>
    </div>
  );
}