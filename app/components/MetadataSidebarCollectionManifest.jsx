var React = require('react');
var {connect} = require('react-redux');
var manifesto = require('manifesto.js');
var Utils = require('Utils');
var axios = require('axios');
import Async from 'react-promise'


var MetadataSidebarCollectionManifest = React.createClass({
  getMainImage: function(manifest) {
    if(manifest.id.substr(0,19) !== 'http://example.org/') {
       axios.get(manifest.id).then(function(response) {
         var data = response.data;
         if('thumbnail' in data) {
           return data.thumbnail;
         } else {
           var collectionManifestoObject = manifesto.create(JSON.stringify(data));
           var canvas = collectionManifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
           var img = canvas.getImages().length > 0 ? canvas.getCanonicalImageUri(150) : 'https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Canvas&w=100&h=150';
           return img;
         }
       });
    } else {
      return 'https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Canvas&w=100&h=150';
    }
  },
  render: function() {
    var manifest = this.props.manifestoObject.getManifests()[this.props.manifestIndex];
	manifest.id = "https://data.getty.edu/museum/api/iiif/124/manifest.json";
	var imageSrc = this.getMainImage(manifest);

	  return (
	  <Async promise={imageSrc} then={(img) => {
        <div style={{background: '#fff url(./img/loading-small.gif) no-repeat center center'}} className="metadata-sidebar-canvas">
          <img src={img} alt={Utils.getLocalizedPropertyValue(manifest.getLabel())} height="150" />
          <div className="canvas-label">
            {manifest.id}
          </div>
        </div>
	  }} before={(handlePromise) => {
        <div style={{background: '#fff url(./img/loading-small.gif) no-repeat center center'}} className="metadata-sidebar-canvas">
          <img src={handlePromise(this.getMainImage(manifest))} alt={Utils.getLocalizedPropertyValue(manifest.getLabel())} height="150" />
          <div className="canvas-label">
            {manifest.id}
          </div>
        </div>
	  }}
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
