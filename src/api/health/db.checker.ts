import { logger } from "../../logger";
import { prisma } from "../../prisma";
import { ICheckerFn, ICheckerReturn } from "./model/checkers.model";

const CHECKER_NAME = "database";

export const dbChecker: ICheckerFn = async (): Promise<ICheckerReturn> => {
  try {
    await prisma.$queryRaw("SELECT 1;");
    return {
      name: CHECKER_NAME,
      status: true,
    };
  } catch (error) {
    logger.error(error);
    return {
      name: CHECKER_NAME,
      status: false,
    };
  }
};
