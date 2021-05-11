import React, { Component } from 'react';
import { Header, Badge } from 'react-native-elements';
import { View, Text, StyleSheet, Alert } from 'react-native';
import NotificationScreen from '../screens/NotificationScreen';
import db from '../config';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
export default class MyHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }
  getNumberofUnreadNotifications = () => {
    db.collection('all_notifications')
      .where('notification_status', '==', 'unread')
      .onSnapshot((snapshot) => {
        var unreadNotifications = snapshot.docs.map((doc) => doc.data());
        this.setState({
          value: unreadNotifications.length,
        });
      });
  };
  componentDidMount() {
    this.getNumberofUnreadNotifications();
  }

  BellIconWithBadge = (props)=>{
  return(
    <View> 
     <Icon
        name= "bell"
        type = "font-awesome"
        color="aqua"
        size={25}
        onPress={()=>this.props.navigation.navigate('Notification')}
        /> 
        <Badge 
        value={this.state.value}
        containerStyle = {{position:'absolute',top:-4,right:-4,}}/>
        </View>
  )
}
  render() {
    return (
      <Header
        leftComponent={
          <Icon
            name="bars"
            type="font-awesome"
            color="orange"
            size={25}
            onPress={() => this.props.navigation.toggleDrawer()}
          />
        }
        rightComponent={<this.BellIconWithBadge {...this.props} />}
        centerComponent={{
          text: this.props.title,
          style: { color: '#90A5A9', fontSize: 20, fontWeight: 'bold' },
        }}
        backgroundColor="green"
      />
    );
  }
}
