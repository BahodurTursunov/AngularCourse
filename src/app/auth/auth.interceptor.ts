// тот же самый middleware, только тут говорят перехватчик
import {HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
// @ts-ignore
import {error} from "@angular/compiler-cli/src/transformers/util";
import {catchError, switchMap, throwError} from "rxjs";

let isRefreshing = false

// @ts-ignore
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = authService.token
  // const token = localStorage.getItem('access_token');
  // console.log(req)

  if (!token) return next(req)

  if (isRefreshing) {
    // @ts-ignore
    return refreshAndProceed(authService, req, next)
  }

  // @ts-ignore
  return next(addToken(req, token))
    .pipe(catchError(() => {
      if (error.status === 403) {
        return refreshAndProceed(authService, req, next)
      }
      return throwError(error);
    }))

  const refreshAndProceed = (
    authService: AuthService,
    req: HttpRequest<any>,
    next: HttpHandlerFn
  ) => {
    if (!isRefreshing) {
      isRefreshing = true
      return authService.refreshAuthToken()
        .pipe(
          switchMap(res => {
            isRefreshing = false
            return next(addToken(req, res.accessToken))
          })
        )
    }
    return next(addToken(req, authService.token!))
  }

    const addToken = (req: HttpRequest<any>, token: string) => {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
      return req
    }
  }
