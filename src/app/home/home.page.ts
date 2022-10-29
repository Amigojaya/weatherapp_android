import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  city: string;
  cities: Array<any>=[];

  constructor(private alertController: AlertController,
              private http: HttpClient,
              private storage: Storage, private router: Router, private toastController: ToastController) {
    this.storage.create().then(r => console.log(r));
  }

  async ionViewWillEnter(){
    this.cities = await this.storage.get('cities_raw_data');
  }


  async presentAlert() {
    this.http.get(
      // eslint-disable-next-line max-len
      'https://api.openweathermap.org/data/2.5/weather?q='+this.city+'&appid=9342f124d859abc70b0b99b9a1a5e957').subscribe( async (response) => {
      const celsius = response['main'].temp - 273.15;
      const weatherDesc = response['weather'][0].description;
      const alert = await this.alertController.create({
        header: 'Weather at ' + this.city.toUpperCase() ,
        subHeader: 'Temperature - ' + celsius.toFixed(1) + ' °C',
        message:  'Description - ' + weatherDesc.toUpperCase() , //+ response.,
        buttons: ['OK']
      });
      await alert.present();
    });
  }
  bulkData(ids) {
    const link = 'https://api.openweathermap.org/data/2.5/group?id='+ ids +'&appid=9342f124d859abc70b0b99b9a1a5e957';
    this.http.get(link).subscribe( async (response) => {
      console.log(response);
    });
  };

  async removeCity(removeId,cityName) {
    const alert = await this.alertController.create({
      header: 'Do you want to remove '+ cityName + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.cities = this.cities.filter(obj => obj.id !== removeId);
      await this.storage.set('cities_raw_data', this.cities);
    }
  }

  async validateClick(cityName) {
    if (cityName) {
      await this.router.navigate(['/detail',cityName]);
    } else {
      const toastError = await this.toastController.create({
        message: 'Please fill the Input field',
        duration: 2100,
        position: 'top',
        color: 'danger'
      });
      await toastError.present();
    }
  }

}
