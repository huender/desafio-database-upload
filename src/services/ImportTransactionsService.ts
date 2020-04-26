import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
import AppError from '../errors/AppError';

class ImportTransactionsService {
  async execute(request:Request): Promise<any[]> {
    const csvFilePath = request.file.path;
    const readCSVStream = fs.createReadStream(csvFilePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      let lines:any[] = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      const createTransaction = new CreateTransactionService();

      const transactions:Transaction[] = [];

      for await (let line of lines){
        const transaction = await createTransaction.execute({
          title: line[0],
          type: line[1],
          value: Number(line[2]),
          category: line[3]
        });

        transactions.push(transaction);
      }

      return transactions;
  }
}

export default ImportTransactionsService;
