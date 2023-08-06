import { IApiresp } from "./apiresp";

export interface IUser {
  id:number;
  nome:string;
  cognome:string;
  email:string;
  genere:string;
  username:string
  preferiti:IApiresp[]
}
