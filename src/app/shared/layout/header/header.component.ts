import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {LogoutResponseType} from "../../../../types/logout-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userInfo: UserInfoType | null = null;

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
    if (this.authService.getLoggedIn()) {
      this.userInfo = this.authService.getUserInfo();
    }
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (value: LogoutResponseType) => {
          if (value && !value.error) {
            this.authService.removeTokens();
            this.authService.removeUserInfo();
            this._snackBar.open('Вы успешно вышли из системы');
            this.router.navigate(['/']);
          } else {
            this._snackBar.open('Ошибка при выходе из системы');
          }
        },
        error: (error: HttpErrorResponse) => {
          this._snackBar.open('Ошибка при выходе из системы');
          throw new Error(error.error.message);
        }
      });
  }

  ngOnInit(): void {
    this.authService.isLogged$
      .subscribe(isLoggedIn => {
        this.userInfo = isLoggedIn ? this.authService.getUserInfo() : null;
      })
  }
}
