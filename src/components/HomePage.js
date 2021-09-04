import React, {Component} from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import {ButtonGroup, Button, Grid, Typography} from "@material-ui/core";
import {BrowserRouter as Router, Switch, Route, Link, Redirect} from "react-router-dom" 


export default class HomePage extends Component{
    constructor(props){
        super(props);
        this.state = {
            roomCode:null
        }
    }

    async componentDidMount(){
        fetch("/api/room/user-in/")
        .then(response => response.json())
        .then(data => {
             console.log("data: componentDidMount ",data.code)
             this.setState({
                 roomCode:data.code
            });
        });
    }

    clearRoomCode = () => {
        this.setState({
            roomCode:null
        });
    }
        
    renderHomePage = () => {
        return(
          <Grid container spacing={3}>
              <Grid item sm={12} align="center">
                  <Typography variant="h3" component="h3">
                        Wave Party
                  </Typography>
              </Grid>
              <Grid item sm={12} align="center">
                  <ButtonGroup  variant="contained" color="primary">
                      <Button color="primary" to="/join" component={Link}>Join Room</Button>
                      <Button color="secondary" to="/create" component={Link}>Create Room</Button>
                  </ButtonGroup>
              </Grid>
          </Grid>  
        );
    }


    render(){
        return (
            <Router>
                <Switch>
                    <Route 
                        exact path="/" 
                        render={() => {
                            return this.state.roomCode?<Redirect to={`/room/${this.state.roomCode}/`}/>:this.renderHomePage();
                        }}
                    />
                    <Route path="/join/" component={RoomJoinPage}/> 
                    <Route path="/create/" component={CreateRoomPage}/> 
                    <Route 
                        path="/room/:roomCode/"
                        render={ props => {
                            return <Room {...props} leaveRoomCallback={this.clearRoomCode}/>;
                        }}
                    /> 
                </Switch>
            </Router>
        );
    }
}