import { z } from "zod";

/**
 * Common GitHub parameters
 */
export const repoParamsSchema = z.object({
  owner: z.string().min(1, "Owner is required"),
  repo: z.string().min(1, "Repository name is required"),
});

export const branchParamsSchema = repoParamsSchema.extend({
  branch: z.string().min(1, "Branch is required"),
});

export const fileParamsSchema = repoParamsSchema.extend({
  path: z.string().min(1, "Path is required"),
  ref: z.string().min(1, "Ref/Branch is required"),
});

/**
 * API Request schemas
 */
export const listReposSchema = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
});

export const getTreeSchema = branchParamsSchema;

export const getFileSchema = fileParamsSchema;

export const getBranchesSchema = repoParamsSchema;
