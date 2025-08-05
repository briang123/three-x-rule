import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Request for tests that need it
global.Request = class Request {
  constructor(url, init = {}) {
    Object.defineProperty(this, 'url', {
      value: url,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    this.method = init.method || 'GET';
    this.body = init.body;
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }

  formData() {
    return Promise.resolve(this.body);
  }
};

// Mock Response for tests that need it
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.init = init;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
  }

  ok() {
    return this.status >= 200 && this.status < 300;
  }
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: global.Request,
  NextResponse: {
    json: jest.fn((body, init = {}) => {
      const response = new global.Response(JSON.stringify(body), {
        status: init.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
      return response;
    }),
  },
}));

// Mock ReadableStream for streaming tests
global.ReadableStream = class ReadableStream {
  constructor(underlyingSource) {
    this.underlyingSource = underlyingSource;
  }

  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      cancel: () => Promise.resolve(),
      releaseLock: () => {},
    };
  }
};

// Mock TransformStream for AI SDK
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = new global.ReadableStream();
    this.writable = {
      getWriter() {
        return {
          write: () => Promise.resolve(),
          close: () => Promise.resolve(),
          abort: () => Promise.resolve(),
        };
      },
    };
  }
};

// Mock WritableStream for AI SDK
global.WritableStream = class WritableStream {
  constructor() {
    this.writable = {
      getWriter() {
        return {
          write: () => Promise.resolve(),
          close: () => Promise.resolve(),
          abort: () => Promise.resolve(),
        };
      },
    };
  }
};

// Mock TextEncoder and TextDecoder
global.TextEncoder = class TextEncoder {
  encode(input) {
    return new Uint8Array(Buffer.from(input, 'utf8'));
  }
};

global.TextDecoder = class TextDecoder {
  decode(input) {
    return Buffer.from(input).toString('utf8');
  }
};

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.entries = [];
  }

  append(key, value, filename) {
    this.entries.push([key, value, filename]);
  }

  get(key) {
    const entry = this.entries.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  entries() {
    return this.entries;
  }

  [Symbol.iterator]() {
    return this.entries[Symbol.iterator]();
  }
};

// Mock fetch
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
