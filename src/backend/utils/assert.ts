import { BadRequestException } from '@nestjs/common';

type LocalError = () => Error;
type Expection = LocalError | string;

export class Assert {
  static assertTrue(param: any, error?: Expection) {
    if (!param) {
      Assert.buildError(error);
    }
  }

  static assertEmpty(param: Array<any>, error?: Expection) {
    if (param.length !== 0) {
      Assert.buildError(error);
    }
  }

  static assertFalse(param: any, error?: Expection) {
    if (param) {
      Assert.buildError(error);
    }
  }

  private static buildError(error?: Expection) {
    if (!error) {
      throw new BadRequestException();
    }

    if (typeof error === 'string') {
      throw new BadRequestException(error);
    }

    throw error();
  }
}
