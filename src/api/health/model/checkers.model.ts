export interface ICheckerReturn {
  name: string;
  status: boolean;
}

export type ICheckerFn = () => Promise<ICheckerReturn>;
