var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var CollectionStripCanvas = require('CollectionStripCanvas');
var uuidv4 = require('uuid/v4');
var {SortableItems, SortableItem} = require('react-sortable-component');
var OnScreenHelp = require('OnScreenHelp');

var CollectionStrip = React.createClass({
  getInitialState: function() {
    return {
      selectedCollectionStartIndex: undefined,
      selectedCollectionEndIndex: undefined,
      helpSection: ''
    }
  },
  showHelp: function(helpSection) {
    this.setState({
      helpSection: helpSection
    });
    var $onScreenHelp = $(ReactDOM.findDOMNode(this.refs.onScreenHelp));
    $onScreenHelp.modal({
      backdrop: 'static'
    });
  },
  componentWillReceiveProps: function(nextProps) {
  },
  componentDidMount: function() {
    window.addEventListener("drop", function(e) {
      e = e || event;
      e.preventDefault();
    }, false);
  },
  componentDidUpdate: function(prevProps) {
    // center the selected collection in the thumbnail strip using scrollLeft
    if(this.props.selectedCollectionIndex !== prevProps.selectedCollectionIndex) {
      var $thumbnailStrip = $(ReactDOM.findDOMNode(this));
      var $activeCollection = $thumbnailStrip.find('.thumbnail-strip-collection.active');

      if($activeCollection.offset() !== undefined) {
        var scrollPosition = $thumbnailStrip.scrollLeft() + ($activeCollection.offset().left + $activeCollection.width()/2) - $thumbnailStrip.width()/2;
        $activeCollection.css({opacity:0.6});
        $($thumbnailStrip).animate({
          scrollLeft: scrollPosition,
        }, 300, function() {
          $activeCollection.css({opacity:1.0});
        });
      }
    }
  },
  handleSort: function(updatedSortOrder) {
    this.props.dispatch(actions.reorderCollections(updatedSortOrder));

    // deselect collections on reorder
    this.deSelectCollections();
  },
  appendEmptyCollectionToSequence: function() {
    // dispatch action to add empty collection to end of sequence
    var targetCollectionIndex = this.props.manifestoObject.getCollections().length;
    var emptyCollection = {
          "@id": "http://example.org/" + uuidv4(),
          "@type": "sc:Collection",
          "label": "Unnamed Collection",
		  "manifests": [ {
             "@id": "http://example.org/" + uuidv4(),
             "@type": "sc:Manifest",
             "label": "[Click to edit label]",
          }
		  ]
    };

    this.props.dispatch(actions.addEmptyCollectionAtIndex(emptyCollection, targetCollectionIndex));
    this.props.dispatch(actions.addCollectionTreeCollection("Unnamed Collection"));
  },
  addCollections: function(e) {
    // stops browsers from redirecting
    if(e.preventDefault) {
      e.preventDefault();
    }
    if(e.stopPropagation) {
      e.stopPropagation();
    }

    // get the index in the thumbnail strip to insert the selected collections
    var insertIndex = e.target.getAttribute('data-collection-index');

    // handle adding collections to the beginning and end of a sequence (insertIndex is null)
    if (insertIndex === null) {
      // check mouse position to determine whether collections were dropped to very beginning of sequence
      // everything above x = 20 is not beginning of sequence so either has an insertIndex or
      // if it is null it is assumed that collections were dropped to the end of the sequence
      if (e.clientX > 20) {
        var sequence = this.props.manifestoObject.getSequenceByIndex(0);
        insertIndex = sequence.collections.length;
      }
    }

    // raw collection data is being passed as a JSON string
    var rawCollectionData = e.dataTransfer.getData('text/plain');
    if(rawCollectionData !== '') {
      var collections = JSON.parse(rawCollectionData);
      for(var collectionIndex = collections.length-1; collectionIndex >= 0; collectionIndex--) {
        this.props.dispatch(actions.addCollectionAtIndex(collections[collectionIndex], insertIndex));
      }
    }

    // some browsers require a return false for handling drop events
    return false;
  },
  cancelDragOver: function(e) {
    // stops browsers from redirecting
    if(e.preventDefault) {
      e.preventDefault();
    }
    if(e.stopPropagation) {
      e.stopPropagation();
    }
    // some browsers require a return false for canceling the onDragOver event
    return false;
  },
  deSelectCollections: function() {
    // reset the start and end range of the selected collections
    this.setState({
      selectedCollectionStartIndex: undefined,
      selectedCollectionEndIndex: undefined
    });

    // hide the prompt to delete the selected collections
    this.toggleDeleteSelectedCollectionsPrompt(false);
  },
  updateSelectedCollectionIndexes: function(clickedCollectionIndex) {
    // get the index of the active collection
    var collection = this.props.manifestoObject;
    var sequence = collection.getSequenceByIndex(0);
    var collection = sequence.getCollectionById(this.props.selectedCollectionIndex);
    var activeCollectionIndex = sequence.getCollectionIndexById(collection.id);

    // set the start and end indexes for the selected range of collections in the state
    var selectedCollectionStartIndex = (activeCollectionIndex > clickedCollectionIndex) ? clickedCollectionIndex : activeCollectionIndex;
    var selectedCollectionEndIndex = (activeCollectionIndex > clickedCollectionIndex) ? activeCollectionIndex : clickedCollectionIndex;
    this.setState({
      selectedCollectionStartIndex: selectedCollectionStartIndex,
      selectedCollectionEndIndex: selectedCollectionEndIndex
    });

    this.props.dispatch(actions.setSelectedManifestIndex(0));

    // show the prompt to delete the selected collections
    this.toggleDeleteSelectedCollectionsPrompt(true);
  },
  toggleDeleteSelectedCollectionsPrompt: function(toggleDisplay) {
    var $deleteSelectedCollectionPrompt = $(ReactDOM.findDOMNode(this.refs.deleteSelectedCollectionPrompt));
    if(toggleDisplay) {
      $deleteSelectedCollectionPrompt.slideDown();
    } else {
      $deleteSelectedCollectionPrompt.slideUp();
    }
  },
  isCollectionSelected: function(currentCollectionIndex) {
    // return whether the collection is selected if its index falls within the selected start and end range
    return currentCollectionIndex >= this.state.selectedCollectionStartIndex && currentCollectionIndex <= this.state.selectedCollectionEndIndex;
  },
  deleteSelectedCollections: function() {
    // delete the selected collections from the end of the thumbnail strip first; deleting from the front of the
    // thumbnail strip shifts the collection indexes left causing subsequent deletions to fail
    var {dispatch, collectionIndex} = this.props;
    for(var collectionIndex = this.state.selectedCollectionEndIndex; collectionIndex >= this.state.selectedCollectionStartIndex; collectionIndex--) {
      // dispatch an action to reset the selected collection id in the store if the active collection is deleted
//      if(collectionIndex == this.props.collectionoObject.getSequenceByIndex(0).getCollectionIndexById(this.props.selectedCollectionId)) {
//        dispatch(actions.setSelectedCollectionId(undefined));
 //     }
      // dispatch an action to delete the selected collection at the given index within the selected range
      dispatch(actions.deleteCollectionAtIndex(collectionIndex));
    }

    // deselect collections after deleting collections 
    this.deSelectCollections();
  },
  render: function() {
    var _this = this;
    return (
      <div className="thumbnail-strip-container" onDragOver={this.cancelDragOver} onDrop={this.addCollections}>
        <OnScreenHelp ref="onScreenHelp" section={this.state.helpSection} />
        <div className="alert alert-danger delete-selected-canvases-prompt" ref="deleteSelectedCollectionPrompt">
          Delete selected collections?
          <button type="button" className="btn btn-default" onClick={this.deleteSelectedCollections}><i className="fa fa-check"></i> OK</button>
          <button type="button" className="btn btn-default" onClick={this.deSelectCollections}><i className="fa fa-times"></i> Cancel</button>
        </div>
        <a className="help-icon" href="javascript:;" onClick={() => this.showHelp('CollectionStrip')} ><i className="fa fa-question-circle-o"></i></a>
        <SortableItems name="simple-sort" onSort={this.handleSort}>
          {
            this.props.manifestoObject.getCollections().map(function(collection, collectionIndex) {
              return (
                <SortableItem key={collectionIndex} draggable={true} className="simple-sort-item">
                  <CollectionStripCanvas key={collectionIndex} collectionIndex={collectionIndex} collectionId={collection.id} isSelectedCollection={_this.isCollectionSelected(collectionIndex)} onCollectionNormalClick={_this.deSelectCollections} onCollectionShiftClick={_this.updateSelectedCollectionIndexes} />
                </SortableItem>
              );
            })
          }
        </SortableItems>
        <button type="button" className="btn btn-default add-new-collection-button" title="Add new collection to collection" onClick={this.appendEmptyCollectionToSequence}>
          <span className="fa fa-plus-circle fa-2x"></span><br />Add Collection
        </button>
      </div>
    );
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject,
      manifestData: state.manifestReducer.manifestData,
      selectedCollectionIndex: state.manifestReducer.selectedCollectionIndex
    };
  }
)(CollectionStrip);
