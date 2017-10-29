var React = require('react');
var ReactDOM = require('react-dom');
var CollectionMetadataPanel = require('CollectionMetadataPanel');
var SubCollectionMetadataPanel = require('SubCollectionMetadataPanel');
var CollectionManifestMetadataPanel = require('CollectionManifestMetadataPanel');
var TopManifestMetadataPanel = require('TopManifestMetadataPanel');
var BulkActionsPanel = require('BulkActionsPanel');
var OnScreenHelp = require('OnScreenHelp');
var CollectionTree = require('CollectionTree');
var {connect} = require('react-redux');
var actions = require('actions');


var CollectionMetadataAccordion = React.createClass({
  getInitialState: function() {


    return {
      helpSection: ''
    }
  },
  setMetadataPanelClasses: function(panelName) {
    if((panelName === 'manifestMetadata' && window.location.hash.startsWith('#/manifest/edit?')) ||
       (panelName === 'canvasMetadata' && window.location.hash.startsWith('#/manifest/canvases?'))) {
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
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-manifest-tree"><i className="fa fa-sitemap"></i> Collection Tree</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('CollectionMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-manifest-tree" className={this.setMetadataPanelClasses('manifestTree')}>
            <div className="panel-body">
		         <CollectionTree/>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-manifest-top"><i className="fa fa-book"></i> Top Metadata</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('CollectionMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-manifest-top" className={this.setMetadataPanelClasses('manifestTop')}>
            <div className="panel-body">
              <CollectionMetadataPanel/>
            </div>
          </div>
        </div>
	  <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-topmanifest-metadata"><i className="fa fa-file-image-o"></i> Top Manifest Metadata</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('TopManifestMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-topmanifest-metadata" className={this.setMetadataPanelClasses('manifestTopMetadata')}>
            <div className="panel-body">
              <TopManifestMetadataPanel/>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-manifest-metadata"><i className="fa fa-book"></i> Collection Metadata</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('CollectionMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-manifest-metadata" className={this.setMetadataPanelClasses('manifestMetadata')}>
            <div className="panel-body">
              <SubCollectionMetadataPanel collectionIndex={0} />
            </div>
          </div>
        </div>
	  <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#metadata-accordion" href="#collapse-collectionmanifest-metadata"><i className="fa fa-file-image-o"></i> Manifest Metadata</a>
              <a className="help-icon pull-right" href="javascript:;" onClick={() => this.showHelp('CollectionManifestMetadataPanel')} ><i className="fa fa-question-circle-o"></i></a>
            </h4>
          </div>
          <div id="collapse-collectionmanifest-metadata" className={this.setMetadataPanelClasses('canvasMetadata')}>
            <div className="panel-body">
              <CollectionManifestMetadataPanel/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CollectionMetadataAccordion;
