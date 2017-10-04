var React = require('react');
var ReactDOM = require('react-dom');
var {connect} = require('react-redux');
var Utils = require('Utils');

var ManifestChoiceDialog = React.createClass({
  getInitialState: function() {
    return { 
      showHelp: false,
      selectedMethod: "manifestUri",
      selectedMethodText: "IIIF Manifest URI"
    };
  },
  showHelp: function() {
    this.setState({ showHelp: !this.state.showHelp });
  },
  updateSelectedMethod: function(e) {
    this.setState({ 
      selectedMethod: e.target.id,
      selectedMethodText: e.target.value
    });
  },
  getUriSyntax: function() {
    switch (this.state.selectedMethod) {
      case "manifestUri":
        return "{scheme}://{server}{/prefix}/{identifier}/manifest.json";
      default:
        return "http://";
        break;
    }
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onSubmitHandler(this.refs.uri.value);
    this.refs.uri.value = '';
    // close modal window
    var $imageAnnotationChoiceDialog = $(ReactDOM.findDOMNode(this));
    $imageAnnotationChoiceDialog.modal('hide');
  },
  render: function() {
    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
              <h4 className="modal-title">{this.props.addOrReplace === 'add' ? 'Create Manifest on Collection' : 'Replace Manifest in Collection'}: {Utils.getLocalizedPropertyValue(this.props.manifest.getLabel())}</h4>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="text-right">
                    <i className="fa fa-info-circle"></i>&nbsp;
                    <a href="javascript:;" onClick={this.showHelp}>{this.state.showHelp ? 'Hide' : 'Help'}</a>
                  </div>
                  <hr />
                  <h4>{this.props.addOrReplace === 'add' ? 'Create Manifest' : 'Replace Manifest'}:</h4>
                  <form className="form">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="radio">
                          <label>
                            <input type="radio" onChange={this.updateSelectedMethod} name="typeOfAnnotation" id="manifestUri" value="IIIF Manifest URI" defaultChecked />
                              From IIIF Manifest URI
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <h5>Enter {this.state.selectedMethodText}:</h5>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <input ref="uri" className="form-control" type="text" name="uri" placeholder={this.getUriSyntax()} />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-2">
                        <button type="submit" onClick={this.handleSubmit} className="btn btn-primary">Submit URI</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal"><i className="fa fa-close"></i> Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = connect(
  (state) => {
    return {
      manifestoObject: state.manifestReducer.manifestoObject,
      manifestData: state.manifestReducer.manifestData,
      error: state.manifestReducer.error
    };
  }
)(ManifestChoiceDialog);
