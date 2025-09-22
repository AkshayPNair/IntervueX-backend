import { CompileRunDTO,CompileRunResultDTO } from "../dtos/compiler.dto"

export interface IRunCodeService{
    execute(input:CompileRunDTO):Promise<CompileRunResultDTO>
}