var React = require('react');
var ReactDOM = require('react-dom');
var {Provider} = require('react-redux');
var {Route, Router, IndexRoute, hashHistory} = require('react-router');
var Main = require('Main');
var Home = require('Home');
var OpenManifest = require('OpenManifest');
var NewManifest = require('NewManifest');
var EditManifest = require('EditManifest');
var NewCollection = require('NewCollection');
var EditCollection = require('EditCollection');
var ImportCanvases = require('ImportCanvases');

var actions = require('actions');
var store = require('configureStore').configure();

// subscribe to changes
var unsubscribe = store.subscribe(() => {
  console.log('New state', store.getState());
});

require('style!css?sourceMap!sass!applicationStyles');
require('font-awesome/css/font-awesome.min.css');

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={Main}>
        <Route path="/manifest/open" component={OpenManifest} />
        <Route path="/manifest/new" component={NewManifest} />
        <Route path="/manifest/edit" component={EditManifest} />
        <Route path="/manifest/canvases" component={ImportCanvases} />
        <Route path="/collection/new" component={NewCollection} />
        <Route path="/collection/edit" component={EditCollection} />
        <IndexRoute component={Home}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
