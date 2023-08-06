import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  data!:number

  ngOnInit(){
     let day = new Date
     this.data = day.getFullYear()
   }

}
