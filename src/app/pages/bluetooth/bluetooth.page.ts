import { Component, OnInit } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
})
export class BluetoothPage implements OnInit {

  private eegData: Uint8Array = new Uint8Array(100);
  private eegDataIndex: number = 0;

  constructor(private ble: BLE) {}

  ngOnInit() {
  }

  scanForBLEDevices() {
    this.ble.scan([], 5).subscribe(
      device => {
        console.log('Discovered device name:', device.name);
        if(device.name == "Brainhome EEG") {
          this.connectToDevice(device);
        }
      },
      error => console.error('Error scanning for devices:', error)
    );
  }

  connectToDevice(device: any) {
    this.ble.connect(device.id).subscribe(
      (peripheral) => {
        console.log('Connected to BLE device:', peripheral);
        // Handle successful connection
        if(device.name == "Brainhome EEG") {
          this.subscribeToService(device.id, "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6E400003-B5A3-F393-E0A9-E50E24DCCA9E");
        }
      },
      (peripheral) => {
        console.log('Disconnected from BLE device:', peripheral);
        // Handle connection error
      }
    );
  }

  subscribeToService(deviceId: string, serviceUuid: string, characteristicUuid: string) {
    this.ble.startNotification(deviceId, serviceUuid, characteristicUuid).subscribe(
      (data) => {
        const receivedData = new Uint8Array(data[0]);
        for(let i = 0; i < receivedData.length; i++) {
          this.eegData[this.eegDataIndex] = receivedData[i];
          this.eegDataIndex++;
          if(this.eegDataIndex == 100) {
            this.eegDataIndex = 0;
            console.log('received all the data: ', this.eegData);
          }
        }
        // console.log('Array length:', receivedData.length);
        // console.log('Received data from BLE device:', data);
        // Handle received data
      }
    );
  }

  printToConsole() {
    console.log("Hello World!");
  }

}
