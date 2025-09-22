import { Judge0LanguageDTO } from "../dtos/compiler.dto";

export interface IListLanguagesService{
    execute():Promise<Judge0LanguageDTO[]>
}