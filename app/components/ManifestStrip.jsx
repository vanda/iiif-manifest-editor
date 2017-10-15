var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var ManifestStripCanvas = require('ManifestStripCanvas');
var uuidv4 = require('uuid/v4');
var {SortableItems, SortableItem} = require('react-sortable-component');
var OnScreenHelp = require('OnScreenHelp');

var ManifestStrip = React.createClass({
  getInitialState: function() {
    return {
      selectedManifestStartIndex: undefined,
      selectedManifestEndIndex: undefined,
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
    // center the selected manifest in the thumbnail strip using scrollLeft
    if(this.props.selectedManifestIndex !== prevProps.selectedManifestIndex) {
      var $thumbnailStrip = $(ReactDOM.findDOMNode(this));
      var $activeManifest = $thumbnailStrip.find('.thumbnail-strip-manifest.active');

      if($activeManifest.offset() !== undefined) {
        var scrollPosition = $thumbnailStrip.scrollLeft() + ($activeManifest.offset().left + $activeManifest.width()/2) - $thumbnailStrip.width()/2;
        $activeManifest.css({opacity:0.6});
        $($thumbnailStrip).animate({
          scrollLeft: scrollPosition,
        }, 300, function() {
          $activeManifest.css({opacity:1.0});
        });
      }
    }
  },
  handleSort: function(updatedSortOrder) {
    this.props.dispatch(actions.reorderManifests(updatedSortOrder));

    // deselect manifests on reorder
    this.deSelectManifests();
  },
  appendEmptyManifestToSequence: function() {
    // dispatch action to add empty manifest to end of sequence
    var targetManifestIndex;
	var {selectedCollectionIndex} = this.props;
    var emptyManifest = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
          "@id": "http://example.org/" + uuidv4(),
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

	if(this.props.topLevel == true) {
		targetManifestIndex = this.props.manifestoObject.getManifests().length;
        this.props.dispatch(actions.addEmptyManifestAtIndex(emptyManifest, targetManifestIndex));
	} else {
		targetManifestIndex = this.props.manifestoObject.getCollections()[selectedCollectionIndex].getManifests().length;
        this.props.dispatch(actions.addEmptyCollectionManifestAtIndex(emptyManifest, this.props.selectedCollectionIndex, targetManifestIndex));
	}
  },
  addManifests: function(e) {
    // stops browsers from redirecting
    if(e.preventDefault) {
      e.preventDefault();
    }
    if(e.stopPropagation) {
      e.stopPropagation();
    }

    // get the index in the thumbnail strip to insert the selected manifests
    var insertIndex = e.target.getAttribute('data-manifest-index');

    // handle adding manifests to the beginning and end of a sequence (insertIndex is null)
    if (insertIndex === null) {
      // check mouse position to determine whether manifests were dropped to very beginning of sequence
      // everything above x = 20 is not beginning of sequence so either has an insertIndex or
      // if it is null it is assumed that manifests were dropped to the end of the sequence
      if (e.clientX > 20) {
        var sequence = this.props.manifestoObject.getSequenceByIndex(0);
        insertIndex = sequence.manifests.length;
      }
    }

    // raw manifest data is being passed as a JSON string
    var rawManifestData = e.dataTransfer.getData('text/plain');
    if(rawManifestData !== '') {
      var manifests = JSON.parse(rawManifestData);
      for(var manifestIndex = manifests.length-1; manifestIndex >= 0; manifestIndex--) {
        this.props.dispatch(actions.addManifestAtIndex(manifests[manifestIndex], insertIndex));
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
  deSelectManifests: function() {
    // reset the start and end range of the selected manifests
    this.setState({
      selectedManifestStartIndex: undefined,
      selectedManifestEndIndex: undefined
    });

    // hide the prompt to delete the selected manifests
    this.toggleDeleteSelectedManifestsPrompt(false);
  },
  updateSelectedManifestIndexes: function(clickedManifestIndex) {
    // get the index of the active manifest
    var manifest = this.props.manifestoObject;
    var sequence = manifest.getSequenceByIndex(0);
    var manifest = sequence.getManifestById(this.props.selectedManifestIndex);
    var activeManifestIndex = sequence.getManifestIndexById(manifest.id);

    // set the start and end indexes for the selected range of manifests in the state
    var selectedManifestStartIndex = (activeManifestIndex > clickedManifestIndex) ? clickedManifestIndex : activeManifestIndex;
    var selectedManifestEndIndex = (activeManifestIndex > clickedManifestIndex) ? activeManifestIndex : clickedManifestIndex;
    this.setState({
      selectedManifestStartIndex: selectedManifestStartIndex,
      selectedManifestEndIndex: selectedManifestEndIndex
    });

    // show the prompt to delete the selected manifests
    this.toggleDeleteSelectedManifestsPrompt(true);
  },
  toggleDeleteSelectedManifestsPrompt: function(toggleDisplay) {
    var $deleteSelectedManifestPrompt = $(ReactDOM.findDOMNode(this.refs.deleteSelectedManifestPrompt));
    if(toggleDisplay) {
      $deleteSelectedManifestPrompt.slideDown();
    } else {
      $deleteSelectedManifestPrompt.slideUp();
    }
  },
  isManifestSelected: function(currentManifestIndex) {
    // return whether the manifest is selected if its index falls within the selected start and end range
    return currentManifestIndex >= this.state.selectedManifestStartIndex && currentManifestIndex <= this.state.selectedManifestEndIndex;
  },
  deleteSelectedManifests: function() {
    // delete the selected manifests from the end of the thumbnail strip first; deleting from the front of the
    // thumbnail strip shifts the manifest indexes left causing subsequent deletions to fail
    var {dispatch, manifestIndex} = this.props;
    for(var manifestIndex = this.state.selectedManifestEndIndex; manifestIndex >= this.state.selectedManifestStartIndex; manifestIndex--) {
      // dispatch an action to reset the selected manifest id in the store if the active manifest is deleted
//      if(manifestIndex == this.props.manifestoObject.getSequenceByIndex(0).getManifestIndexById(this.props.selectedManifestId)) {
//        dispatch(actions.setSelectedManifestId(undefined));
 //     }
      // dispatch an action to delete the selected manifest at the given index within the selected range
      dispatch(actions.deleteManifestAtIndex(manifestIndex));
    }

    // deselect manifests after deleting manifests 
    this.deSelectManifests();
  },
  render: function() {
    var _this = this;

	var manifests;

	if(this.props.topLevel != true && this.props.selectedCollectionIndex != undefined) {
		var collection = this.props.manifestoObject.getCollections()[this.props.selectedCollectionIndex];
		manifests = collection.getManifests();
	} else if(this.props.noSelectedCollection == true) {
			return (
               <div className="thumbnail-strip-container"> 
                    <div className="alert alert-danger">
				       Select Collection First
				    </div>
			   </div>
			);
	} else {
		manifests = this.props.manifestoObject.getManifests();
	}

    return (
      <div className="thumbnail-strip-container" onDragOver={this.cancelDragOver} onDrop={this.addManifests}>
        <OnScreenHelp ref="onScreenHelp" section={this.state.helpSection} />
        <div className="alert alert-danger delete-selected-canvases-prompt" ref="deleteSelectedManifestPrompt">
          Delete selected manifests?
          <button type="button" className="btn btn-default" onClick={this.deleteSelectedManifests}><i className="fa fa-check"></i> OK</button>
          <button type="button" className="btn btn-default" onClick={this.deSelectManifests}><i className="fa fa-times"></i> Cancel</button>
        </div>
        <a className="help-icon" href="javascript:;" onClick={() => this.showHelp('ManifestStrip')} ><i className="fa fa-question-circle-o"></i></a>
        <SortableItems name="simple-sort" onSort={this.handleSort}>
          {
            manifests.map(function(manifest, manifestIndex) {
              return (
                <SortableItem key={manifestIndex} draggable={true} className="simple-sort-item">
                  <ManifestStripCanvas key={manifestIndex} manifestIndex={manifestIndex} manifestId={manifest.id} collectionIndex={_this.props.selectedCollectionIndex} isSelectedManifest={_this.isManifestSelected(manifestIndex)} topLevel={_this.props.topLevel} onManifestNormalClick={_this.deSelectManifests} onManifestShiftClick={_this.updateSelectedManifestIndexes} />
                </SortableItem>
              );
            })
          }
        </SortableItems>
        <button type="button" className="btn btn-default add-new-manifest-button" title="Add new manifest to collection" onClick={this.appendEmptyManifestToSequence}>
          <span className="fa fa-plus-circle fa-2x"></span><br />Add Manifest
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
      selectedManifestIndex: state.manifestReducer.selectedManifestIndex,
      selectedCollectionIndex: state.manifestReducer.selectedCollectionIndex
    };
  }
)(ManifestStrip);
