import { Header } from './../../core/utils';
import { ZodAuthBearer } from './../../helpers/validator';
import z from 'zod';

const apiKey = z.object({
    [Header.API_KEY]: z.string(),
});

const auth = z.object({
    authorization: ZodAuthBearer,
});

const githubCode = z.object({
    code: z.string()
});

const refreshToken = z.object({
    refreshToken: z.string().min(1)
});

export default {
    apiKey,
    auth,
    refreshToken,
    githubCode
};
