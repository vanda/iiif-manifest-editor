var React = require('react');
var ReactDOM = require('react-dom');
var CollectionMetadataPanel = require('CollectionMetadataPanel');
var BulkActionsPanel = require('BulkActionsPanel');
var OnScreenHelp = require('OnScreenHelp');

var CollectionAccordion = React.createClass({
  getInitialState: function() {
    return {
      helpSection: ''
    }
  },
  setMetadataPanelClasses: function(panelName) {
    if((panelName === 'manifestMetadata' && window.location.hash.startsWith('#/edit?')) ||
       (panelName === 'canvasMetadata' && window.location.hash.startsWith('#/canvases?'))) {
      return "panel-collapse collapse in";
    } else {
      return "panel-collapse collapse";
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
  render: function() {
    return (
      <div className="panel-group" id="metadata-accordion">
      <OnScreenHelp ref="onScreenHelp" section={this.state.helpSection} />
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-manifest-metadata"><i className="fa fa-book"></i> Manifest Metadata</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('CollectionMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-manifest-metadata" className={this.setMetadataPanelClasses('manifestMetadata')}>
            <div className="panel-body">
              <CollectionMetadataPanel/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CollectionAccordion;
