var React = require('react');
var {connect} = require('react-redux');
var actions = require('actions');
var EditableTextArea = require('EditableTextArea');
var FormSelect = require('FormSelect');

var SubCollectionMetadataPanelPredefinedFields = React.createClass({
  getInitialState: function() {
    return {
      numUniqueMetadataFields: [0],
      numMultiValuedMetadataFields: [0],
      numUnassignedMetadataFields: [0],
      availableMetadataFields: [[
	    {
          name: 'label',
          label: 'Label',
          value: undefined,
          isRequired: true,
          isUnique: true,
          addPath: '',
          updatePath: 'label'
        },
        {
          name: 'description',
          label: 'Description',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'description'
        },
        {
          name: 'license',
          label: 'License',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'license'
        },
        {
          name: 'logo',
          label: 'Logo',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'logo'
        },
      ]],
      activeMetadataFields: [[]]
    }
  },
  getAvailableMetadataFieldIndexByFieldName: function(availableMetadataFields, fieldName) {
	var selectedCollectionIndex = this.props.selectedCollectionIndex || 0;
    var availableMetadataFieldIndex = -1;
    for(var fieldIndex = 0; fieldIndex < availableMetadataFields[selectedCollectionIndex].length; fieldIndex++) {
      var metadataField = availableMetadataFields[selectedCollectionIndex][fieldIndex];
      if(metadataField.name === fieldName) {
        availableMetadataFieldIndex = fieldIndex;
        break;
      }
    }
    return availableMetadataFieldIndex;
  },
  getActiveMetadataFieldIndexByFieldName: function(activeMetadataFields, fieldName) {
    var activeMetadataFieldIndex = -1;
    Object.keys(activeMetadataFields).map(function(index) {
      var metadataField = activeMetadataFields[index];
      if(metadataField.name === fieldName) {
        activeMetadataFieldIndex = index;
      }
    });
    return activeMetadataFieldIndex;
  },
  updateMetadataFieldLists: function(fieldName, fieldValue, availableMetadataFields, activeMetadataFields) {
    // find the available metadata field based on the field name
	var selectedCollectionIndex = this.props.selectedCollectionIndex || 0;
    var availableMetadataFieldIndex = this.getAvailableMetadataFieldIndexByFieldName(availableMetadataFields, fieldName);
    if(availableMetadataFieldIndex !== -1) {
      // append the metadata field to the list of active fields and update its value
      var availableMetadataField = availableMetadataFields[selectedCollectionIndex][availableMetadataFieldIndex];
      availableMetadataField.value = fieldValue;
      activeMetadataFields[selectedCollectionIndex].push(availableMetadataField);

      // delete the metadata field from the list of available fields if it is unique
      if(availableMetadataField.isUnique) {
        availableMetadataFields[selectedCollectionIndex].splice(availableMetadataFieldIndex, 1);
      }
    } else {
      // find the active metadata field based on the field name and update its value
      var activeMetadataFieldIndex = this.getActiveMetadataFieldIndexByFieldName(activeMetadataFields, fieldName);
      if(activeMetadataFieldIndex !== -1) {
        var activeMetadataField = activeMetadataFields[selectedCollectionIndex][activeMetadataFieldIndex];
        activeMetadataField.value = fieldValue;
      }
    }
  },
  componentWillMount: function() {
    // create copies of the metadata field lists
	var selectedCollectionIndex = this.props.selectedCollectionIndex || 0;
    var availableMetadataFields = [...this.state.availableMetadataFields];
    var activeMetadataFields = [...this.state.activeMetadataFields];

    var numUniqueMetadataFields =  availableMetadataFields[selectedCollectionIndex].filter(function(field) { return !field.isUnique }).length;
    var numMultiValuedMetadataFields = availableMetadataFields[selectedCollectionIndex].filter(function(field) { return field.isUnique }).length;

//      this.updateMetadataFieldLists('label', this.props.manifestoObject.collections[this.props.selectedCollectionIndex].getLabel(), availableMetadataFields, activeMetadataFields);
  //  if(this.props.manifestoObject.getLabel()) {  // description
    if(this.props.manifestoObject.getCollections()[selectedCollectionIndex].getLabel()) {  // label
      this.updateMetadataFieldLists('label', this.props.manifestoObject.getCollections()[selectedCollectionIndex].getLabel(), availableMetadataFields, activeMetadataFields);
    }
    if(this.props.manifestoObject.getDescription()) {  // description
      this.updateMetadataFieldLists('description', this.props.manifestoObject.getDescription(), availableMetadataFields, activeMetadataFields);
    }
    if(this.props.manifestoObject.getLicense()) {  // license
      this.updateMetadataFieldLists('license', this.props.manifestoObject.getLicense(), availableMetadataFields, activeMetadataFields);
    }
    if(this.props.manifestoObject.getLogo()) {  // logo
      this.updateMetadataFieldLists('logo', this.props.manifestoObject.getLogo(), availableMetadataFields, activeMetadataFields);
    }

    // update the metadata field lists in the state so that the component uses the correct values when rendering
    this.state.numUniqueMetadataFields[selectedCollectionIndex] = numUniqueMetadataFields;
    this.state.numUnassignedMetadataFields[selectedCollectionIndex] = 0;

    this.setState({
      numMultiValuedMetadataFields,
      availableMetadataFields: availableMetadataFields,
      activeMetadataFields: activeMetadataFields
    });
  },
  componentDidUpdate: function(prevProps, prevState) {
    // update the viewing direction field if it has been changed in the Sequence Metadata panel
	  // TODO if selectedCollectionIndex > length append new eleements
	var { selectedCollectionIndex, manifestData } = this.props;
    var availableMetadataFields = [...this.state.availableMetadataFields];
    var activeMetadataFields = [...this.state.activeMetadataFields];

    if(manifestData.collections.length > availableMetadataFields.length) {
		availableMetadataFields.push(
	    [{
          name: 'label',
          label: 'Label',
          value: undefined,
          isRequired: true,
          isUnique: true,
          addPath: '',
          updatePath: 'label'
        },
        {
          name: 'description',
          label: 'Description',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'description'
        },
        {
          name: 'license',
          label: 'License',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'license'
        },
        {
          name: 'logo',
          label: 'Logo',
          value: undefined,
          isRequired: false,
          isUnique: true,
          addPath: '',
          updatePath: 'logo'
        }]);

		activeMetadataFields.push([]);
		var collection = this.props.manifestoObject.getCollections()[selectedCollectionIndex];
        this.updateMetadataFieldLists('label', collection.getLabel(), availableMetadataFields, activeMetadataFields);

        this.setState({
           availableMetadataFields: availableMetadataFields,
           activeMetadataFields: activeMetadataFields
		});
	}
  },
  addMetadataField: function() {
    // create copies of the metadata field lists
	var { selectedCollectionIndex } = this.props;
    var availableMetadataFields = [...this.state.availableMetadataFields][selectedCollectionIndex];
    var activeMetadataFields = [...this.state.activeMetadataFields];
    var numUnassignedMetadataFields = this.state.numUnassignedMetadataFields[selectedCollectionIndex] + 1;

    // append an empty metadata field to the active metadata list
    if(availableMetadataFields.length > 0) {
      var newMetadataField = { name: undefined, value: 'N/A' };
      activeMetadataFields[selectedCollectionIndex].push(newMetadataField);

      // update the metadata field lists in the state
      this.state.numUnassignedMetadataFields[selectedCollectionIndex] = numUnassignedMetadataFields;

      this.setState({
        numUnassignedMetadataFields: numUnassignedMetadataFields,
        activeMetadataFields: activeMetadataFields
      });
    }
  },
  updateMetadataFieldValue: function(fieldValue, path, fieldName) {
    // update the metadata field value to the collection data object in the store
    if(fieldName !== undefined) {
	  var collectionPath = `collections/${this.props.selectedCollectionIndex}/${path}`;
      this.props.dispatch(actions.updateMetadataFieldValueAtPath(fieldValue, collectionPath));
    }
  },
  deleteMetadataField: function(metadataFieldToDelete, index) {
    // create copies of the metadata field lists
	var { selectedCollectionIndex } = this.props;
    var availableMetadataFields = [...this.state.availableMetadataFields];
    var activeMetadataFields = [...this.state.activeMetadataFields];

    var numUnassignedMetadataFields = (metadataFieldToDelete.name === undefined) ? this.state.numUnassignedMetadataFields[selectedCollectionIndex] - 1 : this.state.numUnassignedMetadataFields[selectedCollectionIndex];

    // append the metadata field to delete to the list of available fields
    if(metadataFieldToDelete.name !== undefined) {
      metadataFieldToDelete.value = undefined;
      availableMetadataFields[selectedCollectionIndex].push(metadataFieldToDelete);
    }

    // delete the metadata field from the list of active fields
    activeMetadataFields[selectedCollectionIndex].splice(index, 1);

    // update the metadata field lists in the state so that the component uses the correct values when rendering
    this.state.numUnassignedMetadataFields[selectedCollectionIndex] = numUnassignedMetadataFields;

    this.setState({
      numUnassignedMetadataFields: numUnassignedMetadataFields,
      availableMetadataFields: availableMetadataFields,
      activeMetadataFields: activeMetadataFields
    });

    // delete the metadata field to the collection data object in the store
    if(metadataFieldToDelete.name !== undefined) {
      this.props.dispatch(actions.deleteMetadataFieldAtPath(metadataFieldToDelete.updatePath));
    }
  },
  updateMetadataFieldsWithSelectedOption: function(menuIndex, selectedFieldName) {
    // create copies of the metadata field lists
	var { selectedCollectionIndex } = this.props;
    var availableMetadataFields = [...this.state.availableMetadataFields];
    var activeMetadataFields = [...this.state.activeMetadataFields];

    var metadataFieldToDelete = activeMetadataFields[selectedCollectionIndex][menuIndex];
    var numUnassignedMetadataFields = (metadataFieldToDelete.name === undefined) ? this.state.numUnassignedMetadataFields[selectedCollectionIndex] - 1 : this.state.numUnassignedMetadataFields[selectedCollectionIndex];

    // delete the selected menu at the given index in the active list of metadata fields
    activeMetadataFields[selectedCollectionIndex].splice(menuIndex, 1);

    // find the available metadata field based on the field name
    var availableMetadataFieldIndex = this.getAvailableMetadataFieldIndexByFieldName(availableMetadataFields, selectedFieldName);
    var availableMetadataField = availableMetadataFields[selectedCollectionIndex][availableMetadataFieldIndex];
    availableMetadataField.value = 'N/A';

    // insert the available field at the location of the deleted field
    activeMetadataFields[selectedCollectionIndex].splice(menuIndex, 0, availableMetadataField);

    // delete the available field
    availableMetadataFields[selectedCollectionIndex].splice(availableMetadataFieldIndex, 1);

    // update the metadata field lists in the state so that the component uses the correct values when rendering
    this.state.numUnassignedMetadataFields[selectedCollectionIndex] = numUnassignedMetadataFields;

    this.setState({
      numUnassignedMetadataFields: numUnassignedMetadataFields,
      availableMetadataFields: availableMetadataFields,
      activeMetadataFields: activeMetadataFields
    });

    // add the metadata field to the collection data object in the store
    this.props.dispatch(actions.addMetadataFieldAtPath(availableMetadataField.name, availableMetadataField.value, availableMetadataField.addPath));
  },
  render: function() {
    var _this = this;
	var { selectedCollectionIndex } = this.props;

	var collection_uri;

	if(selectedCollectionIndex == undefined) {
	  return (
		  <div>Select a Collection</div>
	  );
	} else {
      return (
      <div>
        <dl>
          <dt className="metadata-field-label">Collection URI</dt>
          <dd className="metadata-field-value">
            <a href={_this.props.manifestoObject.getCollections()[_this.props.selectedCollectionIndex].id} target="_blank">{_this.props.manifestoObject.getCollections()[_this.props.selectedCollectionIndex].id} </a>
          </dd>
        </dl>
        {
          Object.keys(_this.state.activeMetadataFields[_this.props.selectedCollectionIndex]).map(function(fieldIndex) {
            var metadataField = _this.state.activeMetadataFields[_this.props.selectedCollectionIndex][fieldIndex];
            return (
              <dl key={fieldIndex}>
                {(() => {
                  if(metadataField.name === undefined) {
                    return (
                      <dt className="metadata-field-label">
                        <FormSelect id={fieldIndex} options={_this.state.availableMetadataFields[_this.state.selectedCollectionIndex]} placeholder="Choose field" selectedOption="" onChange={_this.updateMetadataFieldsWithSelectedOption}/>
                      </dt>
                    );
                  } else {
                    return (
                      <dt className="metadata-field-label">
                        {metadataField.label}
                      </dt>
                    );
                  }
                })()}
                {(() => {
                  if(metadataField.name === undefined) {
                    return (
                      <dd className="metadata-field-value">N/A</dd>
                    );
                  } else {
                    return (
                      <dd className="metadata-field-value">
                        <EditableTextArea fieldName={metadataField.name} fieldValue={metadataField.value} path={metadataField.updatePath} onUpdateHandler={_this.updateMetadataFieldValue}/>
                      </dd>
                    );
                  }
                })()}
                {(() => {
                  if(!metadataField.isRequired) {
                    return (
                      <dd className="metadata-field-delete">
                        <a href="javascript:;" title={"Delete " + metadataField.label + " field"} onClick={() => _this.deleteMetadataField(metadataField, fieldIndex)}>
                          <span className="fa fa-times-circle"></span>
                        </a>
                      </dd>
                    );
                  }
                })()}
              </dl>
            );
          })
        }
        {(() => {
          if(Object.keys(_this.state.availableMetadataFields[_this.props.selectedCollectionIndex]).length != _this.state.numUnassignedMetadataFields[_this.props.selectedCollectionIndex]) {
            return (
              <button type="button" className="btn btn-default add-metadata-field-button" title="Add metadata field" onClick={_this.addMetadataField}>
                <span className="fa fa-plus"></span> Add metadata field
              </button>
            );
          }
        })()}
      </div>
    );
	}
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
)(SubCollectionMetadataPanelPredefinedFields);
