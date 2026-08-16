/**
 * GitHub Types for RepoDeck
 * Type definitions for repository, file tree, and content operations
 */

/** Repository owner information */
export interface RepoOwner {
  login: string;
  avatarUrl?: string;
}

/** Repository metadata */
export interface Repo {
  id: number;
  name: string;
  fullName: string;
  owner: RepoOwner;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  description: string | null;
  updatedAt: string;
  stargazersCount?: number;
  forksCount?: number;
}

/** Branch information */
export interface Branch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
  };
}

/** File tree node (file or directory) */
export interface TreeNode {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  /** Derived from path for display */
  name: string;
}

/** File content with metadata */
export interface FileContent {
  content: string;
  sha: string;
  encoding: string;
  path: string;
  size: number;
  downloadUrl?: string;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  page: number;
  totalCount?: number;
}
