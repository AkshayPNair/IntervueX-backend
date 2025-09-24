"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunCodeUseCase = void 0;
class RunCodeUseCase {
    constructor(_compiler) {
        this._compiler = _compiler;
    }
    async execute(input) {
        // Basic validation
        if (!input?.source || typeof input.languageId !== 'number') {
            throw new Error('Invalid input');
        }
        return this._compiler.runCode(input);
    }
}
exports.RunCodeUseCase = RunCodeUseCase;
