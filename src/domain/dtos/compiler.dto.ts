export interface CompileRunDTO{
    source:string;
    languageId:number;
    stdin?:string;
    cpuTimeLimit?:number;
    memoryLimit?:number;
}

export interface CompileRunResultDTO {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
}

export interface Judge0LanguageDTO{
  id:number;
  name:string;
}