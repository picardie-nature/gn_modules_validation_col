import { Component, Input, Output, OnInit,EventEmitter } from "@angular/core";
import { DataService } from '../../services/data.service';

@Component({
  selector: "validation-info-obs",
  templateUrl: "validation-info-obs.component.html",
  styleUrls: ["validation-info-obs.component.scss"]
})
export class ValidationInfoObsComponent implements OnInit {

  @Input() lst_taxons: any[];
  properties: any[];
  data:any[];
  @Input() data_cache = [];
  load_flag = false;
  constructor(
        private dataService: DataService,

  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (JSON.stringify(changes.lst_taxons.currentValue) != JSON.stringify(changes.lst_taxons.previousValue) ) { this.data_cache=[]; }
    this.initialize_new_obs();
  };

  initialize_new_obs()
  {
    this.data=null;
    this.error_type=null;
    this.properties=null;
    this.obsTaxon=null;

    this.lst_cd_noms=[];
    for (let e of this.lst_taxons) { this.lst_cd_noms.push(e.cd_nom) };
    this.display_data();
    this.load_data(false,true); //preload next
  };

  onVote(e){
    this.data_cache.shift();
    this.initialize_new_obs();
  };

    load_data(display=false){ //add data to data_cache
        if(this.load_flag) { return } //chargement en cours, on n'en lance pas d'autre
        this.load_flag = true;
        this.dataService.getOneSyntheseObservation(this.lst_cd_noms).subscribe(
            data => {
                this.load_flag = false;
                this.data_cache.push(data);
                if(this.data==null) { this.display_data(); this.load_data(false); }                 //Pour tester si rien d'afficher, et si c'est le cas on affiche et charge le suivant
            }
        )
    };

    display_data(){ 
            if (this.data_cache.length > 0) { //data dispo
                this.properties=this.data_cache[0]['properties'];
                this.data=this.data_cache[0];
                this.avg_node = this.geom_avg_node(this.data_cache[0].geometry);
                this.latLng=[ this.avg_node[1] , this.avg_node[0] ];
                this.geoJson={type:'FeatureCollection', features:[this.data_cache[0]]};
                this.dataService.getTaxref(this.properties.cd_nom).subscribe(
                    dataTaxref => {
                        this.obsTaxon = dataTaxref;
                    }
               );
            }else{
                this.load_data(true);
            }
    };

    geom_avg_node(geom){
        var x=[];
        var y=[];
        function push_or_again(v){
            if !Array.isArray(v[0]){
                x.push(v[0]); y.push(v[1]);
            }else{
                for (var i = 0, len = v.length; i < len; i++) { push_or_again(v[i]); }
             }
        }
        push_or_again(geom.coordinates);
        var sum_x = x.reduce(function(a, b) { return a + b; });
        var sum_y = y.reduce(function(a, b) { return a + b; });
        return [sum_x/x.length , sum_y/y.length]
    };

}
