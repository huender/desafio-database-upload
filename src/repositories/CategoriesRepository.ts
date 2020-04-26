import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
export default class CategoriesRepository extends Repository<Category> {}
