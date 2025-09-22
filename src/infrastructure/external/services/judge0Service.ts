import axios, { isAxiosError, AxiosInstance } from 'axios';
import { ICompilerService } from '../../../domain/interfaces/ICompilerService';
import { CompileRunDTO, CompileRunResultDTO, Judge0LanguageDTO } from '../../../domain/dtos/compiler.dto';

export class Judge0Service implements ICompilerService {
    private _client: AxiosInstance;

    constructor() {
        const baseUrl = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com'
        const apiKey = process.env.JUDGE0_KEY
        const apiHost = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'

        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (apiKey) {
            headers['X-RapidAPI-Key'] = apiKey
        }
        if (apiHost) {
            headers['X-RapidAPI-Host'] = apiHost
        }


        this._client = axios.create({
            baseURL: baseUrl,
            headers,
            timeout: 30000,
        });
    }

    async runCode(payload: CompileRunDTO): Promise<CompileRunResultDTO> {
        try {
            //create submission
            const createResponse = await this._client.post(
                '/submissions',
                {
                    source_code: payload.source,
                    language_id: payload.languageId,
                    stdin: payload.stdin ?? '',
                    cpu_time_limit: payload.cpuTimeLimit ?? 3,
                    memory_limit: payload.memoryLimit ?? 128000,
                },
                { params: { base64_encoded: false, wait: false } }
            );

            const { token } = createResponse.data as { token: string };

            // Poll for result
            for (; ;) {
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const resultResponse = await this._client.get(`/submissions/${token}`, {
                    params: { base64_encoded: false },
                });

                const data = resultResponse.data as CompileRunResultDTO & { status?: { id: number } };
                if (data.status && data.status.id >= 3) {
                    return data;
                }
            }
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status ?? 'Unknown';
                const data = error.response?.data ?? (error as Error).message;
                throw new Error(`Judge0 request failed: ${status} ${JSON.stringify(data)}`);
            }
            throw error as Error;
        }
    }

    async listLanguages(): Promise<Judge0LanguageDTO[]> {
        try {
            const res = await this._client.get('/languages');
            return Array.isArray(res.data) ? res.data : [];
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status ?? 'Unknown';
                const data = error.response?.data ?? (error as Error).message;
                throw new Error(`Judge0 request failed: ${status} ${JSON.stringify(data)}`);
            }
            throw error as Error;
        }
    }
}