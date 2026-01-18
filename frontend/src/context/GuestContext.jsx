import { createContext, useContext, useState } from 'react';
import { nanoid } from 'nanoid';

const GuestContext = createContext();

export function GuestProvider({ children }) {
  const [guestGroups, setGuestGroups] = useState([]);
  const [guestExpenses, setGuestExpenses] = useState({}); 

  // --- Helper: Settlement Algorithm ---
  const calculateGuestSettlements = (group, expenses) => {
    let balances = {};
    group.members.forEach(m => balances[m._id] = 0);

    expenses.forEach(expense => {
      // REMOVED: if (expense.isSettled) return;

      const memberCount = group.members.length;
      const totalAmountCents = Math.round(expense.amount * 100);
      const splitAmountCents = Math.floor(totalAmountCents / memberCount);
      let remainderCents = totalAmountCents % memberCount;

      group.members.forEach(m => {
        let share = splitAmountCents;
        if (remainderCents > 0) {
          share += 1;
          remainderCents--;
        }
        balances[m._id] -= (share / 100);
      });

      expense.paid_by.forEach(p => {
        if (balances[p.member_id] !== undefined) {
          balances[p.member_id] += p.amount;
        }
      });
    });

    let debtors = [];
    let creditors = [];

    for (const [memberId, amount] of Object.entries(balances)) {
      const rounded = Math.round(amount * 100) / 100;
      if (rounded < -0.01) debtors.push({ memberId, amount: rounded });
      if (rounded > 0.01) creditors.push({ memberId, amount: rounded });
    }

    let settlements = [];
    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      amount = Math.round(amount * 100) / 100;

      const fromMember = group.members.find(m => m._id === debtor.memberId);
      const toMember = group.members.find(m => m._id === creditor.memberId);

      if (fromMember && toMember && amount > 0) {
        settlements.push({
          from: fromMember.name,
          to: toMember.name,
          amount: amount.toFixed(2)
        });
      }

      debtor.amount += amount;
      creditor.amount -= amount;
      
      debtor.amount = Math.round(debtor.amount * 100) / 100;
      creditor.amount = Math.round(creditor.amount * 100) / 100;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return settlements;
  };

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
    
    const expenses = guestExpenses[id] || [];
    const settlements = calculateGuestSettlements(group, expenses);
    
    return { data: { group, settlements } };
  };

  const addGuestExpense = async (data) => {
    const newExpense = {
      _id: 'guest_e_' + nanoid(),
      ...data,
      date: data.date || new Date(),
      // REMOVED: isSettled: false
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
      addGuestExpense, getGuestExpenses, deleteGuestExpense
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export const useGuest = () => useContext(GuestContext);