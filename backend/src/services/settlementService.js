const Group = require('../models/Group');
const Expense = require('../models/Expense');

exports.calculateSettlements = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  
  const expenses = await Expense.find({ group_id: groupId });

  let balances = {}; 
  group.members.forEach(m => balances[m._id.toString()] = 0);

  expenses.forEach(expense => {
    // REMOVED: if (expense.isSettled) return; 
    // All expenses count towards the balance history.

    const memberCount = group.members.length;
    const totalAmountCents = Math.round(expense.amount * 100);
    const splitAmountCents = Math.floor(totalAmountCents / memberCount);
    let remainderCents = totalAmountCents % memberCount;

    // 1. Deduct split amount from everyone
    group.members.forEach(m => {
      let share = splitAmountCents;
      if (remainderCents > 0) {
        share += 1;
        remainderCents--;
      }
      balances[m._id.toString()] -= (share / 100);
    });

    // 2. Add paid amount to payers
    expense.paid_by.forEach(p => {
      if(balances[p.member_id.toString()] !== undefined) {
          balances[p.member_id.toString()] += p.amount;
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
  let i = 0, j = 0;

  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  while (i < debtors.length && j < creditors.length) {
    let debtor = debtors[i];
    let creditor = creditors[j];

    let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    amount = Math.round(amount * 100) / 100;

    const fromMember = group.members.find(m => m._id.toString() === debtor.memberId);
    const toMember = group.members.find(m => m._id.toString() === creditor.memberId);

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