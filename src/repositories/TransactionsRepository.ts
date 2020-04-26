import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let incomeTotal:number = 0;
    let outcomeTotal:number = 0;

    const transactions = await this.find();

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeTotal = (incomeTotal + Number(transaction.value));
      } else if (transaction.type === 'outcome') {
        outcomeTotal =  (outcomeTotal + Number(transaction.value));
      }
    });

    const finalBalance: Balance = {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: (incomeTotal - outcomeTotal),
    };

    return finalBalance;
  }
}

export default TransactionsRepository;
