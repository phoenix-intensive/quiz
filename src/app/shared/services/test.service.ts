import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {QuizListType} from "../../../types/quiz-list.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {TestResultType} from "../../../types/test-result.type";
import {QuizType} from "../../../types/quiz.type";
import {UserResultType} from "../../../types/user-result.type";
import {PassTestResponseType} from "../../../types/pass-test-response.type";

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) { }


  getTests()  {
    return this.http.get<QuizListType[]>(environment.apiHost + 'tests');
  }


  getUserResults(userId: number)  {
    return this.http.get<DefaultResponseType | TestResultType[]>(environment.apiHost + 'tests/results?userId=' + userId);
  }


  getQuiz(id: number | string)  {
    return this.http.get<DefaultResponseType | QuizType>(environment.apiHost + 'tests/' + id);
  }


  getResult(id: number | string, userId: number)  {
    return this.http.get<DefaultResponseType | PassTestResponseType>(environment.apiHost + 'tests/' + id + '/result?userId=' + userId);
  }


  getResultDetails(id: number | string, userId: number)  {
    return this.http.get<DefaultResponseType | QuizType>(environment.apiHost + 'tests/' + id + '/result/details?userId=' + userId);
  }


  passQuiz(id: number | string, userId: string | number, userResult: UserResultType[])  {
    return this.http.post<DefaultResponseType | PassTestResponseType>(environment.apiHost + 'tests/' + id + '/pass',
      {
        userId: userId,
        results: userResult
      });
  }
}
