var React = require('react');
var {connect} = require('react-redux');
var actions = require('actions');
var classNames = require('classnames');
var Viewer = require('Viewer');
var CollectionMetadataSidebar = require('CollectionMetadataSidebar');
var ManifestStrip = require('ManifestStrip');
var ThumbnailStrip = require('ThumbnailStrip');


var EditCollection = React.createClass({
  componentDidMount: function() {
    $(window).on('beforeunload', function() {
      return true;
    });
  },
  componentWillMount: function() {
    if(this.props.manifestData === undefined) {
      window.location.hash = '#/';
    }

    // save the id of the first canvas in the store on initial load to set the active class on the first canvas in the thumbnail strip
    if(this.props.manifestoObject !== undefined) {
//        this.props.manifestoObject.getCollectionsByIndex(0).then(function(data) {
 //          if(data.getCollections().length > 0) {
              // id is not dereferenacable on new collection so we cannot load
              // a canvas
  //            var canvas = this.props.manifestoObject.getCollectionByIndex(0).getManifestByIndex(0).getSequenceByIndex(0).getCanvasByIndex(0);
//      var collection = this.props.manifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
//      var members = this.props.manifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
//      var manifests = this.props.manifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
   //           this.props.dispatch(actions.setSelectedCanvasId(canvas.id));
    //       }
     //   })
    }
  },

  render: function() {
    var viewerThumbnailStripClasses = classNames(
      {
        'viewer-thumbnail-strip-narrow-view': this.props.showMetadataSidebar,
        'viewer-thumbnail-strip-wide-view': !this.props.showMetadataSidebar
      }
    );
    var viewerManifestStripClasses = classNames(
      {
        'viewer-thumbnail-strip-narrow-view': this.props.showMetadataSidebar,
        'viewer-thumbnail-strip-wide-view': !this.props.showMetadataSidebar
      }
    );
    if(this.props.manifestData === undefined) {
      return false;  // do not render the component when no manifest data exists to prevent errors before redirecting
    } else {
      return (
        <div className="edit-manifest-container container-fluid">
          <div className="row">
            <div className={viewerManifestStripClasses}>
              <ManifestStrip/>
            </div>
            <CollectionMetadataSidebar ref="sidebar"/>
          </div>
        </div>
      );
    }
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject,
      manifestData: state.manifestReducer.manifestData,
      selectedManifestIndex: state.manifestReducer.selectedManifestIndex,
      showMetadataSidebar: state.manifestReducer.showMetadataSidebar
    };
  }
)(EditCollection);
