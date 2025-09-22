import { ICompilerService } from "../../../domain/interfaces/ICompilerService";
import { CompileRunDTO,CompileRunResultDTO } from "../../../domain/dtos/compiler.dto";  
import { IRunCodeService } from "../../../domain/interfaces/IRunCodeService";

export class RunCodeUseCase implements IRunCodeService{
    constructor(private _compiler:ICompilerService){}

    async execute(input: CompileRunDTO): Promise<CompileRunResultDTO> {
        // Basic validation
        if(!input?.source || typeof input.languageId!=='number'){
            throw new Error('Invalid input')
        }
        return this._compiler.runCode(input)
    }
}