var React = require('react');
var CollectionMetadataPanelTabs = require('CollectionMetadataPanelTabs');

var CollectionMetadataPanel = React.createClass({
  render: function() {
    return (
      <div className="metadata-sidebar-panel">
        <CollectionMetadataPanelTabs collectionIndex={this.props.collectionIndex}/>
      </div>
    );
  }
});

module.exports = CollectionMetadataPanel;
