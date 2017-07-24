var React = require('react');
var SubCollectionMetadataPanelTabs = require('SubCollectionMetadataPanelTabs');

var SubCollectionMetadataPanel = React.createClass({
  render: function() {
    return (
      <div className="metadata-sidebar-panel">
        <SubCollectionMetadataPanelTabs collectionIndex={this.props.collectionIndex}/>
      </div>
    );
  }
});

module.exports = SubCollectionMetadataPanel;
