var manifesto = require('manifesto.js');
var uuid = require('uuid/v4');
var deepcopy = require('deepcopy');
import addNodeUnderParent from "react-sortable-tree";
import getFlatDataFromTree from "react-sortable-tree";

var stateDefaults = {
  isFetchingLocalManifest: false,
  isFetchingRemoteManifest: false,
  isFetchingImageAnnotation: false,
  manifestData: undefined,
  manifestoObject: undefined,
  manifestFilenameToSave: 'manifest.json',
  metadataFieldValue: undefined,
  selectedManifestIndex: undefined,
  selectedManifestId: undefined,
  selectedCollectionIndex: undefined,
  selectedCanvasId: undefined,
  error: undefined,
  showMetadataSidebar: true,
  treeData: undefined
}

const keyFromTreeIndex = ({ treeIndex }) => treeIndex;
const keyFromKey = ({ node }) => node.key;

export var manifestReducer = (state = stateDefaults, action) => {
  switch (action.type) {
    case 'START_MANIFEST_FETCH':
      return Object.assign({}, state, {
        isFetchingLocalManifest: action.manifestType === 'MANIFEST_TYPE_LOCAL',
        isFetchingRemoteManifest: action.manifestType === 'MANIFEST_TYPE_REMOTE',
        error: undefined
      });
    case 'COMPLETE_MANIFEST_FETCH':
      return Object.assign({}, state, {
        isFetchingLocalManifest: false,
        isFetchingRemoteManifest: false
      });
    case 'SET_MANIFESTO_OBJECT':
      return Object.assign({}, state, {
        manifestoObject: action.manifestoObject
      });
    case 'SET_MANIFEST_DATA':
      return Object.assign({}, state, {
        manifestData: action.manifestData
      });
    case 'SET_MANIFEST_FILE_NAME':
      return Object.assign({}, state, {
        manifestFilenameToSave: action.manifestFilenameToSave
      });
    case 'ADD_METADATA_FIELD_AT_PATH':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // add the metadata field at the given path; when no path is provided, the metadata field will be added at the top-level
      var object = updatedManifestData;
      if(action.path) {
        var stack = action.path.split('/');
        while(stack.length > 0) {
          object = object[stack.shift()];
        }
      }
      object[action.metadataFieldName] = action.metadataFieldValue;

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'ADD_METADATA_FIELD_TO_LIST_AT_PATH':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // add the metadata field to the list at the given path; the metadata field will be appended to the end of the list
      var object = updatedManifestData;
      var stack = action.path.split('/');
      while(stack.length > 1) {
        object = object[stack.shift()];
      }
      object[stack.shift()].push(action.metadataFieldObject);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'UPDATE_METADATA_FIELD_NAME_AT_PATH':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // create the new metadata field and delete the old metadata field at the given path
      var object = updatedManifestData;
      if(action.path) {
        var stack = action.path.split('/');
        while(stack.length > 0) {
          object = object[stack.shift()];
        }
      }
      object[action.newMetadataFieldName] = object[action.oldMetadataFieldName];
      delete object[action.oldMetadataFieldName];

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'UPDATE_METADATA_FIELD_VALUE_AT_PATH':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // update the metadata field at the given path
      var object = updatedManifestData;
      var stack = action.path.split('/');
      while(stack.length > 1) {
        object = object[stack.shift()];
      }
      object[stack.shift()] = action.metadataFieldValue;

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DELETE_METADATA_FIELD_AT_PATH':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // delete the metadata field at the given path
      var object = updatedManifestData;
      var stack = action.path.split('/');
      while(stack.length > 1) {
        object = object[stack.shift()];
      }
      delete object[stack.shift()];

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DELETE_METADATA_FIELD_FROM_LIST_AT_PATH_AND_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // delete the metadata field from the list at the given index and the given path
      var object = updatedManifestData;
      var stack = action.path.split('/');
      while(stack.length > 1) {
        object = object[stack.shift()];
      }
      object[stack.shift()].splice(action.fieldIndex, 1);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'ADD_EMPTY_COLLECTION_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedCollectionData = {
        ...state.manifestData
      };

      // insert the empty collection at the given index in the sequence
      updatedCollectionData.collections.splice(action.collectionIndex, 0, action.emptyCollection);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedCollectionData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedCollectionData
      };
    case 'ADD_EMPTY_MANIFEST_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedCollectionData = {
        ...state.manifestData
      };

      // insert the empty manifest at the given index in the sequence
      updatedCollectionData.manifests.splice(action.manifestIndex, 0, action.emptyManifest);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedCollectionData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedCollectionData
      };
    case 'ADD_EMPTY_COLLECTION_MANIFEST_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedCollectionData = {
        ...state.manifestData
      };

	  if(updatedCollectionData.collections[action.collectionIndex].manifests.length == 0) {
         updatedCollectionData.collections[action.collectionIndex].manifests.push(action.emptyManifest);
	  } else {
      // insert the empty manifest at the given index in the sequence
      updatedCollectionData.collections[action.collectionIndex].manifests.splice(action.manifestIndex, 0, action.emptyManifest);
	  }

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedCollectionData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedCollectionData
      };
    case 'ADD_EMPTY_CANVAS_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // insert the empty canvas at the given index in the sequence
      updatedManifestData.sequences[0].canvases.splice(action.canvasIndex, 0, action.emptyCanvas);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'ADD_CANVAS_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };
      
      // ensure that a duplicate canvas id is not added to the manifest
      for(var canvasIndex = 0; canvasIndex < updatedManifestData.sequences[0].canvases.length; canvasIndex++) {
        var canvas = updatedManifestData.sequences[0].canvases[canvasIndex];
        if(canvas['@id'] === action.canvas['@id']) {
          // generate a unique uuid for the newly added canvas
          var newCanvasId = "http://" + uuidv4();

          // update the canvas id with the new uuid
          action.canvas['@id'] = newCanvasId;

          // update the 'images.on' property with the new uuid
          action.canvas.images[0]['on'] = newCanvasId;

          break;
        }
      };

      // insert the canvas at the given index in the sequence
      updatedManifestData.sequences[0].canvases.splice(action.canvasIndex, 0, action.canvas);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DUPLICATE_CANVAS_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // make a copy of the canvas to duplicate
      var duplicatedCanvas = deepcopy(state.manifestData.sequences[0].canvases[action.canvasIndex]);

      // update fields in the duplicated canvas object that need to be modified
      duplicatedCanvas['@id'] = "http://" + uuidv4();

      // insert the new canvas record to the right of the current canvas
      updatedManifestData.sequences[0].canvases.splice(action.canvasIndex + 1, 0, duplicatedCanvas);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DELETE_CANVAS_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // delete the canvas at the given index from the first sequence
      updatedManifestData.sequences[0].canvases.splice(action.canvasIndex, 1);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DELETE_MANIFEST_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // delete the manifest at the given index from the first sequence
      updatedManifestData.manifests.splice(action.manifestIndex, 1);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'DELETE_COLLECTION_MANIFEST_AT_INDEX':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // delete the manifest at the given index from the first sequence
      var collection = updatedManifestData.collections[action.collectionIndex];
	  collection.manifests.splice(action.manifestIndex, 1);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
	  };
    case 'SET_SELECTED_CANVAS_ID':
      return Object.assign({}, state, {
        ...state,
        selectedCanvasId: action.selectedCanvasId,
        error: undefined
      });
    case 'SET_SELECTED_MANIFEST_ID':
      return Object.assign({}, state, {
        ...state,
        selectedManifestId: action.selectedManifestId,
        error: undefined
      });
    case 'SET_SELECTED_MANIFEST_INDEX':
      return Object.assign({}, state, {
        ...state,
        selectedManifestIndex: action.selectedManifestIndex,
        error: undefined
      });
    case 'SET_SELECTED_COLLECTION_INDEX':
      return Object.assign({}, state, {
        ...state,
        selectedCollectionIndex: action.selectedCollectionIndex,
        error: undefined
      });
    case 'REORDER_CANVASES':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // reorder canvases in sequence according to updatedSortOrder
      function updateSortOrder(arr, sortArr) {
        var result = [];
        for(var i = 0; i < arr.length; i++) {
          result[i] = arr[sortArr[i]];
        }
        return result;
      }
      updatedManifestData.sequences[0].canvases = updateSortOrder(state.manifestData.sequences[0].canvases, action.updatedSortOrder);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'MOVE_COLLECTION':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

	  var movingCollection = updatedCollectionData.collections.splice(action.currentCollectionIndex, 1);

      updatedManifestData.collections.splice(action.newCollectionIndex, 0, movingCollection);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'REORDER_COLLECTIONS':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // reorder collections in sequence according to updatedSortOrder
      function updateSortOrder(arr, sortArr) {
        var result = [];
        for(var i = 0; i < arr.length; i++) {
          result[i] = arr[sortArr[i]];
        }
        return result;
      }
      updatedManifestData.collections = updateSortOrder(state.manifestData.collections, action.updatedSortOrder);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'REVERSE_SEQUENCE':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      updatedManifestData.sequences[0].canvases = state.manifestData.sequences[0].canvases.reverse();

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'START_IMAGE_ANNOTATION_FETCH':
      return Object.assign({}, state, {
        isFetchingImageAnnotation: true,
        error: undefined
      });
    case 'COMPLETE_IMAGE_ANNOTATION_FETCH':
      return Object.assign({}, state, {
        isFetchingImageAnnotation: false
      });
    case 'ADD_MANIFEST_TO_COLLECTION':
    case 'UPDATE_MANIFEST_IN_COLLECTION':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      var manifest = updatedManifestData.manifests[action.manifestIndex];
      manifest['@id'] = action.manifestUri;

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'UPDATE_COLLECTION_MANIFEST_IN_COLLECTION':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      var collections = updatedManifestData.collections[action.collectionIndex];
	  var manifest = collections.manifests[action.manifestIndex];

      manifest['@id'] = action.manifestUri;

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'ADD_IMAGE_ANNOTATION_TO_CANVAS':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // insert the empty canvas at the given index in the sequence
      var canvasToAnnotate = updatedManifestData.sequences[0].canvases[action.canvasIndex];
      var numImagesOnCanvas = canvasToAnnotate.images.length;
      if(numImagesOnCanvas > 0) {
        // delete existing image annotation
        canvasToAnnotate.images.pop();
        canvasToAnnotate.images[0] = action.imageAnnotation;
      } else {
        canvasToAnnotate.images.push(action.imageAnnotation);
      }
      // set the canvas dimensions to the image dimensions
      canvasToAnnotate.width = action.imageAnnotation.resource.width;
      canvasToAnnotate.height = action.imageAnnotation.resource.height;

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'RENAME_CANVAS_LABELS_BY_PAGINATION':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // automatically rename canvas labels in sequence
      function renameCanvasLabelsByPagination(canvases, canvasIndexOffset) {
        var renamedCanvases = [];
        var canvasLabelCounter = 1;
        for(var canvasIndex = 0; canvasIndex < canvases.length; canvasIndex++) {
          if(canvasIndex >= canvasIndexOffset) {
            canvases[canvasIndex].label = canvasLabelCounter.toString();
            canvasLabelCounter++;
          }
          renamedCanvases[canvasIndex] = canvases[canvasIndex];
        }
        return renamedCanvases;
      }
      updatedManifestData.sequences[0].canvases = renameCanvasLabelsByPagination(state.manifestData.sequences[0].canvases, action.canvasIndexOffset);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'RENAME_CANVAS_LABELS_BY_FOLIATION':
      // make a copy of the manifest data to update
      var updatedManifestData = {
        ...state.manifestData
      };

      // automatically rename canvas labels in sequence
      function renameCanvasLabelsByFoliation(canvases, canvasIndexOffset, startWithFoliationSide) {
        var renamedCanvases = [];
        var foliationSide = (startWithFoliationSide == 'recto') ? 'r' : 'v';
        var canvasLabelCounter = 1;
        for(var canvasIndex = 0; canvasIndex < canvases.length; canvasIndex++) {
          if(canvasIndex >= canvasIndexOffset) {
            // append the foliation side to the canvas label
            canvases[canvasIndex].label = canvasLabelCounter + foliationSide;

            // increment the canvas label counter when the foliation side changes to verso
            if(foliationSide == 'v') {
              canvasLabelCounter++;
            }

            // toggle the foliation side 
            foliationSide = (foliationSide == 'r') ? 'v' : 'r';
          }

          renamedCanvases[canvasIndex] = canvases[canvasIndex];
        }
        return renamedCanvases;
      }
      updatedManifestData.sequences[0].canvases = renameCanvasLabelsByFoliation(state.manifestData.sequences[0].canvases, action.canvasIndexOffset, action.startWithFoliationSide);

      // update the manifesto object with the updated manifest data by re-creating the entire manifesto object
      var updatedManifestoObject = manifesto.create(JSON.stringify(updatedManifestData));

      // return the updated manifest data with the original state variables
      return {
        ...state,
        manifestoObject: updatedManifestoObject,
        manifestData: updatedManifestData
      };
    case 'SET_SHOW_METADATA_SIDEBAR':
      return Object.assign({}, state, {
        showMetadataSidebar: action.showMetadataSidebar
      });
    case 'SET_ERROR':
      return Object.assign({}, state, {
        error: { type: action.errorType, message: action.errorMessage }
      });
    case 'RESET_ERROR':
      return Object.assign({}, state, {
        error: undefined
      });
    case 'SET_TREE_DATA':
      return Object.assign({}, state, {
        treeData: action.treeData
      });
	case 'ADD_COLLECTION_TREE_MANIFEST':
      // make a copy of the tree data to update
      var updatedTreeData = {
        ...state.treeData
      };

//      var flatTree = getFlatDataFromTree(updatedTreeData, keyFromKey);

//	  updatedTreeData = addNodeUnderParent({treeData: updatedTreeData, 
//		  parentKey: 1,
//		  newNode: { title: 'Added Manifest' },
//		  getNodeKey: keyFromTreeIndex});
		  //
	  updatedTreeData[0].children[0].children.push({title: 'New Manifest',
			  expanded: true, key: 5, type: 'manifest'});

      // return the updated manifest data with the original state variables
      return {
        ...state,
		treeData: [updatedTreeData[0]]
	  };
	case 'ADD_COLLECTION_TREE_COLLECTION':
      // make a copy of the tree data to update
      var updatedTreeData = {
        ...state.treeData
      };


	  updatedTreeData[0].children[1].children.push({title: 'New Collection',
			  expanded: true, key: 6, type: 'collection'});

      // return the updated manifest data with the original state variables
      return {
        ...state,
		treeData: [updatedTreeData[0]]
	  };
    default:
      return state;
  }
};
