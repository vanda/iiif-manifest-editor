var React = require('react');
var CollectionMetadataPanelPredefinedFields = require('CollectionMetadataPanelPredefinedFields');
var CollectionMetadataPanelCustomFields = require('CollectionMetadataPanelCustomFields');

var CollectionMetadataPanelTabs = React.createClass({
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
            <CollectionMetadataPanelPredefinedFields/>
          </div>
          <div className="tab-pane" id="custom-fields">
            <CollectionMetadataPanelCustomFields/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CollectionMetadataPanelTabs;
