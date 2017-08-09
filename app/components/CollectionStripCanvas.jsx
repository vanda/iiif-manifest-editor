var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var manifesto = require('manifesto.js');
var uuidv4 = require('uuid/v4');
var Utils = require('Utils');
var axios = require('axios');
import LazyLoad from 'react-lazy-load';
import Async from 'react-promise'

var CollectionStripCanvas = React.createClass({
  getInitialState: function() {
    return {
      isOver: false
    };
  },
  componentDidMount: function() {
    var $collection = $(ReactDOM.findDOMNode(this));

    // attach hover event to the collection to fade in and out collection menu options
    this.attachHoverEventToCollection($collection);
  },
  attachHoverEventToCollection: function($collection) {
    var fadeInterval = 400;

    // fade in and out the collection menu options
    var $collectionMenuOptions = $collection.find('.collection-menu-options');
    $collection.hover(function() {
      $collectionMenuOptions.stop(true, true).fadeIn(fadeInterval);
    }, function () {
      $collectionMenuOptions.stop(true, true).fadeOut(fadeInterval);
    });

    // fade in and out the delete collection button
    var $deleteCollectionButton = $collection.find('.delete-collection-button');
    $collection.hover(function() {
      $deleteCollectionButton.stop(true, true).fadeIn(fadeInterval);
    }, function () {
      $deleteCollectionButton.stop(true, true).fadeOut(fadeInterval);
    });
  },
  handleCollectionClick: function(e) {
    if(e.shiftKey) {
      // on shift click, select the range of collections in the thumbnail strip
      this.props.onCollectionShiftClick(this.props.collectionIndex);
    } else {
      // on normal click, deselect all collections in the thumbnail strip
      this.props.onCollectionNormalClick();

      // dispatch action to set the active collection in the store
      var {dispatch, collectionIndex} = this.props;
      dispatch(actions.setSelectedCollectionIndex(collectionIndex));
    }
  },
  setActiveClass: function() {
    if(this.props.selectedCollectionId !== undefined && this.props.collectionId === this.props.selectedCollectionId) {
      return "thumbnail-strip-collection active";
    } else {
      return "thumbnail-strip-collection";
    }
  },
  setSelectedClass: function() {
    return this.props.isSelectedCollection ? "selected-collection" : "";
  },
  getDefaultThumbnailHeight: function() {
    return 150;
  },
  getThumbnailCollectionWidth: function(collection) {
	return 150;
//    return Math.round((collection.getWidth() / collection.getHeight()) * this.getDefaultThumbnailHeight());
  },
  getMainImage: function(collection) {
        return Promise.resolve(`https://placeholdit.imgix.net/~text?txtsize=20&txt=${collection.getLabel()[0].value}&w=150&h=100`);
  },
  getMainImageLabel: function(collection) {
    return collection !== null ? Utils.getLocalizedPropertyValue(collection.getLabel()) : 'Empty collection';
  },
  addCollectionLeft: function() {
    // dispatch an action to add an empty collection to the left of the given collection
    var {dispatch, collectionIndex} = this.props;
    var emptyCollection = {
      "@id": "http://example.org/" + uuidv4(),
      "@type": "sc:Collection",
      "label": "Unnamed Collection",
	  "manifests": []
    };
    dispatch(actions.addEmptyCollectionAtIndex(emptyCollection, collectionIndex));
  },
  addCollectionRight: function() {
    // dispatch an action to add an empty collection to the left of the given collection
    var {dispatch, collectionIndex} = this.props;
    var emptyCollection = {
      "@id": "http://example.org/" + uuidv4(),
      "@type": "sc:Collection",
      "label": "Unnamed Collection",
	  "manifests": []
    };
    dispatch(actions.addEmptyCollectionAtIndex(emptyCollection, collectionIndex + 1));
  },
  duplicateCollection: function() {
    // dispatch an action to duplicate the collection at the given index
    var {dispatch, collectionIndex} = this.props;
    dispatch(actions.duplicateCollectionAtIndex(collectionIndex));
  },
  deleteCollection: function() {
    // dispatch an action to delete the collection at the given index from the thumbnail strip
    var {dispatch, collectionIndex} = this.props;
    if (collectionIndex == this.props.collectionoObject.getSequenceByIndex(0).getCollectionIndexById(this.props.selectedCollectionId)) {
      dispatch(actions.setSelectedCollectionId(undefined));
    }
    dispatch(actions.deleteCollectionAtIndex(collectionIndex));
  },
  openDeleteCollectionConfirmationDialog: function() {
    if(confirm('Are you sure you want to delete this collection?')) {
      this.deleteCollection();
    }
  },
  openImportCollectionsView: function() {
    window.location = '#/collections';
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
  handleDragStart: function(e) {
	var {manifestoObject, collectionIndex} = this.props;
	e.dataTransfer.setData("text/plain", JSON.stringify(collectionIndex));
  },
  setCollectionContainerClass: function() {
    return this.state.isOver ? "thumbnail-strip-collection-container selected-drop-target-collection" : "thumbnail-strip-collection-container";
  },
  updateCollectionWidth: function() {
    // recalculate the width on each visible collection based on its image dimensions
    var $visibleCollectionContainer = $(ReactDOM.findDOMNode(this));
    var $thumbnailStripCollection = $visibleCollectionContainer.find('.thumbnail-strip-collection');
    var $image = $thumbnailStripCollection.find('.is-visible img').first();
    var $collectionLabel = $thumbnailStripCollection.find('.collection-label span').first();
    $thumbnailStripCollection.css('width', ($image.width() + 10));
    $collectionLabel.css('width', ($image.width() + 10));
  },
  render: function() {
    var collections = this.props.manifestoObject.getCollections();
    var collection = collections[this.props.collectionIndex];
		  
//    this.props.collectionoObject.getCollectionByIndex(this.props.collectionId).then(function(data) {
//		collection = data
//	});
	
    var collectionStyle = this.props.isSelectedCollection ? {} : { background: '#fff url(./img/loading-small.gif) no-repeat center center' };

    collectionStyle.width = this.getThumbnailCollectionWidth(collection) + 'px';

    return (
      <div className={this.setCollectionContainerClass()} data-collection-index={this.props.collectionIndex} onDragOver={this.handleDragOver} onDragLeave={this.handleDragLeave} onDragStart={this.handleDragStart}>
        <a className="delete-collection-button btn btn-danger btn-xs btn-transparent" onClick={this.openDeleteCollectionConfirmationDialog} title="Remove Collection"><i className="fa fa-trash"></i></a>
        <span className="collection-menu-options dropdown">
          <a className="btn btn-default btn-xs btn-transparent dropdown-toggle" data-toggle="dropdown" title="Show Collection Options"><i className="fa fa-bars"></i></a>
          <ul className="dropdown-menu">
            <li onClick={this.addCollectionLeft}><i className="context-menu-item fa fa-arrow-left"></i> Add collection left</li>
            <li onClick={this.addCollectionRight}><i className="context-menu-item fa fa-arrow-right"></i> Add collection right</li>
            <li onClick={this.duplicateCollection}><i className="context-menu-item fa fa-files-o"></i> Duplicate collection</li>
            {(() => {
              if(window.location.hash.startsWith('#/edit?')) {
                return (
                  <li onClick={() => this.openImportCollectionsView()}><i className="context-menu-item fa fa-picture-o"></i> Import collections</li>
                );
              }
            })()}
          </ul>
        </span>
        <div style={collectionStyle} className={this.setActiveClass()} onClick={this.handleCollectionClick}>
          <LazyLoad offsetHorizontal={600} resize={true}>
          <Async promise={this.getMainImage(collection)} then={(img) => {
            return <img onLoad={this.updateCollectionWidth} className={this.setSelectedClass()} src={img} data-collection-index={this.props.collectionIndex} alt={this.getMainImageLabel(collection)} />
          }} pendingRender={ 
            <img onLoad={this.updateCollectionWidth} className={this.setSelectedClass()} src="https://placeholdit.imgix.net/~text?txtsize=20&txt=Empty+Canvas&w=100&h=150" data-collection-index={this.props.collectionIndex} alt={this.getMainImageLabel(collection)} />
          } />
          </LazyLoad>
          <div className="collection-label" title={this.getMainImageLabel(collection)}>
            <span>{this.stringTruncate(this.getMainImageLabel(collection), 20)}</span>
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
      selectedCollectionIndex: state.manifestReducer.selectedCollectionIndex
    };
  }
)(CollectionStripCanvas);
