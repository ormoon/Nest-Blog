import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export const isMatchedPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => await bcrypt.compare(password, hash);
