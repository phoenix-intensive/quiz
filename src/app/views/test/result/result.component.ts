import {Component, OnInit} from '@angular/core';
import {TestService} from "../../../shared/services/test.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {PassTestResponseType} from "../../../../types/pass-test-response.type";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  result: string = '';
  id: number | null = null;

  constructor(private testService: TestService, private activatedRoute: ActivatedRoute, private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    const userInfo: UserInfoType | null = this.authService.getUserInfo();

    if (userInfo) {
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['id']) {
          this.id = +params['id'];
          this.testService.getResult(params['id'], userInfo.userId)
            .subscribe(result => {
              if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message);
                }
                this.result = (result as PassTestResponseType).score + '/' + (result as PassTestResponseType).total;
              }
            })
        }
      });
    }
  }

  onVerification(id: number | null): void {
    if (id !== null) {
      this.router.navigate(['/verification', id]);
    } else {
      console.error('id is null');
    }
  }
}
