import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { IRegister } from '../interfaces/register';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  formData:IRegister = {
    nome : '',
    cognome : '',
    email : '',
    password : '',
    confermaPassword : '',
    username : '',
    genere: ''
  }

  constructor(
    private authSvc:AuthService,
    private router:Router,
    private fb: FormBuilder
    ){}

  register() {
    if (this.form.valid) {
      const formData = this.form.value as IRegister
      this.authSvc.signUp(formData)
        .subscribe(
          res => {
            alert('Registrazione avvenuta con successo')
            this.router.navigate(['/auth/login'])
          },
          error => {
            console.error('Errore durante la registrazione:', error)
          }
        )
    }
  }

  form!:FormGroup;

  ngOnInit(){
    this.form = this.fb.group({
      nome:this.fb.control(null, [Validators.required]),
      cognome:this.fb.control(null, [Validators.required]),
      username: this.fb.control(null, [Validators.required]),
      password: this.fb.control(null,[Validators.required]),
      confermaPassword: this.fb.control(null, [Validators.required]),
      genere: this.fb.control(null, [Validators.required]),
      email: this.fb.control(null, [Validators.required, Validators.email])
    },
    {
      validators: this.matchPsw()
    })
  }

  isValid(fieldName: string) {
    return this.form.get(fieldName)?.valid
   }
   isTouched(fieldName: string) {
     return this.form.get(fieldName)?.touched
   }

   matchPsw(): ValidatorFn {
    return (control : AbstractControl): ValidationErrors | null => {
      let psw = control.get('password')?.value
      let confirmPsw = control.get('confermaPassword')?.value
      if(psw!== confirmPsw){
        return { matchPswControl: true }
      }
    return null
    }
  }

}
