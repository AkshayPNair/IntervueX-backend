"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListLanguagesUseCase = void 0;
class ListLanguagesUseCase {
    constructor(_complier) {
        this._complier = _complier;
    }
    async execute() {
        return this._complier.listLanguages();
    }
}
exports.ListLanguagesUseCase = ListLanguagesUseCase;
