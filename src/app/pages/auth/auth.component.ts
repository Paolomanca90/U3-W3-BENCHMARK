import { Component } from '@angular/core';
import { ILogin } from './interfaces/login';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {


  formData:ILogin = {
    email : '',
    password : ''
  }

  constructor(
    private authSvc:AuthService,
    private router:Router
    ){}


  login(){
    this.authSvc.login(this.formData).subscribe(data => {
      this.router.navigate(['/dashboard'])
    })
  }

  fill(){
    if(this.formData.email == '' || this.formData.password == ''){
      return true
    }
    return false
  }


}
