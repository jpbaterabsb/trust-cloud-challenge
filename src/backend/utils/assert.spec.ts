import { Assert } from './assert';
import { BadRequestException } from '@nestjs/common';

describe('Assert', () => {
  describe('assertTrue', () => {
    it('should not throw an error if the parameter is truthy', () => {
      expect(() => Assert.assertTrue('truthy value')).not.toThrow();
    });

    it('should throw a BadRequestException if the parameter is falsy', () => {
      expect(() => Assert.assertTrue(false)).toThrow(BadRequestException);
    });

    it('should throw a custom error if one is provided and the parameter is falsy', () => {
      expect(() =>
        Assert.assertTrue(false, 'This is a custom error message.'),
      ).toThrow('This is a custom error message.');
    });

    it('should throw a custom error function if one is provided and the parameter is falsy', () => {
      expect(() =>
        Assert.assertTrue(
          false,
          () => new Error('This is a custom error message.'),
        ),
      ).toThrow('This is a custom error message.');
    });
  });

  describe('assertEmpty', () => {
    it('should not throw an error if the parameter is an empty array', () => {
      expect(() => Assert.assertEmpty([])).not.toThrow();
    });

    it('should throw a BadRequestException if the parameter is not an empty array', () => {
      expect(() => Assert.assertEmpty([1, 2, 3])).toThrow(BadRequestException);
    });

    it('should throw a custom error if one is provided and the parameter is not an empty array', () => {
      expect(() =>
        Assert.assertEmpty([1, 2, 3], 'This is a custom error message.'),
      ).toThrow('This is a custom error message.');
    });

    it('should throw a custom error function if one is provided and the parameter is not an empty array', () => {
      expect(() =>
        Assert.assertEmpty(
          [1, 2, 3],
          () => new Error('This is a custom error message.'),
        ),
      ).toThrow('This is a custom error message.');
    });
  });

  describe('assertFalse', () => {
    it('should not throw an error if the parameter is falsy', () => {
      expect(() => Assert.assertFalse(false)).not.toThrow();
    });

    it('should throw a BadRequestException if the parameter is truthy', () => {
      expect(() => Assert.assertFalse(true)).toThrow(BadRequestException);
    });

    it('should throw a custom error if one is provided and the parameter is truthy', () => {
      expect(() =>
        Assert.assertFalse(true, 'This is a custom error message.'),
      ).toThrow('This is a custom error message.');
    });

    it('should throw a custom error function if one is provided and the parameter is truthy', () => {
      expect(() =>
        Assert.assertFalse(
          true,
          () => new Error('This is a custom error message.'),
        ),
      ).toThrow('This is a custom error message.');
    });
  });
});
