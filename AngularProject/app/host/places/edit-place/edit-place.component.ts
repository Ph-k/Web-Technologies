import { Component, OnInit } from '@angular/core';
import {PlaceService} from '../../../service/place.service';
import {Place} from '../../../../model/Place';
import {ActivatedRoute} from '@angular/router';

declare var ol: any;
@Component({
  selector: 'app-place-details',
  templateUrl: './edit-place.component.html',
  styleUrls: ['./edit-place.component.css']
})
export class EditPlaceComponent implements OnInit {

  place: Place;
  private id: string;
  placeNotFound = false;
  imageFile: File;
  private ImageFileType: string;
  InvalidFileType = false;
  ImageTooLarge = false;
  successfulUpdate = false;
  attemptedUpdate = false;

  coordinate: any;
  map: any;
  feature: any;
  layer: any;
  style: any;

  constructor(private placeService: PlaceService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.placeService.getPlace(this.id).subscribe(place => {
      this.place = place;

      this.map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([ this.place.xcoordinate, this.place.ycoordinate]),
          zoom: 15
        })
      });

      this.feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([ this.place.xcoordinate, this.place.ycoordinate]))
      });

      this.style = new ol.style.Style({
        image: new ol.style.Icon({
          scale: 0.02,
          src: '../assets/point.png'
        })
      });

      this.feature.setStyle(this.style);

      this.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [
            this.feature
          ],
          style: this.style
        })
      });

      this.map.addLayer(this.layer);
      console.log(place.xcoordinate);
    } , error => this.placeNotFound = true);
  }

  updatePlace(): void {
    this.attemptedUpdate = true;
    if (this.validInputs()) {
      this.placeService.updatePlace(this.place, this.place.placeId.toString()).subscribe(response => {
        this.successfulUpdate = true;
        window.location.href = '/myPlaces';
      });
    }
  }

  validInputs(): boolean{
    return ( this.place.area > 0 && this.place.minCost > 0 && this.place.additionalCostPerPerson > 0
      && this.place.maxCapacity > 0 && this.place.numberOfBeds > 0 && this.place.numberOfSleepingRooms > 0);
  }

  private CheckImageType(file: File): string{
    let FileType = '';
    let Index: number = file.name.length;

    while (file.name.charAt(Index) !== '.' || Index < 0 ){
      FileType = file.name.charAt(Index) + FileType;
      Index--;
    }
    FileType = file.name.charAt(Index) + FileType; // '.'

    switch (FileType) {
      case '.png':
        return '.png';
      case '.jpg':
        return '.jpg';
      case '.jpeg':
        return '.jpeg';
      case '.gif':
        return '.gif';
      default:
        return null;
    }
  }

  updatePhoto(event): void{
    this.ImageFileType = this.CheckImageType(event.target.files[0]);

    if (event.target.files[0].size > 10000000){
      this.imageFile = null;
      this.ImageTooLarge = true;
      return;
    }else { this.ImageTooLarge = false; }

    if ( this.ImageFileType !== null){
      this.imageFile = event.target.files[0];
      this.InvalidFileType = false;
      // this.userService.UploadImage(this.user.userName, this.imageFile);
      window.location.reload();
    }else{
      this.imageFile = null;
      this.InvalidFileType = true;
    }
  }

}
