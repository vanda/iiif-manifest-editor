var React = require('react');
var {connect} = require('react-redux');
var actions = require('actions');
var manifesto = require('manifesto.js');
var uuidv4 = require('uuid/v4');

var NewManifest = React.createClass({
  componentDidMount: function() {
    // set up manifest skeleton
    var emptyManifest = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
  	  "@id": "http://" + uuidv4(),
  	  "@type": "sc:Manifest",
  	  "label": "[Click to edit label]",
      "metadata": [],
  	  "description": [
        {
          "@value": "[Click to edit description]",
          "@language": "en"
        }
      ],
  	  "license": "https://creativecommons.org/licenses/by/3.0/",
  	  "attribution": "[Click to edit attribution]",
  	  "sequences": [
  		  {
          "@id": "http://" + uuidv4(),
          "@type": "sc:Sequence",
          "label": [
            {
              "@value": "Normal Sequence",
              "@language": "en"
            }
          ],
          "canvases": []
        }
  	  ],
  	  "structures": []
    };

    this.props.dispatch(actions.setManifestoObject(manifesto.create(JSON.stringify(emptyManifest))));
    this.props.dispatch(actions.setManifestData(emptyManifest));
    window.location = '#/manifest/edit';  // redirect to edit manifest
  },
  render: function() {
    return false;
  }
});

module.exports = connect()(NewManifest);
