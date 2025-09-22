import { CompileRunDTO,CompileRunResultDTO, Judge0LanguageDTO } from "../dtos/compiler.dto";

export interface ICompilerService{
    runCode(payload:CompileRunDTO):Promise<CompileRunResultDTO>
    listLanguages():Promise<Judge0LanguageDTO[]>
}