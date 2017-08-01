var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var manifesto = require('manifesto.js');
var uuidv4 = require('uuid/v4');
var Utils = require('Utils');
const cachios = require('cachios');
import LazyLoad from 'react-lazy-load';
import Async from 'react-promise'

var ManifestStripCanvas = React.createClass({
  getInitialState: function() {
    return {
      isOver: false
    };
  },
  componentDidMount: function() {
    var $manifest = $(ReactDOM.findDOMNode(this));

    // attach hover event to the manifest to fade in and out manifest menu options
    this.attachHoverEventToManifest($manifest);
  },
  attachHoverEventToManifest: function($manifest) {
    var fadeInterval = 400;

    // fade in and out the manifest menu options
    var $manifestMenuOptions = $manifest.find('.manifest-menu-options');
    $manifest.hover(function() {
      $manifestMenuOptions.stop(true, true).fadeIn(fadeInterval);
    }, function () {
      $manifestMenuOptions.stop(true, true).fadeOut(fadeInterval);
    });

    // fade in and out the delete manifest button
    var $deleteManifestButton = $manifest.find('.delete-manifest-button');
    $manifest.hover(function() {
      $deleteManifestButton.stop(true, true).fadeIn(fadeInterval);
    }, function () {
      $deleteManifestButton.stop(true, true).fadeOut(fadeInterval);
    });
  },
  handleManifestClick: function(e) {
    if(e.shiftKey) {
      // on shift click, select the range of manifests in the thumbnail strip
      this.props.onManifestShiftClick(this.props.manifestIndex);
    } else {
      // on normal click, deselect all manifests in the thumbnail strip
      this.props.onManifestNormalClick();

      // dispatch action to set the active manifest in the store
      var {dispatch, manifestIndex} = this.props;
      dispatch(actions.setSelectedManifestIndex(manifestIndex));
    }
  },
  setActiveClass: function() {
    if(this.props.selectedManifestId !== undefined && this.props.manifestId === this.props.selectedManifestId) {
      return "thumbnail-strip-manifest active";
    } else {
      return "thumbnail-strip-manifest";
    }
  },
  setSelectedClass: function() {
    return this.props.isSelectedManifest ? "selected-manifest" : "";
  },
  getDefaultThumbnailHeight: function() {
    return 150;
  },
  getThumbnailManifestWidth: function(manifest) {
	return 150;
//    return Math.round((manifest.getWidth() / manifest.getHeight()) * this.getDefaultThumbnailHeight());
  },
  getMainImage: function(manifest) {
	 if(manifest.id.substr(0,19) !== 'http://example.org/') {
           return cachios.get(manifest.id, { ttl: 300 }).then(function(response) {
              var data = response.data;
		      if('thumbnail' in data) {
                return data.thumbnail;
			  } else {
				var collectionManifestoObject = manifesto.create(JSON.stringify(data));
				var canvas = collectionManifestoObject.getSequenceByIndex(0).getCanvasByIndex(0);
				var img = canvas.getImages().length > 0 ? canvas.getCanonicalImageUri(150) : 'https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Canvas&w=100&h=150';
				return img;
			  }
				
       }).catch(function(err) {
        return 'https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Manifest&w=100&h=150';
       });
	 } else {
        return Promise.resolve('https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Manifest&w=100&h=150');
	 }

  },
  getMainImageLabel: function(manifest) {
    return manifest !== null ? Utils.getLocalizedPropertyValue(manifest.getLabel()) : 'Empty manifest';
  },
  addManifestLeft: function() {
    // dispatch an action to add an empty manifest to the left of the given manifest
    var {dispatch, manifestIndex} = this.props;
    var emptyManifest = {
      "@id": "http://example.org/" + uuidv4(),
      "@type": "sc:Manifest",
      "label": "Empty manifest",
      "height": 0,
      "width": 0,
      "images": []
    };
    dispatch(actions.addEmptyManifestAtIndex(emptyManifest, manifestIndex));
  },
  addManifestRight: function() {
    // dispatch an action to add an empty manifest to the left of the given manifest
    var {dispatch, manifestIndex} = this.props;
    var emptyManifest = {
      "@id": "http://example.org/" + uuidv4(),
      "@type": "sc:Manifest",
      "label": "Empty manifest",
      "height": 0,
      "width": 0,
      "images": []
    };
    dispatch(actions.addEmptyManifestAtIndex(emptyManifest, manifestIndex + 1));
  },
  duplicateManifest: function() {
    // dispatch an action to duplicate the manifest at the given index
    var {dispatch, manifestIndex} = this.props;
    dispatch(actions.duplicateManifestAtIndex(manifestIndex));
  },
  deleteManifest: function() {
    // dispatch an action to delete the manifest at the given index from the thumbnail strip
    var {dispatch, manifestIndex, selectedCollectionIndex} = this.props;
	if (selectedCollectionIndex == undefined) {
      dispatch(actions.setSelectedManifestId(undefined));
      dispatch(actions.deleteManifestAtIndex(manifestIndex));
	} else {
      dispatch(actions.setSelectedManifestId(undefined));
      dispatch(actions.deleteCollectionManifestAtIndex(selectedcollectionIndex, manifestIndex));
    }
  },
  openDeleteManifestConfirmationDialog: function() {
    if(confirm('Are you sure you want to delete this manifest?')) {
      this.deleteManifest();
    }
  },
  openImportManifestsView: function() {
    window.location = '#/manifests';
  },
  stringTruncate: function(str, maxLength) {
    return str.length > maxLength ? str.substring(0, maxLength - 1) + '…' : str;
  },
  handleDragOver: function() {
    this.setState({
      isOver: true
    });
  },
  handleDragLeave: function() {
    this.setState({
      isOver: false
    });
  },
  setManifestContainerClass: function() {
    return this.state.isOver ? "thumbnail-strip-manifest-container selected-drop-target-manifest" : "thumbnail-strip-manifest-container";
  },
  updateManifestWidth: function() {
    // recalculate the width on each visible manifest based on its image dimensions
    var $visibleManifestContainer = $(ReactDOM.findDOMNode(this));
    var $thumbnailStripManifest = $visibleManifestContainer.find('.thumbnail-strip-manifest');
    var $image = $thumbnailStripManifest.find('.is-visible img').first();
    var $manifestLabel = $thumbnailStripManifest.find('.manifest-label span').first();
    $thumbnailStripManifest.css('width', ($image.width() + 10));
    $manifestLabel.css('width', ($image.width() + 10));
  },
  render: function() {

    var manifests;

	if(this.props.topLevel == true || this.props.collectionIndex == undefined) {
		manifests = this.props.manifestoObject.getManifests();
	} else {
		manifests = this.props.manifestoObject.getCollections()[this.props.collectionIndex].getManifests();
	}
    var manifest = manifests[this.props.manifestIndex];
		  
//    this.props.manifestoObject.getManifestByIndex(this.props.manifestId).then(function(data) {
//		manifest = data
//	});
	
    var manifestStyle = this.props.isSelectedManifest ? {} : { background: '#fff url(./img/loading-small.gif) no-repeat center center' };

    manifestStyle.width = this.getThumbnailManifestWidth(manifest) + 'px';

    return (
      <div className={this.setManifestContainerClass()} data-manifest-index={this.props.manifestIndex} onDragOver={this.handleDragOver} onDragLeave={this.handleDragLeave}>
        <a className="delete-manifest-button btn btn-danger btn-xs btn-transparent" onClick={this.openDeleteManifestConfirmationDialog} title="Remove Manifest"><i className="fa fa-trash"></i></a>
        <span className="manifest-menu-options dropdown">
          <a className="btn btn-default btn-xs btn-transparent dropdown-toggle" data-toggle="dropdown" title="Show Manifest Options"><i className="fa fa-bars"></i></a>
          <ul className="dropdown-menu">
            <li onClick={this.addManifestLeft}><i className="context-menu-item fa fa-arrow-left"></i> Add manifest left</li>
            <li onClick={this.addManifestRight}><i className="context-menu-item fa fa-arrow-right"></i> Add manifest right</li>
            <li onClick={this.duplicateManifest}><i className="context-menu-item fa fa-files-o"></i> Duplicate manifest</li>
            {(() => {
              if(window.location.hash.startsWith('#/edit?')) {
                return (
                  <li onClick={() => this.openImportManifestsView()}><i className="context-menu-item fa fa-picture-o"></i> Import manifests</li>
                );
              }
            })()}
          </ul>
        </span>
        <div style={manifestStyle} className={this.setActiveClass()} onClick={this.handleManifestClick}>
          <LazyLoad offsetHorizontal={600} resize={true}>
          <Async promise={this.getMainImage(manifest)} then={(img) => {
            return <img onLoad={this.updateManifestWidth} className={this.setSelectedClass()} src={img} data-manifest-index={this.props.manifestIndex} alt={this.getMainImageLabel(manifest)} />
          }} pendingRender={ 
            <img onLoad={this.updateManifestWidth} className={this.setSelectedClass()} src="https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Manifest&w=100&h=150" data-manifest-index={this.props.manifestIndex} alt={this.getMainImageLabel(manifest)} />
          } />
          </LazyLoad>
          <div className="manifest-label" title={this.getMainImageLabel(manifest)}>
            <span>{this.stringTruncate(this.getMainImageLabel(manifest), 20)}</span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject,
      selectedManifestIndex: state.manifestReducer.selectedManifestIndex
    };
  }
)(ManifestStripCanvas);
