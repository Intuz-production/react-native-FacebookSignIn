//The MIT License (MIT)
//
//Copyright (c) 2020 INTUZ
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import React, { Component } from 'react'
import {
    SafeAreaView,
    Text,
    Alert,
    TouchableOpacity
} from 'react-native'

import styles from './styles'

import AsyncStorage from '@react-native-community/async-storage';
import { AccessToken, LoginManager } from 'react-native-fbsdk';


class LoginViewController extends Component {

    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            userData: null
        }
    }

    async componentDidMount() {
        try {
            const value = await AsyncStorage.getItem('userInfo')
            if (value !== null) {
                this.setState({
                    userData: JSON.parse(value)
                })
            }
        } catch (e) {
            // error reading value
        }
    }

    onFacebookPress() {
        var context = this;
        LoginManager.logOut();        
        LoginManager.logInWithPermissions(["public_profile"]).then(
            function (result) {
                if (result.isCancelled) {
                    console.log("Login cancelled");
                } else {
                    console.log(
                        "Login success with permissions: " +
                        result.grantedPermissions.toString()
                    );
                    AccessToken.getCurrentAccessToken().then(
                        (data) => {
                            console.log(data.accessToken.toString())
                            fetch('https://graph.facebook.com/v2.5/me?fields=picture,email,name,friends&access_token=' + data.accessToken.toString())
                                .then((response) => response.json())
                                .then((user) => {
                                    context.setState({
                                        userData: user
                                    })
                                    var tempUser = JSON.stringify(user)
                                    try {
                                        AsyncStorage.setItem('userInfo', tempUser)
                                    } catch (e) {
                                        // saving error
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                }).done();
                        }
                    )
                }
            },
            function (error) {
                console.log("Login fail with error: " + error);
            }
        )
    }

    onLogoutTapped() {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => this.onLogout() },
            ],
            { cancelable: true }
        )
    }

    onLogout() {
        LoginManager.logOut();
        this.setState({ userData: null });
        AsyncStorage.removeItem("userInfo", () => { });
    }


    render() {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                {
                    this.state.userData != null ?
                        <TouchableOpacity style={styles.subLogoutContainer} onPress={this.onLogoutTapped.bind(this)}>
                            <Text>Welcome {this.state.userData.name}! Touch to Logout!</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.subLogoutContainer} onPress={this.onFacebookPress.bind(this)}>
                            <Text >Continue with Facebook custom UI button</Text>
                        </TouchableOpacity>
                }
            </SafeAreaView >
        )
    }
}
export default LoginViewController