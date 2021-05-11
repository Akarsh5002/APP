import React from 'react';
import { createAppContainer, createSwitchNavigator,} from 'react-navigation';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from './screens/WelcomeScreen';
import { AppDrawerNavigator } from './components/AppDrawerNavigator'
import { AppTabNavigator } from './components/AppTabNavigator'
import Drawer from './components/CustomSideBarMenu'

export default function App() {
  return (
     
    <AppContainer/>
    
  );
}


const switchNavigator = createSwitchNavigator({
//  WelcomeScreen:{screen: WelcomeScreen},
  Drawer:{screen: AppDrawerNavigator},
  BottomTab: {screen: AppTabNavigator},
})

const AppContainer =  createAppContainer(switchNavigator);