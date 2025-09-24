"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(item) {
        return this.model.create(item);
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async findAll(filter = {}) {
        return this.model.find(filter).exec();
    }
    async update(id, update) {
        return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    }
    async delete(id) {
        await this.model.findByIdAndDelete(id).exec();
    }
}
exports.BaseRepository = BaseRepository;
