export type AuthUser = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: null;
  };
  tokens: { accessToken: string; refreshToken: string };
};
