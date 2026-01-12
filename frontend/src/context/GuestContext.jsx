import { createContext, useContext, useState } from 'react';
import { nanoid } from 'nanoid';

const GuestContext = createContext();

export function GuestProvider({ children }) {
  // These will reset on page reload
  const [guestGroups, setGuestGroups] = useState([]);
  const [guestExpenses, setGuestExpenses] = useState({}); // { groupId: [expenses] }

  // Actions mimicking API calls
  const createGuestGroup = async (data) => {
    const newGroup = {
      _id: 'guest_g_' + nanoid(),
      name: data.name,
      currency: data.currency || '₹',
      members: data.members.map(m => ({ _id: 'guest_m_' + nanoid(), name: m })),
      created_at: new Date()
    };
    setGuestGroups(prev => [newGroup, ...prev]);
    setGuestExpenses(prev => ({ ...prev, [newGroup._id]: [] }));
    return { data: newGroup };
  };

  const getGuestGroups = async () => {
    return { data: guestGroups };
  };

  const getGuestGroup = async (id) => {
    const group = guestGroups.find(g => g._id === id);
    if (!group) throw new Error("Not found");
    
    // Calculate basic settlements for guest (simplified version of backend logic)
    // For now, we'll return empty settlements or implement basic logic if needed
    // Assuming settlements are calculated on backend, we return empty for guest demo or basic
    return { data: { group, settlements: [] } };
  };

  const addGuestExpense = async (data) => {
    const newExpense = {
      _id: 'guest_e_' + nanoid(),
      ...data,
      date: new Date(),
      isSettled: false,
      paid_by: data.payments 
    };
    setGuestExpenses(prev => ({
      ...prev,
      [data.groupId]: [newExpense, ...(prev[data.groupId] || [])]
    }));
    return { data: newExpense };
  };

  const getGuestExpenses = async (groupId) => {
    return { data: guestExpenses[groupId] || [] };
  };

  const deleteGuestGroup = async (id) => {
    setGuestGroups(prev => prev.filter(g => g._id !== id));
  };

  const toggleGuestExpense = async (id, status) => {
    // Find group containing this expense
    for (const groupId in guestExpenses) {
        const updated = guestExpenses[groupId].map(e => 
            e._id === id ? { ...e, isSettled: status } : e
        );
        setGuestExpenses(prev => ({ ...prev, [groupId]: updated }));
    }
  };

  const deleteGuestExpense = async (id) => {
     for (const groupId in guestExpenses) {
        setGuestExpenses(prev => ({
            ...prev,
            [groupId]: prev[groupId].filter(e => e._id !== id)
        }));
     }
  };

  return (
    <GuestContext.Provider value={{
      createGuestGroup, getGuestGroups, getGuestGroup, deleteGuestGroup,
      addGuestExpense, getGuestExpenses, toggleGuestExpense, deleteGuestExpense
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export const useGuest = () => useContext(GuestContext);