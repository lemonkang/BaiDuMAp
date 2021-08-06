import React, { Component, createElement } from "react";
import Map, {MapApiLoaderHOC} from 'react-bmapgl/Map'
//增加3D控件
import NavigationControl from 'react-bmapgl/Control/NavigationControl'
//比例尺控件
import ScaleControl from 'react-bmapgl/Control/ScaleControl'
//增加缩放控件
import ZoomControl from 'react-bmapgl/Control/ZoomControl'
//结果提示
import AutoComplete from 'react-bmapgl/Services/AutoComplete'
//点状图
import Marker from 'react-bmapgl/Overlay/Marker'
import "./ui/BaiduMap.css";
import 'antd-mobile/dist/antd-mobile.css'; 
import { Button,Toast } from "antd-mobile";
// 引入axios
import axios from "axios";
import jsonpAdapter from 'axios-jsonp';
//const url = `https://api.map.baidu.com/api?v=2.0&ak=${ak}&callback=init`
const url = `https://api.map.baidu.com/api?v=2.0&ak=${ak}`
const ak = `HcFqrgfQDKFgcsqIUas46SumOZSkYLn6`


class BaiduMap extends Component {
    constructor(props) {
        super(props)
   
        this.map = React.createRef();
        this.state = {
          position: new BMapGL.Point(116.404449, 39.914889),
          InputValue:"",  
          province:"",
          city:"",
          district:"",
          address:"",//详细地址
          lat:"",//纬度
          lng:"",//经度
          resultList:[],
          zoom:12 , //地图的默认缩放
          zoomboolean:true,
          buttonadress:false,
   
          
        }
      }
    //   初始化加载函数
  loadJScript = () => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        // script.src = '//api.map.baidu.com/api?type=webgl&v=1.0&ak=HcFqrgfQDKFgcsqIUas46SumOZSkYLn6&callback=init';
        script.src = url;
        document.body.appendChild(script);
      }

      componentDidMount(){
        console.log("获取的props",this.props);
       this.loadJScript();

      
       
      }
      componentDidUpdate(){

      
         
    
      }
      componentWillUnmount(){
     
      }



      goPoint=()=>{
        console.log("点击搜索");
        const BMap = window.BMap;
        const myGeo = new BMap.Geocoder()
        let result
        myGeo.getPoint(this.state.InputValue, function(point){
            if(point){
                const BMap = window.BMap;
                const geoc = new BMap.Geocoder()
               
           
                geoc.getLocation(point, function(rs){
                    result=rs
                    console.log("获取的详细地址",rs);   
                })
              }else{
                Toast.info('您选择的地址没有解析到结果！');
              }
        },'全国')
        setTimeout(() => {
            if (result) {
              let point=result.surroundingPois[0].point
                this.setState({
                  resultList:result.surroundingPois,
                  position:new BMapGL.Point(point.lng,point.lat),
                  zoom:19
                })
              /*   const {province,city,district}=result.addressComponents
                let addressprovince=result.surroundingPois[0].address.replace(province,"")
                let adresscity=addressprovince.replace(city,"")
                let address=adresscity.replace(district,"")
                let point=result.surroundingPois[0].point
                this.setState({
                    InputValue:province+city+district+address,
                    province:province,
                    city:city,
                    district:district,
                    address:address,
                    lat:point.lat,
                    lng:point.lng, 
                    position:new BMapGL.Point(point.lng,point.lat)
                }) */
            }
           
           
        }, 1000);
        
      }
 
    //onchange事件
    inputChange=(e)=>{
     
      
        let province=e.item.value.province
        let city=e.item.value.city
        let district=e.item.value.district
        let business=e.item.value.business
        this.setState({
            InputValue: province+city+district+business  // 属性名不是name, 而是name变量的值
          })
          this.goPoint()
        
    }
    //输入框中的文字改变
    oninput=(e)=>{
      this.setState({
        InputValue:e.target.value 
      })
    }
    // 点击地图的事件
    clickmap=(e)=>{
      console.log("点击获取的E",e);
     

          let point=new BMapGL.Point(e.latlng.lng,e.latlng.lat) 
     
          let currentlng =e.latlng.lng
          let currentlat =e.latlng.lat
          this.setState({
            position:point
          })
          //const url=`https://api.map.baidu.com/reverse_geocoding/v3/?ak=HcFqrgfQDKFgcsqIUas46SumOZSkYLn6&output=json&coordtype=wgs84ll&location=${currentlng},${currentlat}&extensions_poi=1` 
          const url=`http://api.map.baidu.com/reverse_geocoding/v3/?ak=HcFqrgfQDKFgcsqIUas46SumOZSkYLn6&output&output=json&coordtype=bd09ll&location=${currentlat},${currentlng}&extensions_poi=1`
          axios({
             url:url,
             adapter: jsonpAdapter
           }).then((res) => {
             let result=res.data.result
             const {province,city,district,street,street_number}=result.addressComponent

                this.setState({
                    InputValue:province+city+district+street+street_number,
                    province:province,
                    city:city,
                    district:district,
                    address:street+street_number,
                    lat:result.location.lat,
                    lng:result.location.lng, 
                })

           })
           

    }
    // 点击resultlist进入详情列表
    goadress=(item)=>{
      this.setState({
        position:item.point
      })
      let result
      const geoc = new BMap.Geocoder()
      setTimeout(() => {
        geoc.getLocation(item.point, function(rs){
          result=rs
          console.log("获取的详细地址",rs);   
      })
      }, 800);
      setTimeout(() => {
        if (result) {
          const {province,city,district}=result.addressComponents
         let address=result.surroundingPois[0].address
         let point=result.surroundingPois[0].point
          this.setState({
              InputValue:province+city+district+address,
              province:province,
              city:city,
              district:district,
              address:address,
              lat:point.lat,
              lng:point.lng,
              zoom:19   
          }) 
        }
      }, 1000);
    }
    // 上传地址
    uploadadress=()=>{
      if (!(this.state.InputValue.length===0&&this.state.InputValue.length<6)) {
        const halflength=this.state.InputValue.length/2
        let valueboolean=this.state.InputValue.substring(
          halflength).includes("号")||this.state.InputValue.substring(halflength).includes("弄")||this.state.InputValue.substring(halflength).includes("栋")
          const adressboolean=new RegExp("[0-9一二三四五六七八九十]").test(this.state.InputValue.substring(halflength))||valueboolean 
          if (adressboolean) {
        
              this.props.lng.setValue(this.state.lng+"");  //设置经度
              this.props.lat.setValue(this.state.lat+"") ;     //设置纬度
              this.props.adress.setValue(this.state.province+"|"+this.state.city+"|"+this.state.district+"|"+this.state.address) ;//设置精确地址
              this.props.actionMap.execute();
          }  
          else{
            Toast.info('输入准确地址'); 
          } 
      }else{
        Toast.info('输入准确地址'); 
      }

    }
  
    render() {
        return (
            <div className="App">
              <p>
                <span className="sp">省份：{!this.state.province?(this.props.adress.value?this.props.adress.value.split('|')[0]:""):this.state.province} </span>
                <span className="sp">城市：{!this.state.city?(this.props.adress.value?this.props.adress.value.split('|')[1]:""):this.state.city} </span>
                <span className="sp">区县：{!this.state.district?(this.props.adress.value?this.props.adress.value.split('|')[2]:""):this.state.district}</span>
                <span className="sp">街道：{!this.state.address?(this.props.adress.value?this.props.adress.value.split('|')[3]:""):this.state.address} </span>
              </p>
              <p>
                <span className="sp">经度：{!this.state.lng?(this.props.lng.value?this.props.lng.value:""):this.state.lng} </span>
                <span>纬度：{!this.state.lat?(this.props.lat.value?this.props.lng.value:""):this.state.lat} </span>
              </p>
              <div className="search">
                <input type="text"  id="inputmap"  onInput={e=>{this.oninput(e)}} value={
               
                this.state.InputValue}
                title={this.state.InputValue}
                />
                <AutoComplete
          input="inputmap"
          location={this.state.city} 
          onConfirm={(e)=>this.inputChange(e)}    
        />
        <Button type="primary"  size="small" onClick={this.goPoint}>搜索</Button>
        <Button type="primary" size="small" onClick={this.uploadadress} >确定</Button>
              </div>
              <div className="mapresult">  
                <div id="container" >
                <Map   
                 className="baidumap"    
                 center={this.state.position}
                 zoom={this.state.zoom}
                 heading={0}
                 tilt={40}
                 onClick={e => this.clickmap(e)}
                 enableScrollWheelZoom
              
                
            >
                        <Marker
          position={this.state.position}
          enableDragging
         
        />
                 <NavigationControl />
                 <ScaleControl />
                 <ZoomControl />     
            </Map>
                </div>
                <div className="resultlist" >
                  {this.state.resultList.map((item,index)=>{
                    return (
                      
                    <div className="item" key={index}  onClick={()=>this.goadress(item)}>
                      
                    <div className="itemfonttitle" title={item.title}>{item.title}</div>
                    <div className="itemfontadress" title={item.address}>{item.address}</div>
                    
                  </div>
                  )

                  })}
                  
                </div>

                
                </div>
              
            </div>
          ) 
    }
}
export default MapApiLoaderHOC({ak:ak})(BaiduMap )