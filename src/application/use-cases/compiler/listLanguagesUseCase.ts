import { ICompilerService } from "../../../domain/interfaces/ICompilerService";
import { Judge0LanguageDTO } from "../../../domain/dtos/compiler.dto";  
import { IListLanguagesService } from "../../../domain/interfaces/IListLanguagesService";

export class ListLanguagesUseCase implements IListLanguagesService{
    constructor(private _complier:ICompilerService){}

    async execute():Promise<Judge0LanguageDTO[]>{
        return this._complier.listLanguages()
    }
}