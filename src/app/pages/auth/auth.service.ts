import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IApiresp } from 'src/app/pages/auth/interfaces/apiresp';
import { IAccessData } from './interfaces/access-data';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { ILogin } from './interfaces/login';
import { IRegister } from './interfaces/register';
import { IUser } from './interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl:string = 'http://localhost:3000';
  registerUrl:string = this.apiUrl + '/register';
  loginUrl:string = this.apiUrl + '/login';
  usersUrl:string = this.apiUrl + '/users';
  preferitiSubject = new BehaviorSubject<IApiresp[]>([])
  preferiti$ = this.preferitiSubject.asObservable()

  constructor(
    private http: HttpClient,
    private router: Router
    ) { }

  getW(lat:number, lon:number): Observable<IApiresp> {
   return this.http.get<IApiresp>(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=f19a71d8aeeb1fa1ebb4528f176123aa`)
  }

  autoLogoutTimer:any;

  private jwtHelper:JwtHelperService = new JwtHelperService()
  private authSubject = new BehaviorSubject<null | IAccessData>(null);
  user$ = this.authSubject.asObservable()
  isLoggedIn$ = this.user$.pipe(map(user => user?.accessToken ? true : false))

  login(data:ILogin){
    return this.http.post<IAccessData>(this.loginUrl, data)
    .pipe(tap(data => {
      this.authSubject.next(data);
      localStorage.setItem('accessData', JSON.stringify(data));
      const expDate = this.jwtHelper.getTokenExpirationDate(data.accessToken) as Date;
      this.autoLogout(expDate);
    }))
  }

  logout(){
    this.authSubject.next(null);
    localStorage.removeItem('accessData');
    this.router.navigate(['/auth'])
  }

  autoLogout(expDate:Date){
    const expMs = expDate.getTime() - new Date().getTime();
    this.autoLogoutTimer = setTimeout(() => {
      this.logout()
    }, expMs)
  }

  signUp(data:IRegister){
    data.preferiti = [];
    return this.http.post<IAccessData>(this.registerUrl, data)
  }

  restoreUser() {
    const userJson: string | null = localStorage.getItem('accessData');
    if (!userJson) return;
    const accessData: IAccessData = JSON.parse(userJson);
    if (this.jwtHelper.isTokenExpired(accessData.accessToken)) return;
    this.authSubject.next(accessData);
    this.getPreferiti(accessData.user.id).subscribe((updatedPreferiti: IApiresp[]) => {
      this.updatePreferiti(updatedPreferiti);
      this.authSubject.next(accessData);
    })
    return this.user$
  }

  getPreferiti(userId: number): Observable<IApiresp[]> {
    return this.http.get<IUser>(`${this.usersUrl}/${userId}`).pipe(
      map((user) => user.preferiti)
    )
  }

  addPreferiti(id: number, item: IApiresp) {
    return this.http.get<IUser>(`${this.usersUrl}/${id}`).pipe(
      switchMap((user) => {
        const index = user.preferiti.findIndex((preferito) => preferito.name === item.name);
        if (index !== -1) {
          user.preferiti.splice(index, 1);
        } else {
          user.preferiti.push(item);
        }
        return this.http.patch<IUser>(`${this.usersUrl}/${id}`, { preferiti: user.preferiti }).pipe(
          tap((updatedUser) => {
            this.updatePreferiti(updatedUser.preferiti);
          })
        );
      })
    );
  }


  updatePreferiti(preferiti: IApiresp[]){
    this.preferitiSubject.next(preferiti);
  }

}
