var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var actions = require('actions');
var EditableTextArea = require('EditableTextArea');
var NavigationArrow = require('NavigationArrow');
var Utils = require('Utils');
import OpenSeadragonViewer from 'OpenSeadragonViewer'
var OnScreenHelp = require('OnScreenHelp');

var Viewer = React.createClass({
  getInitialState: function() {
    return {
      rotationDegrees: 0,
      helpSection: '',
      sidebarToggleIcon: 'on'
    }
  },
  componentDidMount: function() {
    var _this = this;

    // set the focus on the top-level viewer container
    var $viewerContainer = $(ReactDOM.findDOMNode(this.refs.viewerContainer));
    $viewerContainer.focus();

    // handle key down events on the viewer container
    // Note: The keydown function is used to capture arrow key presses. The keypress function ignores arrow key presses.
    $viewerContainer.bind('keydown', function(e) {
      if(e.shiftKey) {                 // capture shift key
        if(e.keyCode === 37) {         // capture left arrow
          _this.navigate('left');
        } else if(e.keyCode === 39) {  // capture right arrow
          _this.navigate('right');
        }
      }
    });
  },
  navigate: function(direction) {
    var manifest = this.props.manifestoObject;
    var sequence = manifest.getSequenceByIndex(0);
    var canvas = this.props.manifestoObject.getSequenceByIndex(0).getCanvasById(this.props.selectedCanvasId);
    var canvasIndex = canvas !== null ? sequence.getCanvasIndexById(canvas.id) : 0;
    if(direction === 'left') {
      if(canvasIndex > 0) {
        this.saveSelectedCanvasIdToStore(canvasIndex - 1, sequence);
      }
    } else {
      if(canvasIndex < (sequence.getCanvases().length - 1)) {
        this.saveSelectedCanvasIdToStore(canvasIndex + 1, sequence);
      }
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
  saveMetadataFieldToStore: function(fieldValue, path) {
    this.props.dispatch(actions.updateMetadataFieldValueAtPath(fieldValue, path));
  },
  getOpenSeadragonConf: function() {
    var openSeadragonConf =  {
        zoomInButton: "zoom-in",
        zoomOutButton: "zoom-out",
        homeButton: "home",
        fullPageButton: "full-page",
        sequenceMode: false,
        showReferenceStrip: false,
        defaultZoomLevel: 0,
        minZoomLevel: 0,
        degrees: this.state.rotationDegrees,
        tileSources: []
    };
    if(this.props.selectedCanvasId !== undefined) {
      // update main image using the selected canvas
      var canvas = this.props.manifestoObject.getSequenceByIndex(0).getCanvasById(this.props.selectedCanvasId);
      if(canvas !== null) {
        var canvasImages = canvas.getImages();
        if(canvasImages.length > 0) {
          var serviceId = canvasImages[0].getResource().getServices()[0].id;
          // add slash to serviceId if it does not already end with slash
          if(serviceId.substr(-1) !== '/') {
            serviceId = serviceId + '/';
          }
          openSeadragonConf.tileSources = [serviceId + 'info.json'];
        } 
        else {
          // display placeholder image for empty canvases
          openSeadragonConf.tileSources = {
            type: 'image',
            url: "https://placeholdit.imgix.net/~text?txtsize=16&txt=Empty+Canvas&w=200&h=300"
          };
        }
      }
    }
    return openSeadragonConf;
  },
  setShowMetadataSidebar: function(value) {
    this.props.dispatch(actions.setShowMetadataSidebar(value));
  },
  toggleSidebar: function() {
    this.props.showMetadataSidebar ? this.setState({sidebarToggleIcon: 'off'}) : this.setState({sidebarToggleIcon: 'on'});
    this.setShowMetadataSidebar(!this.props.showMetadataSidebar);
  },
  saveSelectedCanvasIdToStore: function(canvasIndex, sequence) {
    this.props.dispatch(actions.setSelectedCanvasId(sequence.getCanvasByIndex(canvasIndex).id));
  },
  rotateLeft: function() {
    this.setState({
      rotationDegrees: (this.state.rotationDegrees - 90) % 360
    });
  },
  rotateRight: function() {
    this.setState({
      rotationDegrees: (this.state.rotationDegrees + 90) % 360
    });
  },
  render: function() {
    var manifest = this.props.manifestoObject;
	var selectedCanvasId = this.props.selectedCanvasId;
    var sequence = manifest.getSequenceByIndex(0);
    var sequenceLength = sequence.getCanvases().length;
    var canvas = selectedCanvasId ? this.props.manifestoObject.getSequenceByIndex(0).getCanvasById(selectedCanvasId) : null;
    var canvasIndex = canvas !== null ? sequence.getCanvasIndexById(canvas.id) : 0;
    var canvasLabelPath = "sequences/0/canvases/" + canvasIndex + "/label";
    var openSeadragonConf = this.getOpenSeadragonConf();
    return (
      <div className="viewer-container" tabIndex="0" ref="viewerContainer">
        <OnScreenHelp ref="onScreenHelp" section={this.state.helpSection} />
        <div className="osd-custom-toolbar">
          <div id="zoom-in"><i className="fa fa-search-plus"></i></div>
          <div id="zoom-out"><i className="fa fa-search-minus"></i></div>
          <div id="home"><i className="fa fa-home"></i></div>
          <div id="rotate-left" onClick={this.rotateLeft}><i className="fa fa-undo"></i></div>
          <div id="rotate-right" onClick={this.rotateRight}><i className="fa fa-repeat"></i></div>
          <div id="full-page"><i className="fa fa-arrows-alt"></i></div>
          <a onClick={this.toggleSidebar} title="Show/hide metadata panel"><i className={"fa fa-toggle-" + this.state.sidebarToggleIcon}></i></a>
          <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('Viewer')} ><i className="fa fa-question-circle-o"></i></a>
        </div>
        <div className="viewer-loading-indicator collapse">
          <i className="fa fa-circle-o-notch fa-spin"></i>
          <div className="viewer-loading-text">Loading</div>
        </div>
        {(() => {
          if(canvasIndex > 0) {
            return (
              <NavigationArrow sequence={sequence} canvasIndex={canvasIndex} onChangeHandler={this.saveSelectedCanvasIdToStore} direction="left" />
            );
          }
        })()}
        <OpenSeadragonViewer ref="openSeadragonViewer" config={openSeadragonConf} key={JSON.stringify(openSeadragonConf)} />
        {(() => {
          if(canvasIndex < sequenceLength-1) {
            return (
              <NavigationArrow sequence={sequence} canvasIndex={canvasIndex} onChangeHandler={this.saveSelectedCanvasIdToStore} direction="right" />
            );
          }
        })()}
        {(() => {
          if(this.props.selectedCanvasId !== undefined && sequenceLength > 0) {
            return (
              <EditableTextArea classNames="viewer-canvas-label" labelPrefix="Canvas Label:" fieldValue={canvas !== null ? Utils.getLocalizedPropertyValue(canvas.getLabel()) : 'Empty canvas'} path={canvasLabelPath} onUpdateHandler={this.saveMetadataFieldToStore}/>
            );
          } else if(sequenceLength < 1) {
            return (
              <div className="viewer-canvas-label">Canvas Label: [This sequence does not have any canvases]</div>
            );
          } else {
            return (
              <div className="viewer-canvas-label">Canvas Label: [Nothing to display]</div>
            );
          }
        })()}
      </div>
    );
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject,
      selectedCanvasId: state.manifestReducer.selectedCanvasId,
      showMetadataSidebar: state.manifestReducer.showMetadataSidebar
    };
  }
)(Viewer);
