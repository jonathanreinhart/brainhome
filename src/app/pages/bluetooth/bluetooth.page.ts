import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { timer } from 'rxjs';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
})

export class BluetoothPage implements AfterViewInit {

  @ViewChild('brainButton', { read: ElementRef }) brainButton!: ElementRef<HTMLButtonElement>;

  connected = false;
  // @ViewChild('brainButton') brainButton:ElementRef;

  constructor(private bluetoothSerial: BluetoothSerial) { }

  ngAfterViewInit(): void {
    this.updateBoarderButton();
    this.discoverBluetoothDevices();
  }

  
  discoverBluetoothDevices() {
    this.bluetoothSerial.list().then(
      (devices) => {
        var found = false;
        // List of available Bluetooth devices
        console.log(devices);
        for(let device of devices){
          if(device.name == "Brainhome EEG"){
            this.connectToDevice(device.address);
            found = true;
          }
        }
        if(!found){
          const delayMilliseconds = 2000;

          timer(delayMilliseconds).subscribe(() => {
            this.discoverBluetoothDevices();
          });
        }
      },
      (error) => {
        console.error('Error discovering devices:', error);
      }
    );
  }

  connectToDevice(deviceAddress: string) {
    this.bluetoothSerial.connect(deviceAddress).subscribe(
      (success) => {
        console.log('Connected to device:', deviceAddress);
        this.connected = true;
        this.updateBoarderButton();
        // Start reading data from the connected device
        this.bluetoothSerial.subscribe('\n').subscribe(
          (data) => {
            console.log('Received data: ', data.charAt(0));
          },
          (error) => {
            console.error('Error receiving data:', error);
          }
        );
      },
      (error) => {
        console.error('Error connecting to device:', error);
        this.connected = false;
        this.updateBoarderButton();
        this.discoverBluetoothDevices();
      }
    );
  }

  sendData(data: string) {
    this.bluetoothSerial.write(data).then(
      (success) => {
        console.log('Data sent successfully:', data);
      },
      (error) => {
        console.error('Error sending data:', error);
      }
    );
  }

  printToConsole() {
    console.log("Hello World!");
    this.connected = !this.connected;
    this.updateBoarderButton();
  }

  updateBoarderButton() {
    if(this.brainButton){
      if(this.connected){
        document.documentElement.style.setProperty('--connectedColor', '#43B02A');
      }else{
        document.documentElement.style.setProperty('--connectedColor', '#F26247');
      }
    }
  }

}
