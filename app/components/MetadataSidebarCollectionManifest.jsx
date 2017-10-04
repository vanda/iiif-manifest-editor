var React = require('react');
var {connect} = require('react-redux');
var manifesto = require('manifesto.js');
var Utils = require('Utils');
var axios = require('axios');
import Async from 'react-promise'


var MetadataSidebarCollectionManifest = React.createClass({
  getMainImage: function(manifest) {
    if(manifest.id.substr(0,19) !== 'http://example.org/') {
       return axios.get(manifest.id).then(function(response) {
         var data = response.data;
         if('thumbnail' in data) {
           return data.thumbnail["@id"];
         } else {
           var collectionManifestoObject = manifesto.create(JSON.stringify(data));
           var canvas = collectionManifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
           var img = canvas.getImages().length > 0 ? canvas.getCanonicalImageUri(150) : 'https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Manifest&w=100&h=150';
           return img;
         }
       });
    } else {
      return Promise.resolve('https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Manifest&w=100&h=150');
    }
  },
  render: function() {
	var manifest;
	if(this.props.collectionIndex == undefined) {
      manifest = this.props.manifestoObject.getManifests()[this.props.manifestIndex];
	} else {
      var collection = this.props.manifestoObject.getCollections()[this.props.collectionIndex];
	  manifest = collection.getManifests()[this.props.manifestIndex];
	}
//manifest.id = "https://data.getty.edu/museum/api/iiif/124/manifest.json";
    var imageSrc = this.getMainImage(manifest);

	  return (
	  <Async promise={imageSrc} then={(img) => {
           return (
        <div style={{background: '#fff url(./img/loading-small.gif) no-repeat center center'}} className="metadata-sidebar-canvas">
          <img src={img} alt={Utils.getLocalizedPropertyValue(manifest.getLabel())} height="150" />
          <div className="canvas-label">
            {manifest.id}
          </div>
        </div>
           );
	  }} pendingRender={
                <div style={{background: '#fff url(./img/loading-small.gif) no-repeat center center'}} className="metadata-sidebar-canvas">
          <div className="canvas-label">
            {manifest.id}
          </div>
        </div>
          } 
	  />
     );
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject
    };
  }
)(MetadataSidebarCollectionManifest);
