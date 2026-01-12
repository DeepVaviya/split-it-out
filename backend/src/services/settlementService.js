const Group = require('../models/Group');
const Expense = require('../models/Expense');

exports.calculateSettlements = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  
  const expenses = await Expense.find({ group_id: groupId });

  let balances = {}; 
  group.members.forEach(m => balances[m._id.toString()] = 0);

  expenses.forEach(expense => {
    const splitAmount = expense.amount / group.members.length;
    
    // 1. Deduct split amount from everyone (Everyone owes the pot)
    group.members.forEach(m => {
      balances[m._id.toString()] -= splitAmount;
    });

    // 2. Add paid amount to payers (Payers claim from the pot)
    expense.paid_by.forEach(p => {
      if(balances[p.member_id.toString()] !== undefined) {
          balances[p.member_id.toString()] += p.amount;
      }
    });
  });

  // Separation
  let debtors = [];
  let creditors = [];

  for (const [memberId, amount] of Object.entries(balances)) {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded < -0.01) debtors.push({ memberId, amount: rounded });
    if (rounded > 0.01) creditors.push({ memberId, amount: rounded });
  }

  // Greedy Matching
  let settlements = [];
  let i = 0, j = 0;

  debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  while (i < debtors.length && j < creditors.length) {
    let debtor = debtors[i];
    let creditor = creditors[j];

    // Debtor owes X, Creditor needs Y. Transaction is min(|X|, Y)
    let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    
    // Find member names
    const fromMember = group.members.find(m => m._id.toString() === debtor.memberId);
    const toMember = group.members.find(m => m._id.toString() === creditor.memberId);

    if (fromMember && toMember) {
        settlements.push({
        from: fromMember.name,
        to: toMember.name,
        amount: amount.toFixed(2)
        });
    }

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};