import './services/WeChat';

import TaskRun from './services/TaskRun';
import Pages from './pages';
import { AppRegistry, DeviceEventEmitter } from 'react-native';
import "./utils/Date"

import { registerApp } from './services/WeChat';

AppRegistry.registerRunnable('RunableTask', TaskRun)

AppRegistry.runApplication('RunableTask', {});

AppRegistry.registerComponent('Bootstrap', () => Pages);

