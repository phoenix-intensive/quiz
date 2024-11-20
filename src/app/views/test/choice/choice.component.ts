import {Component, OnInit} from '@angular/core';
import {TestService} from "../../../shared/services/test.service";
import {QuizListType} from "../../../../types/quiz-list.type";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {TestResultType} from "../../../../types/test-result.type";
import {Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss']
})
export class ChoiceComponent implements OnInit {

  quizzes: QuizListType[] = [];

  constructor(private testService: TestService, private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.testService.getTests()
      .subscribe((result: QuizListType[]): void => {
        this.quizzes = result;

        const userInfo: UserInfoType | null = this.authService.getUserInfo()
        if (userInfo) {
          this.testService.getUserResults(userInfo.userId)
            .subscribe((result: DefaultResponseType | TestResultType[]) => {
              if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message);
                }
                const testResult: TestResultType[] = result as TestResultType[];
                if (testResult) {
                  this.quizzes = this.quizzes.map((quiz: QuizListType) => {
                    const foundItem: TestResultType | undefined = testResult.find((item: TestResultType): boolean => item.testId === quiz.id);
                    if (foundItem) {
                      quiz.result = foundItem.score + '/' + foundItem.total
                    }
                    return quiz;
                  });
                }
              }
            });
        }
      })
  }

  chooseQuiz(id: number): void {
    this.router.navigate(['/test', id]);
  }
}
