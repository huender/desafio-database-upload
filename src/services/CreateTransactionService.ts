import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }:Request): Promise<Transaction> {

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('This type does not exists.', 400);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance:Balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('This user has no cash for this transaction.', 400);
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const findCategory = await categoriesRepository.findOne({
      where: {title: category}
    });

    let transaction:Transaction;

    if (findCategory) {
      transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: findCategory.id
      });
    }else{
      const categoryEntity = categoriesRepository.create({
        title: category
      });

      await categoriesRepository.save(categoryEntity);

      transaction = transactionsRepository.create({
        title,
        value: value,
        type,
        category_id: categoryEntity.id
      });
    }

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
