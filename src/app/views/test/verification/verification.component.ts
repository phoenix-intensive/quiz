import {Component, OnInit} from '@angular/core';
import {QuizAnswerType, QuizQuestionType, QuizType} from "../../../../types/quiz.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ActivatedRoute, Router} from "@angular/router";
import {TestService} from "../../../shared/services/test.service";
import {AuthService} from "../../../core/auth/auth.service";
import {UserInfoType} from "../../../../types/user-info.type";

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

  quiz!: QuizType;
  id: number | null = null;
  chosenAnswerId: number | null = null;
  userInfo: UserInfoType | null = null;
  currentAnswer: QuizType | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private testService: TestService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = +params['id'];
        this.loadQuizAndResults(this.id);
      }
    });
  }

  private loadQuizAndResults(id: number): void {
    this.testService.getQuiz(id).subscribe((result: QuizType | DefaultResponseType): void => {
      if (result) {
        if ((result as DefaultResponseType).error !== undefined) {
          throw new Error((result as DefaultResponseType).message);
        }
        this.quiz = result as QuizType;

        // Получение результатов после получения теста
        this.userInfo = this.authService.getUserInfo();
        if (this.userInfo) {
          this.testService.getResultDetails(id, this.userInfo.userId).subscribe((result: QuizType | DefaultResponseType): void => {
            if (result) {
              if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message);
              }
              this.currentAnswer = result as QuizType;
            }
          });
        }
      }
    });
  }


  private findAnswer(answerId: number): QuizAnswerType | undefined {
    if (!this.currentAnswer) return undefined;

    return this.currentAnswer.test.questions
      .flatMap((question: QuizQuestionType) => question.answers)
      .find((answer: QuizAnswerType): boolean => answer.id === answerId);
  }

  getAnswerStyles(answerId: number): { [key: string]: string } {
    const foundAnswer: QuizAnswerType | undefined = this.findAnswer(answerId);
    const isCorrect: boolean | undefined = foundAnswer?.correct;

    if (isCorrect === true) {
      return {color: 'green', borderColor: 'green'};
    } else if (isCorrect === false) {
      return {color: 'red', borderColor: 'red'};
    } else {
      return {color: 'black', borderColor: 'black'};
    }
  }


  onResult(id: number): void {
    if (id !== null) {
      this.router.navigate(['/result'], {queryParams: {id: this.quiz.id}});
    } else {
      console.error('id is null');
    }
  }
}
