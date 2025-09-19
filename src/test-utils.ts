import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

let root: Root | null = null;

export const render = (component: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  act(() => {
    root = createRoot(container);
    root.render(component);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root?.unmount();
      });
      document.body.removeChild(container);
    },
  };
};

export const fireEvent = {
  click: (element: Element) => {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  },
  change: (element: Element, options: { target: { value: string } }) => {
    act(() => {
      if ('value' in element) {
        (
          element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        ).value = options.target.value;
      }
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
  },
};

export const waitFor = async (
  callback: () => void,
  { timeout = 1000, interval = 50 } = {},
) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      try {
        callback();
        resolve(undefined);
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };
    check();
  });
};
