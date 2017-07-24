import React, { Component } from 'react';
import SortableTree from 'react-sortable-tree';
var {connect} = require('react-redux');
var actions = require('actions');


export default class CollectionTree extends Component {
    constructor(props) {
        super(props);

//		var emptyTree = {
//			   treeData: [{ title: 'New Collection', children: [
//					{ title: 'Manifests', children: [
//					{ title: 'Empty Manifest' } ] },
//					{ title: 'Collections' },
//					{ title: 'Members' }] } ],
//			   };
//
//		this.state = {
//			treeData: [{ title: 'New Collection', children: [
 //                   { title: 'Manifests', children: [
  //                  { title: 'Empty Manifest', key: undefined } ] },
   //                 { title: 'Collections' },
    //                { title: 'Members' }] } ]
	//	};
//
//		this.props.dispatch(actions.setTreeData(emptyTree));
    }

    render() {
        return (
            <div style={{ height: 400 }}>
                <SortableTree
                    treeData={this.props.treeData}
					canDrag={false}
                    onChange={treeData => this.setState({ treeData })}
                />
            </div>
        );
    }
}

module.exports = connect(
	(state) => {
		return {
			treeData: state.manifestReducer.treeData
		};
	}
)(CollectionTree);
