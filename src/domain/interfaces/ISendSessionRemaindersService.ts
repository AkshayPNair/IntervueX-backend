export interface ISendSessionRemaindersService{
    execute(now?: Date): Promise<{ processed: number }>;
}