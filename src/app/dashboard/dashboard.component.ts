import { Component } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { IApiresp } from '../pages/auth/interfaces/apiresp';
import { ICoord } from '../pages/auth/interfaces/coord';
import { switchMap } from 'rxjs';
import { Data } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  city!:string
  weather!: IApiresp
  coord!:ICoord[]

  data!:string

  constructor(
    private authSvc: AuthService,
    private http: HttpClient
     ) {}

     ngOnInit(){
      let day = new Date()
      let gg = day.getDate() + "/"
      let mm = day.getMonth() + 1 + "/"
      let aaaa = day.getFullYear()
      this.data = gg + mm + aaaa
     }

  // getCoord(city:string){
  //   const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=f19a71d8aeeb1fa1ebb4528f176123aa`;
  //   this.http.get<ICoord[]>(url).subscribe(data => { this.coord = data})
  //     console.log(this.coord);
  // }

  // getWeather() {
  //   if (this.coord) {
  //     let lat = this.coord[0].lat;
  //     console.log(lat)
  //     let lon = this.coord[0].lon;
  //     this.authSvc.getW(lat,lon).subscribe(data => { this.weather = data; console.log(data)})
  //   }
  // }

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
      })
      this.city = ''
  }

}
