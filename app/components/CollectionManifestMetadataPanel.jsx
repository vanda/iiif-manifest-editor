var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var axios = require('axios');
var EditableTextArea = require('EditableTextArea');
var MetadataSidebarCollectionManifest = require('MetadataSidebarCollectionManifest');
var ManifestChoiceDialog = require('ManifestChoiceDialog');
var Utils = require('Utils');

var CollectionManifestMetadataPanel = React.createClass({
  getInitialState: function() {

      var emptyTree = [{ title: 'Top Collection', expanded: true, key: 0, 
		  children: [
                  { title: 'Manifests', expanded: true, type: 'manifests', key: 1, children: [
                  { title: 'Empty Manifest', type: 'manifest' } ] },
                  { title: 'Collections', type: 'collections', expanded: true, children: [] },
                  { title: 'Members', type: 'members' }] } ];

      this.props.dispatch(actions.setTreeData(emptyTree));

	  return null;
  },


  saveMetadataFieldToStore: function(fieldValue, path, fieldName) {
    this.props.dispatch(actions.updateMetadataFieldValueAtPath(fieldValue, path));
  },
  updateImageAnnotationForCanvasWithId: function(fieldValue, path) {
    // fetch new image annotation remotely
    var {dispatch} = this.props;
    dispatch(actions.startImageAnnotationFetch());
    var that = this;
    axios.get(fieldValue)
      .then(function(response) {
        var updatedImageAnnotation = response.data;
        // update the on property on the fetched image annotation to set it to the original canvas ID
        updatedImageAnnotation.on = that.props.selectedCanvasId;
        dispatch(actions.completeImageAnnotationFetch());
        // dispatch action to store to replace existing image annotation with fetched image annotation
        dispatch(actions.updateMetadataFieldValueAtPath(updatedImageAnnotation, path));
        dispatch(actions.resetError());
      })
      .catch(function(error) {
        dispatch(actions.setError('FETCH_IMAGE_ANNOTATION_ERROR', 'Error loading image annotation. Please provide a valid image annotation URI.'));
      });
  },
  displayImageAnnotationFetchErrors: function() {
    var {error} = this.props;
    if(error !== undefined && error.type === 'FETCH_IMAGE_ANNOTATION_ERROR') {
      return (
        <div className="row">
          <div className="col-md-offset-1 col-md-10">
            <div className="alert alert-danger image-annotation-fetch-error">
              {error.message}
            </div>
          </div>
        </div>
      );
    }
  },
  isIiifManifestUri: function(uri) {
    // TODO: implement more robust IIIF image URI validation
    // return uri.substr(-14) === '/manifest.json';
	return true;
  },
  handleManifestUri: function(manifestUri) {
    var {dispatch, selectedManifestIndex, selectedCollectionIndex} = this.props;
    var that = this;
    // check if the entered URI is a valid IIIF Image API URI; if not, check if it redirects to one
    if(this.isIiifManifestUri(manifestUri)) {
       axios.get(manifestUri)
        .then(function(response) {
		   if(selectedCollectionIndex == undefined) {
             dispatch(actions.updateManifestInCollection(selectedManifestIndex, manifestUri));
		     dispatch(actions.addCollectionTreeManifest("New Label"));
		   } else {
             dispatch(actions.updateCollectionManifestInCollection(selectedManifestIndex, selectedCollectionIndex, manifestUri));
		     dispatch(actions.addCollectionTreeManifest("New Label"));
		   }
		});
    }
  },
  openManifestChoiceDialog: function() {
    // open the manifest choice modal dialog
    var $manifestDialog = $(ReactDOM.findDOMNode(this.refs.manifestDialog));
    $manifestDialog.modal({
      backdrop: 'static'
    });
  },
  handleManifestChoice: function(uri) {
      this.handleManifestUri(uri);
  },
  render: function() {
    var manifests;
	var {selectedCollectionIndex} = this.props;
	
	if(selectedCollectionIndex == undefined) {
		manifests = this.props.manifestoObject.getManifests();
	} else {
		manifests = this.props.manifestoObject.getCollections()[selectedCollectionIndex].getManifests();
	}

    if(manifests.length > 0) {
	  var index = this.props.selectedManifestIndex || 0;
      var manifest = manifests[index];
      var manifestLabelPath = "collections/" + selectedCollectionIndex + "/manifests/" + index + "/label";
      return (
        <div className="metadata-sidebar-panel">
		  <ManifestChoiceDialog ref="manifestDialog" onSubmitHandler={this.handleManifestChoice} manifest={manifest} addOrReplace={manifest !== undefined ? 'replace' : 'add'} />
                  <MetadataSidebarCollectionManifest collectionIndex={selectedCollectionIndex} manifestIndex={index}/>
		  <div className="row">
		       <div className="col-md-12">
		          <button onClick={this.openManifestChoiceDialog} className="btn btn-default center-block add-replace-image-on-canvas-button"><i className={manifest !== undefined ? 'fa fa-refresh' : 'fa fa-plus-circle'}></i> {manifest !== undefined ? 'Replace Manifest' : 'Add Manifest'}</button>
		       </div>
		  </div>
          <hr/>
          
          <dl>
            <dt className="metadata-field-label">Manifest Label</dt> 
            <dd className="metadata-field-value">
              <EditableTextArea fieldValue={Utils.getLocalizedPropertyValue(manifest.getLabel())} path={manifestLabelPath} onUpdateHandler={this.saveMetadataFieldToStore}/>
            </dd>
          </dl>
        </div>
      );
    } else if(manifests.length < 1) {
      return (
        <div>
          This collection does not have any manifests.
        </div>
      );
    } else {
      return (
        <div>
          The selected manifest has been deleted.
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
      selectedCollectionIndex: state.manifestReducer.selectedCollectionIndex,
      error: state.manifestReducer.error
    };
  }
)(CollectionManifestMetadataPanel);
