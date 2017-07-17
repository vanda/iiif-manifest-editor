var React = require('react');
var {connect} = require('react-redux');
var manifesto = require('manifesto.js');

var MetadataSidebarCollectionManifest = React.createClass({
  render: function() {
    var manifest = this.props.manifestoObject.getManifests()[this.props.manifestIndex];
    return (
      <div className="metadata-sidebar-canvas">
        <div className="canvas-label">
          {manifest.id}
        </div>
      </div>
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
