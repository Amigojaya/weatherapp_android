import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  city: string;
  celsius: any;
  weatherDesc: string;
  windSpeed: any;
  sunRise: any;
  sunSet: any;
  cityId: any;
  constructor(private route: ActivatedRoute,
              private alertController: AlertController,
              private http: HttpClient,
              private storage: Storage,
              private toastController: ToastController,
              private router: Router) { }

  async ngOnInit() {
    await this.storage.create();
    this.route.paramMap.subscribe((params: any) => {
      if (params.params) {
        this.city = params.params.city
        this.http.get(
          // eslint-disable-next-line max-len
          'https://api.openweathermap.org/data/2.5/weather?q=' + this.city + '&appid=9342f124d859abc70b0b99b9a1a5e957').subscribe(async (response) => {
          this.celsius = (response['main'].temp - 273.15).toFixed(1);
          this.weatherDesc = response['weather'][0].description;
          this.windSpeed = (response['wind'].speed * 3.6).toFixed(1);
          this.sunRise = this.formatTime(response['sys'].sunrise);
          this.sunSet = this.formatTime(response['sys'].sunset);
          this.cityId = response['id'];
        },async (error) => {
          const toast = await this.toastController.create({
          message: this.city + ' Not a Valid city',
          duration: 2000,
          color: 'tertiary',
          position: 'top',
        });
        await this.router.navigate(['/home']);
        await toast.present();
       });
      }
    });
  }

  formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const minutes = '0' + date.getMinutes();
    return hours + ':' + minutes.substr(-2) + ' ' + ampm;
  }

  async presentToast(position: 'top' | 'middle' | 'bottom',city) {
    const localStorageData = await this.storage.get('cities_raw_data');
    const currentData = {name: this.city,celsius:this.celsius,id:this.cityId,description:this.weatherDesc};
    if (localStorageData) {
      if (localStorageData.length >= 3) {
        const toastError = await this.toastController.create({
          message: 'Fav cities limit Exceeded, delete one city to add ' + this.city,
          duration: 2100,
          color: 'danger',
          position
        });
        await toastError.present();
        return;
      }
      if (!localStorageData.find(data => (data.id === this.cityId))) {
        localStorageData.push(currentData);
        await this.storage.set('cities_raw_data', localStorageData);
      } else {
        const toastExists = await this.toastController.create({
          message: city + ' Already exists',
          duration: 1900,
          position
        });
        await toastExists.present();
        return;
      }
    } else {
      await this.storage.set('cities_raw_data', [currentData]);
    }
    const toast = await this.toastController.create({
      message: city + ' added to Home page',
      duration: 2000,
      color: 'tertiary',
      position
    });
    await toast.present();
  }

}
