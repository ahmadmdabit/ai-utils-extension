import { describe, it, expect, afterEach } from 'vitest';
import { render } from '../../test-utils';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  it('renders the spinner element', () => {
    const result = render(<Spinner />);
    unmount = result.unmount;
    const spinner = result.container.querySelector('[data-testid="spinner"]');
    expect(spinner).not.toBeNull();
  });

  it('has the correct CSS classes', () => {
    const result = render(<Spinner />);
    unmount = result.unmount;
    const spinner = result.container.querySelector('[data-testid="spinner"]');
    expect(spinner).not.toBeNull();
    const classes = ['animate-spin', 'h-5', 'w-5', 'text-spotify-green'];
    classes.forEach((cls) => {
      expect(spinner?.classList.contains(cls)).toBe(true);
    });
  });
});
