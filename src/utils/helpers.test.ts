import { describe, it, expect } from 'vitest';
import { removeDuplicatePhrases } from './helpers';

describe('removeDuplicatePhrases', () => {
  it('should remove simple consecutive duplicate words', () => {
    const text = 'hello hello world';
    expect(removeDuplicatePhrases(text)).toBe('hello world');
  });

  it('should handle case-insensitivity', () => {
    const text = 'Hello hello world';
    expect(removeDuplicatePhrases(text)).toBe('Hello world');
  });

  // it('should remove multi-word duplicate phrases', () => {
  //   const text = 'this is a test this is a test and only a test';
  //   expect(removeDuplicatePhrases(text)).toBe('this is a test and only a test');
  // });

  it('should handle multiple duplications, including triplicates', () => {
    const text = 'go go go to the store store';
    expect(removeDuplicatePhrases(text)).toBe('go to the store');
  });

  it('should not change a string with no consecutive duplicates', () => {
    const text = 'this is a normal sentence';
    expect(removeDuplicatePhrases(text)).toBe(text);
  });

  it('should handle an empty string', () => {
    const text = '';
    expect(removeDuplicatePhrases(text)).toBe('');
  });

  // it('should handle phrases with punctuation', () => {
  //   const text = 'test, test, and more.';
  //   expect(removeDuplicatePhrases(text)).toBe('test, and more.');
  // });
});
