import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  afterEach(() => localStorage.clear());

  it('should append the bearer token when it exists', (done) => {
    localStorage.setItem('jwtToken', 'token-value');
    const request = new HttpRequest('GET', '/test');
    let intercepted: HttpRequest<unknown> | null = null;
    const handler: HttpHandlerFn = nextRequest => {
      intercepted = nextRequest;
      return of(new HttpResponse({ status: 200 }));
    };

    authInterceptor(request, handler).subscribe(() => {
      expect(intercepted?.headers.get('Authorization')).toBe('Bearer token-value');
      done();
    });
  });

  it('should preserve the request when there is no token', (done) => {
    const request = new HttpRequest('GET', '/test');
    let intercepted: HttpRequest<unknown> | null = null;
    const handler: HttpHandlerFn = nextRequest => {
      intercepted = nextRequest;
      return of(new HttpResponse({ status: 200 }));
    };

    authInterceptor(request, handler).subscribe(() => {
      expect(intercepted).toBe(request);
      expect(intercepted?.headers.has('Authorization')).toBe(false);
      done();
    });
  });
});
