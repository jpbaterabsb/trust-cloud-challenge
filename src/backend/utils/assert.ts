import { BadRequestException } from '@nestjs/common';

type LocalError = () => Error;
type Expection = LocalError | string;

/**
 * The `Assert` class provides a set of assertion helper methods for runtime checking of arguments or other conditions.
 */
export class Assert {
  /**
   * Asserts that the given parameter is truthy, otherwise throws an exception.
   *
   * @param param The parameter to check.
   * @param error An optional error message or callback function that returns an error object.
   */
  static assertTrue(param: any, error?: Expection) {
    if (!param) {
      Assert.buildError(error);
    }
  }

  /**
   * Asserts that the given array is empty, otherwise throws an exception.
   *
   * @param param The array to check.
   * @param error An optional error message or callback function that returns an error object.
   */
  static assertEmpty(param: Array<any>, error?: Expection) {
    if (param.length !== 0) {
      Assert.buildError(error);
    }
  }

  /**
   * Asserts that the given parameter is falsy, otherwise throws an exception.
   *
   * @param param The parameter to check.
   * @param error An optional error message or callback function that returns an error object.
   */
  static assertFalse(param: any, error?: Expection) {
    if (param) {
      Assert.buildError(error);
    }
  }

  /**
   * Builds and throws an exception based on the given error message or callback function.
   *
   * @param error An optional error message or callback function that returns an error object.
   */
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
