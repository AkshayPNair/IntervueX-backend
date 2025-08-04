import {Model, Document, FilterQuery, UpdateQuery} from  'mongoose';
import { IBaseRepository } from '../../../domain/interfaces/IBaseRepository';

export class BaseRepository<T extends Document> implements IBaseRepository<T>{
    constructor(protected model: Model<T>){}

    async create(item: Partial<T>): Promise<T> {
        return this.model.create(item);
    }
    
    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }
    
    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }
    
    async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
        return this.model.find(filter).exec();
    }
    
    async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    }
    
    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id).exec();
    }
}