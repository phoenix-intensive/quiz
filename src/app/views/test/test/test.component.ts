import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TestService} from "../../../shared/services/test.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {QuizType} from "../../../../types/quiz.type";
import {ActionTestType} from "../../../../types/action-test.type";
import {UserResultType} from "../../../../types/user-result.type";
import {AuthService} from "../../../core/auth/auth.service";
import {UserInfoType} from "../../../../types/user-info.type";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  quiz!: QuizType
  timerSeconds: number = 59;
  private interval: number = 0;
  //Текущий индекс вопроса
  currentQuestionIndex: number = 1;
  chosenAnswerId: number | null = null;
  readonly userResult: UserResultType[] = [];
  actionTestType = ActionTestType;

  constructor(private activatedRoute: ActivatedRoute, private testService: TestService, private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.testService.getQuiz(params['id'])
          .subscribe((result: QuizType | DefaultResponseType): void => {
            if (result) {
              if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message);
              }
              //В this.quiz находится сам тест с вопросами и с вариантами ответов на них
              this.quiz = result as QuizType;
              this.startQuiz();
            }
          })
      }
    })
  }


  //Геттер на получение текущего вопроса
  get activeQuestion() {
    return this.quiz.questions[this.currentQuestionIndex - 1];
  }

  startQuiz(): void {
    // Функция таймера на весь тест
    // this.interval = window.setInterval(() => {
    //   this.timerSeconds--;
    //   if (this.timerSeconds === 0) {
    //     //Остановка таймера по истечению времени
    //     clearInterval(this.interval);
    //     this.complete();
    //   }
    // }, 1000);
  }


  //Функция перехода следующего вопроса или предыдущего или пропустить вопрос
  move(action: ActionTestType): void {

    //Делаем проверку, есть ли уже ответ для данного вопроса и если есть, то перезапишем новый ответ либо ничего не будем создавать, чтобы не увеличивать объем инф сервера
    const index: number = this.userResult.findIndex((item: UserResultType): boolean => item.questionId === this.activeQuestion.id);

    if (this.chosenAnswerId !== undefined && this.chosenAnswerId !== null) {
      if (index !== -1) {
        // Если ответ уже существует и выбран новый ответ, перезаписываем его
        this.userResult[index].chosenAnswerId = this.chosenAnswerId;
        this.userResult[index] = {questionId: this.activeQuestion.id, chosenAnswerId: this.chosenAnswerId};
      } else {
        // Если ответа еще нет, добавляем новый
        this.userResult.push({
          questionId: this.activeQuestion.id,
          chosenAnswerId: this.chosenAnswerId
        });
      }
    }


    if (action === ActionTestType.next || action === ActionTestType.pass) {

      //Если вопрос завершающий
      if (this.currentQuestionIndex === this.quiz.questions.length) {
        clearInterval(this.interval);
        this.complete();
        return;
      }


      //Тогда будем увеличивать индекс вопроса на 1 (то есть появиться след вопрос)
      this.currentQuestionIndex++;
    } else {
      //Иначе prev будем уменьшать индекс вопроса на 1 (то есть появиться предыдущий вопрос)
      this.currentQuestionIndex--;
    }

    // Сброс выбранного ответа при переходе к новому вопросу
    this.chosenAnswerId = null;
  }


  //Функция завершения теста и отправка всех данных на сервер
  complete(): void {
    const userInfo: UserInfoType | null = this.authService.getUserInfo();

    if (userInfo) {
      this.testService.passQuiz(this.quiz.id, userInfo.userId, this.userResult)
        .subscribe(result => {
          if (result) {
            if ((result as DefaultResponseType).error !== undefined) {
              throw new Error((result as DefaultResponseType).message);
            }
            this.router.navigate(['/result'], {queryParams: {id: this.quiz.id}});
          }
        })
    }
  }
}
