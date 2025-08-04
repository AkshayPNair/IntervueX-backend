export interface IBaseRepository<T> {
    create(item: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter: Partial<T>): Promise<T | null>;
    findAll(filter?: Partial<T>): Promise<T[]>;
    update(id: string, update: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<void>;
}