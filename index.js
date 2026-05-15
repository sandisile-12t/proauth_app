import {AppRegistry} from 'react-native';
import App from './App';   // this points to your App.js
import {name as appName} from './app.json';

// Register the root component
AppRegistry.registerComponent(appName, () => App);
