import { Component } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { IApiresp } from '../pages/auth/interfaces/apiresp';
import { ICoord } from '../pages/auth/interfaces/coord';
import { Subscription, switchMap, tap } from 'rxjs';
import { IUser } from '../pages/auth/interfaces/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  city!: string
  weather!: IApiresp
  coord!: ICoord[]
  user!: IUser
  data!: string
  preferiti: IApiresp[] = []
  preferitiSubscription!: Subscription

  constructor(
    private authSvc: AuthService,
    private http: HttpClient,
    private router: Router
    ) {
      this.preferitiSubscription = this.authSvc.preferiti$.subscribe((preferiti) => {
        this.preferiti = preferiti;
      })
    }

    ngOnInit(){
    let day = new Date()
    let gg = day.getDate() + "/"
    let mm = day.getMonth() + 1 + "/"
    let aaaa = day.getFullYear()
    this.data = gg + mm + aaaa
    this.authSvc.restoreUser()?.pipe(
      tap((user) => {
        if(user){
        this.user = user?.user as IUser
        this.refreshPreferitiData()
        }else{
          this.router.navigate(['/auth'])
        }
      })
    ).subscribe();
    }

    addPref(item: IApiresp) {
      if (this.user) {
        this.authSvc.addPreferiti(this.user.id, item).subscribe(
          (updatedUser) => {
            this.user = updatedUser
            this.preferiti = this.user.preferiti
            this.refreshPreferitiData()
        })
      }
    }


    isPresent(item:IApiresp):boolean{
      return this.user?.preferiti?.some((preferito) => preferito.id === item.id) ?? false
    }

    searchCity() {
      this.http.get<ICoord[]>(`http://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=f19a71d8aeeb1fa1ebb4528f176123aa`)
        .pipe(
          switchMap((coord) => {
            this.coord = coord;
            return this.authSvc.getW(coord[0].lat,coord[0].lon)
          })
        )
        .subscribe((weather) => {
          this.weather = weather
          if(this.weather){
            this.weather.weather[0].description = this.weather.weather[0].description.charAt(0).toUpperCase() + this.weather.weather[0].description.slice(1)
            this.weather.main.temp = Number(this.weather.main.temp.toFixed(1))
            this.weather.main.temp_min = Number(this.weather.main.temp_min.toFixed(1))
            this.weather.main.temp_max = Number(this.weather.main.temp_max.toFixed(1))
            this.refreshPreferitiData()
          }
        })
        this.city = ''
    }

    formatDate(dt: number): string {
      const date = new Date(dt * 1000);
      const days = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
      const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
      return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    ngOnDestroy() {
      this.preferitiSubscription.unsubscribe()
    }

    refreshPreferitiData() {
      this.preferiti.forEach((preferito, index) => {
        this.authSvc.getW(preferito.coord.lat, preferito.coord.lon)
           .subscribe((weather) => {
            this.preferiti[index] = weather;
          })
      })
    }

}


