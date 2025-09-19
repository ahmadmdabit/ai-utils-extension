import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../../test-utils';
import { Button } from './Button';

describe('Button', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  it('renders with children', () => {
    const result = render(<Button>Click Me</Button>);
    unmount = result.unmount;
    const button = result.container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Click Me');
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    const result = render(<Button onClick={handleClick}>Click Me</Button>);
    unmount = result.unmount;
    const button = result.container.querySelector('button');
    if (button) {
      fireEvent.click(button);
    }
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    const result = render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>,
    );
    unmount = result.unmount;
    const button = result.container.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
    if (button) {
      fireEvent.click(button);
    }
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies primary variant styles by default', () => {
    const result = render(<Button>Primary Button</Button>);
    unmount = result.unmount;
    const button = result.container.querySelector('button');
    expect(button?.classList.contains('bg-spotify-green')).toBe(true);
  });
});
