import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
  Image,
} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import { BookSearch } from 'react-native-google-books';
import { SearchBar, ListItem } from 'react-native-elements';

export default class BookRequestScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      bookName: '',
      reasonToRequest: '',
      IsExchangeRequestActive: '',
      requestedBookName: '',
      bookStatus: '',
      requestId: '',
      userDocId: '',
      docId: '',
      Imagelink: '',
      dataSource: '',
      showFlatlist: false,
      currencyCode: '',
      itemValue: '',
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }
  getUserDetails = () => {
    var email = firebase.auth().currentUser.email;
    db.collection('users')
      .where('email_id', '==', email)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var data = doc.data();
          this.setState({
            currencyCode: data.currencyCode,
          });
        });
      });
  };
  addRequest = async (bookName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
    var books = await BookSearch.searchbook(bookName, '');
    console.log('here in add request');
    db.collection('requested_items').add({
      user_id: userId,
      book_name: bookName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      book_status: 'requested',
      item_value: this.state.itemValue,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      image_link: books.data[0].volumeInfo.imageLinks.smallThumbnail,
    });

    await this.getBookRequest();
    db.collection('users')
      .where('email_id', '==', userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection('users').doc(doc.id).update({
            IsExchangeRequestActive: true,
          });
        });
      });

    this.setState({
      bookName: '',
      reasonToRequest: '',
      requestId: randomRequestId,
    });

    return Alert.alert('Book Requested Successfully');
  };

  receivedBooks = (bookName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection('received_items').add({
      user_id: userId,
      book_name: bookName,
      request_id: requestId,
      bookStatus: 'received',
    });
  };

  getIsExchangeRequestActive() {
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IsExchangeRequestActive: doc.data().IsExchangeRequestActive,
            userDocId: doc.id,
            currencyCode: doc.data().currency_code,
          });
        });
      });
  }

  getBookRequest = () => {
    // getting the requested book
    var bookRequest = db
      .collection('requested_books')
      .where('user_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().book_status !== 'received') {
            this.setState({
              requestId: doc.data().request_id,
              requestedBookName: doc.data().book_name,
              bookStatus: doc.data().book_status,
              itemValue: doc.data().item_value,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    //to get the first name and last name
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;

          // to get the donor id and book nam
          db.collection('all_notifications')
            .where('request_id', '==', this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var bookName = doc.data().book_name;

                //targert user id is the donor id to send notification to the user
                db.collection('all_notifications').add({
                  targeted_user_id: donorId,
                  message:
                    name + ' ' + lastName + ' received the book ' + bookName,
                  notification_status: 'unread',
                  book_name: bookName,
                });
              });
            });
        });
      });
  };

getData(){
  fetch("http://data.fixer.io/api/latest?access_key=ddb011ee4e967d23632b766666e611cf")
  .then(response=>{
    return response.json();
  }).then(responseData =>{
    var currencyCode = this.state.currencyCode
    var currency = responseData.rates.INR
    var value =  69 / currency
    console.log(value);
  })
  }

  componentDidMount() {
    this.getBookRequest();
    this.getIsExchangeRequestActive();
    this.getIsExchangeRequestActive();
  }

  updateBookRequestStatus = () => {
    //updating the book status after receiving the book
    db.collection('requested_books').doc(this.state.docId).update({
      book_status: 'received',
    });

    //getting the  doc id to update the users doc
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          //updating the doc
          db.collection('users').doc(doc.id).update({
            IsExchangeRequestActive: false,
          });
        });
      });
  };

  async getBooksFromApi(bookName) {
    this.setState({ bookName: bookName });
    if (bookName.length > 2) {
      var books = await BookSearch.searchbook(
        bookName,
        'AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc'
      );
      this.setState({
        dataSource: books.data,
        showFlatlist: true,
      });

      // console.log("here is the book data volume " ,books.data[0].volumeInfo.title);
      // console.log("here is the book data volume " ,books.data[1].volumeInfo.title);
      // console.log("here is the book data volume " ,books.data[2].volumeInfo.title);
      // console.log("here is the book data volume " ,books.data[3].volumeInfo.title);
      // console.log("here is the book data volume " ,books.data[4].volumeInfo.title);
      // console.log("this is the self link ",books.data[0].selfLink);
      // console.log("thhis is the sale",books.data[0].saleInfo.buyLink);
      // this.setState({Imagelink:books.data[0].volumeInfo.imageLinks.smallThumbnail})
    }
  }

  //render Items  functionto render the books from api
  renderItem = ({ item, i }) => {
    console.log('image link ');

    let obj = {
      title: item.volumeInfo.title,
      selfLink: item.selfLink,
      buyLink: item.saleInfo.buyLink,
      imageLink: item.volumeInfo.imageLinks,
    };

    return (
      <TouchableHighlight
        style={{
          alignItems: 'center',
          backgroundColor: 'aqua',
          padding: 10,

          width: '90%',
        }}
        activeOpacity={0.6}
        underlayColor="green"
        onPress={() => {
          this.setState({
            showFlatlist: false,
            bookName: item.volumeInfo.title,
          });
        }}
        bottomDivider>
        <Text> {item.volumeInfo.title} </Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.IsExchangeRequestActive === true) {
      return (
        // Status screen

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View
            style={{
              borderColor: 'orange',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              margin: 10,
            }}>
            <Text>Book Name</Text>
            <Text>{this.state.requestedBookName}</Text>
          </View>
          <View
            style={{
              borderColor: 'orange',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              margin: 10,
            }}>
            <Text> Book Status </Text>

            <Text>{this.state.bookStatus}</Text>
          </View>
          <View
            style={{
              borderColor: 'orange',
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              margin: 10,
            }}>
            <Text> Item Value </Text>

            <Text>{this.state.itemValue}</Text>
          </View>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'orange',
              backgroundColor: 'orange',
              width: 300,
              alignSelf: 'center',
              alignItems: 'center',
              height: 30,
              marginTop: 30,
            }}
            onPress={() => {
              this.sendNotification();
              this.updateBookRequestStatus();
              this.receivedBooks(this.state.requestedBookName);
            }}>
            <Text>I recieved the book </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        // Form screen
        <View style={{ flex: 1 }}>
          <MyHeader title="Request Book" navigation={this.props.navigation} />

          <View>
            <TextInput
              style={styles.formTextInput}
              placeholder={'enter item name'}
              onChangeText={(text) => this.getBooksFromApi(text)}
              onClear={(text) => this.getBooksFromApi('')}
              value={this.state.bookName}
            />

            {this.state.showFlatlist ? (
              <FlatList
                data={this.state.dataSource}
                renderItem={this.renderItem}
                enableEmptySections={true}
                style={{ marginTop: 10 }}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <TextInput
                  style={[styles.formTextInput, { height: 300 }]}
                  multiline
                  numberOfLines={8}
                  placeholder={'Why do you want thee item'}
                  onChangeText={(text) => {
                    this.setState({
                      reasonToRequest: text,
                    });
                  }}
                  value={this.state.reasonToRequest}
                />
                  <TextInput
            style={styles.formTextInput}
            placeholder ={"Item Value"}
            maxLength ={8}
            onChangeText={(text)=>{
              this.setState({
                itemValue: text
              })
            }}
            value={this.state.itemValue}
          />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.addRequest(
                      this.state.bookName,
                      this.state.reasonToRequest
                    );
                  }}>
                  <Text>Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTextInput: {
    width: '75%',
    height: 35,
    alignSelf: 'center',
    borderColor: '#ffab91',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    padding: 10,
  },
  button: {
    width: '75%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ff5722',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop: 20,
  },
});
