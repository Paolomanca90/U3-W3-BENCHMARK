import { Component } from '@angular/core';
import { AuthService } from 'src/app/pages/auth/auth.service';
import { IUser } from 'src/app/pages/auth/interfaces/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  isLogged!:boolean
  loggedUser!: IUser

  constructor(
    private authService: AuthService
    ) {
      this.authService.isLoggedIn$.subscribe(x => (this.isLogged = x))
      this.authService.user$.subscribe(x => this.loggedUser = x?.user as IUser)
    }

  logout(){
    this.authService.logout()
  }


}
