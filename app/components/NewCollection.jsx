var React = require('react');
var {connect} = require('react-redux');
var actions = require('actions');
var manifesto = require('manifesto.js');
var uuid = require('node-uuid');

var NewCollection = React.createClass({
  componentDidMount: function() {
    // set up manifest skeleton
    var emptyCollection = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
  	  "@id": "http://" + uuid(),
  	  "@type": "sc:Collection",
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
      "collections": [
  	 {
          "@id": "http://" + uuid(),
          "@type": "sc:Collection",
          "label": [
            {
              "@value": "Sub Collection",
              "@language": "en"
            }
          ],
          "members": [
  		  {
                     "@id": "http://" + uuid(),
                     "@type": "sc:Manifest",
                     "label": [
                        {
                           "@value": "Normal Manifest",
                           "@language": "en"
                        }
                        ]
                  }
  	  ],
        }
      ],
      "manifests": []
    };

    this.props.dispatch(actions.setManifestoObject(manifesto.create(JSON.stringify(emptyCollection))));
    this.props.dispatch(actions.setCollectionData(emptyCollection));
    window.location = '#/collection/edit';  // redirect to edit manifest
  },
  render: function() {
    return false;
  }
});

module.exports = connect()(NewCollection);
