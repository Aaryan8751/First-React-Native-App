import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList,StyleSheet,Modal,Button, Alert,PanResponder, Share } from 'react-native';
import { Card, Icon ,Rating,Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite,postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment)),
})

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}



function RenderDish(props){
    const dish = props.dish;

    const recognizeDrage = ({moveX,moveY,dx,dy})=>{
        if (dx<-200){
            return true;
        }
        else{
            return false;
        }

    };

    const recognizeComment = ({moveX,moveY,dx,dy})=>{
        if (dx>200){
            return true;
        }
        else{
            return false;
        }
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e,gestureState) =>{
            return true;
        },

        onPanResponderEnd: (e,gestureState)=>{
            if (recognizeDrage(gestureState)){
                Alert.alert(
                    'Add to Favorites',
                    'Are you sure you wish to add'+ dish.name + 'to your favorites?',
                    [
                        {
                            text:'cancel',
                            onPress:()=>console.log('Cancel Pressed'),
                            style:'cancel'
                        },

                        {
                            text:'OK',
                            onPress: () => props.favorite ? console.log('Already favorite') : props.onPress()[0]

                        }

                    ],
                    {cancelable:false}
                )
            }

            else if(recognizeComment(gestureState)){
                props.onPress()[1]
            }
        }
    
    });

    const shareDish =(title,message,url)=>{
        Share.share({
            title:title,
            message: title+': '+message+ ' ' +url,
            url: url
        }, {
            dialogTitle:'Share ' + title
        });
    }

    if(dish){
        return(
            <Animatable.View animation='fadeInDown' duration={2000} delay={1000} {...panResponder.panHandlers} >
            <Card
            featuredTitle={dish.name}
            image={{uri: baseUrl + dish.image}}>
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
                <View style={{flex:1,flexDirection:"row",alignSelf:"center"}}>
                <Icon
                    raised
                    reverse
                    name={ props.favorite ? 'heart' : 'heart-o'}
                    type='font-awesome'
                    color='#f50'
                    onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()[0]}
                    />
                <Icon
                    raised
                    reverse
                    name={'pencil'}
                    type='font-awesome'
                    color='#512DA8'
                    onPress={() => props.onPress()[1]}
                    />
                <Icon
                    raised
                    reverse
                    name='share'
                    type='font-awesome'
                    color='#51D2A8'
                    onPress={() => shareDish(dish.name,dish.description,baseUrl+dish.image)}
                    />
                </View>
            </Card>
            </Animatable.View>
        );

    }
    else{
        return(<View></View>);
    }

};

class Dishdetail extends Component{

    constructor(props){
        super(props);

        this.state = {
            rating: 1,
            author: '',
            comment: '',
            showModal: false
        }
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(dishId) {
        console.log(JSON.stringify(this.state)+"dishId = "+dishId);
        this.props.postComment(dishId,this.state.rating,this.state.author,this.state.comment);
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            rating: 1,
            author: '',
            comment: '',
            showModal: false
        });
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    
    static navigationOptions={
        title:'Dish Details',

    }


    render(){

        const dishId =  this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => [this.markFavorite(dishId),this.toggleModal()]} 
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <ScrollView>
                    <View style = {styles.modal}>

                        <View style={styles.formRow}>
                        <Rating
                            showRating
                            count={5}
                            startingValue={1}
                            type="star"
                            onFinishRating={(rating)=> this.setState({rating:rating})}
                            />               
                        </View>
                        <View style={styles.formRow}>
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user' }}
                            defaultValue=''
                            onChangeText={(author)=> this.setState({author:author})}
                        />
                        </View>
                        <View style={styles.formRow}>
                        <Input
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment' }}
                            defaultValue=''
                            onChangeText={(comment)=> this.setState({comment:comment})}
                        />
                        </View>
                        <View style={styles.formRow}>
                        <Button 
                            onPress={() => this.handleComment(dishId)}
                            title="Submit"
                            color="#512DA8"
                            accessibilityLabel="Learn more about this purple button"
                            />
                        </View>
                        
                        <View style={styles.formRow}>
                        <Button 
                            onPress = {() =>{this.toggleModal(); this.resetForm();}}
                            title="Cancel"
                            color="gray"
                            />
                        </View>
                    </View>
                    </ScrollView>
                </Modal>
            
            </ScrollView>        
        );
    };
   
}

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin:20,
    },

    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 10
     },
});