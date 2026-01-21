import { createContext, useContext, useState } from 'react';
import { nanoid } from 'nanoid';

const GuestContext = createContext();

export function GuestProvider({ children }) {
  const [guestGroups, setGuestGroups] = useState([]);
  const [guestExpenses, setGuestExpenses] = useState({}); 

  // --- Helper: Settlement Algorithm ---
  const calculateGuestSettlements = (group, expenses) => {
    // Use cents throughout to avoid floating point errors
    let balances = {};
    group.members.forEach(m => balances[m._id] = 0);

    expenses.forEach(expense => {
      const memberCount = group.members.length;
      const totalAmountCents = Math.round(expense.amount * 100);
      const splitAmountCents = Math.floor(totalAmountCents / memberCount);
      let remainderCents = totalAmountCents % memberCount;

      // Deduct split amount from everyone (in cents)
      group.members.forEach((m, index) => {
        let share = splitAmountCents;
        // Distribute remainder to first members
        if (index < remainderCents) {
          share += 1;
        }
        balances[m._id] -= share;
      });

      // Add paid amount to payers (in cents)
      expense.paid_by.forEach(p => {
        if (balances[p.member_id] !== undefined) {
          balances[p.member_id] += Math.round(p.amount * 100);
        }
      });
    });

    // Categorize debtors and creditors
    let debtors = [];
    let creditors = [];

    for (const [memberId, amountCents] of Object.entries(balances)) {
      if (amountCents < -1) {
        debtors.push({ memberId, amountCents });
      }
      if (amountCents > 1) {
        creditors.push({ memberId, amountCents });
      }
    }

    let settlements = [];
    debtors.sort((a, b) => a.amountCents - b.amountCents);
    creditors.sort((a, b) => b.amountCents - a.amountCents);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];
      const settlementCents = Math.min(Math.abs(debtor.amountCents), creditor.amountCents);

      const fromMember = group.members.find(m => m._id === debtor.memberId);
      const toMember = group.members.find(m => m._id === creditor.memberId);

      if (fromMember && toMember && settlementCents > 0) {
        settlements.push({
          from: fromMember.name,
          to: toMember.name,
          amount: (settlementCents / 100).toFixed(2)
        });
      }

      debtor.amountCents += settlementCents;
      creditor.amountCents -= settlementCents;

      if (Math.abs(debtor.amountCents) <= 1) i++;
      if (creditor.amountCents <= 1) j++;
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
      guestGroups, // Expose state directly for reactive updates
      createGuestGroup, getGuestGroups, getGuestGroup, deleteGuestGroup,
      addGuestExpense, getGuestExpenses, deleteGuestExpense
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export const useGuest = () => useContext(GuestContext);