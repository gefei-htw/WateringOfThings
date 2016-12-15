import React, { Component } from 'react';
import { View, Text, TouchableHighlight , StyleSheet, ListView, ActivityIndicator, ScrollView, Image } from 'react-native';
import WoTClient from '../../network/WoTClient';
import { NavbarButton } from '../../components';
import {colors, fonts, images} from '../../config';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Router } from '../../index';
import { Plant } from '../../database';


export default class HomeView extends Component {

  static route = {
    navigationBar: {
      renderTitle: () => { return (
        <Text style= {styles.headline}>
          <Icon name="tint" style={styles.icon} size={35} />
          Watering my Things
        </Text>
      );},
      renderLeft: () => {},
      renderRight: (params) => {
        return (<NavbarButton iconName='plus-square-o' route='plantEdit' routeParams={{controllerID: params.params.controllerID}}/>);
      }
    }
  }

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      loaded: true,
      client: new WoTClient(this.props.controllerID),
    };

    this.renderPlants = this.renderPlants.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentWillMount() {
    this._subscription = this.props.route.getEventEmitter().addListener('onFocus', () => {
      if (this.props.controllerID) {
        this.fetchData();
      }
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this._subscription.remove();
  }

  fetchData() {
    console.log('fetch');
    this.setState({loaded: false});
    this.state.client.getPlants()
    .then((responseJson) => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(responseJson),
        loaded: true
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderPlants}
            contentContainerStyle={styles.list}
            enableEmptySections={true}
          />
           <ActivityIndicator
              animating={!this.state.loaded}
              style={styles.activityIndicator}
          />
        </ScrollView>
      </View>
    );
  }

  renderPlants(plant) {
    return (
      <TouchableHighlight underlayColor={colors.touchFeedback} onPress={() =>
        this.onPlantPress(plant)}>
        <View>
          <View style={styles.row}>

            {this._setImage(plant)}

          </View>
        </View>
      </TouchableHighlight>
    );
  }

  _setImage(plant) {
    const plantDB = new Plant();
    const plantImageURL = plantDB.getPlantImagePath(plant.id);
    let imageURL = images.defaultPlantImage;
    if (plantImageURL) {
      imageURL = plantImageURL;
    }
    return (
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={imageURL}>
          <View style={styles.textBackground}>
            <Text style={styles.textStyle}>{plant.name}</Text>
          </View>
        </Image>
    </View>
    );
  }


  onPlantPress(plant) {
    this.props.navigator.push(Router.getRoute('plant', {plant: plant, controllerID: this.props.controllerID}));
  }
}

HomeView.propTypes = {
  navigator: React.PropTypes.object,
  route: React.PropTypes.object,
  controllerID: React.PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.defaultBackground,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  row: {
    margin: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.separator,
    backgroundColor: colors.defaultBackground,
    // borderBottomColor : colors.separator,
    // borderTopColor: colors.defaultBackground,
    // borderRightColor: colors.defaultBackground,
    // borderLeftColor: colors.defaultBackground,
    // borderStyle: 'solid',
    alignSelf: 'center',
    width: 170,
    height: 130,
  },
  imageContainer:{
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  image:{
    width: 170,
    height: 130,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textStyle: {
    color: colors.gridText,
    fontSize: fonts.listSize,
    fontFamily: fonts.defaultFamily,
    textAlign: 'center',
    width: 170,
  },
  textBackground: {
    backgroundColor: colors.gridTextBackground,
    justifyContent :'flex-end',
  },
  activityIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline:{
    fontSize: 25,
    fontFamily: fonts.defaultFamily,
    color: colors.navText,
    alignSelf: 'center',
  },
  icon: {
    paddingTop:30,
    paddingRight:20,
    marginRight:10,
    color: colors.navText,
  }
});
