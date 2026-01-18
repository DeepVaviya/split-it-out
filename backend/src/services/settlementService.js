const Group = require('../models/Group');
const Expense = require('../models/Expense');

exports.calculateSettlements = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  
  const expenses = await Expense.find({ group_id: groupId });

  // Use cents throughout to avoid floating point errors
  let balances = {}; 
  group.members.forEach(m => balances[m._id.toString()] = 0);

  expenses.forEach(expense => {
    const memberCount = group.members.length;
    const totalAmountCents = Math.round(expense.amount * 100);
    const splitAmountCents = Math.floor(totalAmountCents / memberCount);
    let remainderCents = totalAmountCents % memberCount;

    // 1. Deduct split amount from everyone (in cents)
    group.members.forEach((m, index) => {
      let share = splitAmountCents;
      // Distribute remainder to first members to ensure total equals expense
      if (index < remainderCents) {
        share += 1;
      }
      balances[m._id.toString()] -= share;
    });

    // 2. Add paid amount to payers (in cents)
    expense.paid_by.forEach(p => {
      const memberId = p.member_id.toString();
      if(balances[memberId] !== undefined) {
          balances[memberId] += Math.round(p.amount * 100);
      }
    });
  });

  // Convert balances from cents to dollars and categorize
  let debtors = [];
  let creditors = [];

  for (const [memberId, amountCents] of Object.entries(balances)) {
    // Only convert to dollars at the end
    if (amountCents < -1) { // Less than -1 cent (owes money)
      debtors.push({ memberId, amountCents });
    }
    if (amountCents > 1) { // More than 1 cent (is owed money)
      creditors.push({ memberId, amountCents });
    }
  }

  let settlements = [];
  let i = 0, j = 0;

  // Sort by absolute amount (smallest debts first helps minimize transactions)
  debtors.sort((a, b) => a.amountCents - b.amountCents);
  creditors.sort((a, b) => b.amountCents - a.amountCents);

  while (i < debtors.length && j < creditors.length) {
    let debtor = debtors[i];
    let creditor = creditors[j];

    // Calculate settlement amount in cents
    const settlementCents = Math.min(Math.abs(debtor.amountCents), creditor.amountCents);

    const fromMember = group.members.find(m => m._id.toString() === debtor.memberId);
    const toMember = group.members.find(m => m._id.toString() === creditor.memberId);

    if (fromMember && toMember && settlementCents > 0) {
        // Convert cents to dollars for display
        const settlementAmount = (settlementCents / 100).toFixed(2);
        settlements.push({
          from: fromMember.name,
          to: toMember.name,
          amount: settlementAmount
        });
    }

    // Update balances in cents
    debtor.amountCents += settlementCents;
    creditor.amountCents -= settlementCents;

    // Move to next debtor/creditor if settled
    if (Math.abs(debtor.amountCents) <= 1) i++;
    if (creditor.amountCents <= 1) j++;
  }

  return settlements;
};