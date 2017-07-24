var React = require('react');
var SubCollectionMetadataPanelPredefinedFields = require('SubCollectionMetadataPanelPredefinedFields');
var SubCollectionMetadataPanelCustomFields = require('SubCollectionMetadataPanelCustomFields');

var SubCollectionMetadataPanelTabs = React.createClass({
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <ul className="nav nav-tabs" id="tab-nav">
              <li className="active"><a href="#predefined-fields" data-toggle="tab">Predefined Fields</a></li>
              <li><a href="#custom-fields" data-toggle="tab">Custom Fields</a></li>
            </ul>
          </div>
        </div>
        <div className="tab-content">
          <div className="tab-pane active" id="predefined-fields">
            <SubCollectionMetadataPanelPredefinedFields collectionIndex={this.props.collectionIndex} />
          </div>
          <div className="tab-pane" id="custom-fields">
            <SubCollectionMetadataPanelCustomFields/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SubCollectionMetadataPanelTabs;
