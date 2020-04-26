import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import AppError from '../errors/AppError';
import multer from 'multer';
import uploadConfig from '../config/upload';
const upload = multer(uploadConfig);

const { isUuid } = require('uuidv4');

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  //TODO: RETORNAR OBJETO CATEGORY
  const transactions = {
    transactions: await transactionsRepository.find(),
    balance: await transactionsRepository.getBalance(),
  };
  //TODO: RETORNAR OBJETO CATEGORY

  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {

  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category
  });

  return response.json(transaction);

});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  if(!isUuid(id)){
    throw new AppError('Invalid uuid.');
  }

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({
    id
  });

  return response.status(204).json();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const importTransaction = new ImportTransactionsService();

  const transactions = await importTransaction.execute(request);

  return response.json(transactions);
});

export default transactionsRouter;
