// guards - это просто функция и нужны для того, чтобы защитить какой то route
import {AuthService} from "./auth.service";
import {inject} from "@angular/core";
import {Router} from "express";

export const canActivateAuth = () => {
  const isLoggedIn = inject(AuthService).isAuth

  if (isLoggedIn) {
    return true
  }
  return inject(Router).createUrlTree(["/login"])
}
