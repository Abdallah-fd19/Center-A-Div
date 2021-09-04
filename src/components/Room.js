import React, {Component} from "react";
import {Button, Grid, Typography} from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";


export default class Room extends Component {
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 1,
            guestCanPause: false,
            isHost: false,
            showSettings:false,
            spotifyAuthenticated:false,
            song:{}
        };
        // react Routers adds match to props => stores all the information on how we got to this component
        this.roomCode = this.props.match.params.roomCode 
        console.log("roomCode: constructor: ",this.roomCode);
        console.log("props: ", this.props);
        this.getRoomDetails();
    }

    componentDidMount(){
        this.interval = setInterval(this.getCurrentSong, 1000)
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    getRoomDetails = () => {
        return fetch(`/api/room/?code=${this.roomCode}`)
        .then(response => {
            console.log(response)
            if(!response.ok){
                console.log('in response')
                this.props.leaveRoomCallback();
                this.props.history.push("/");
            }
            return response.json();
        })
        .then(data => {
            console.log("data: roomdetails: ",data)
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host,
            })
            if(this.state.isHost){
                this.authenticateSpotify(); 
            }
        });
    }

    authenticateSpotify = () => {
        fetch("/spotify/is-authenticated/")
        .then(response => response.json())
        .then(data => {
            this.setState({
                spotifyAuthenticated:data.satus
            });
            console.log("checking authorization")
            console.log('data: ',data)
            if (!data.status){
                fetch("/spotify/get-auth-url/")
                .then(response => response.json())
                .then(data => {
                    console.log("getting authorized")
                    window.location.replace(data.url);
                });
            }
        })
    };

    getCookie = name => {
        var cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    leaveButton = () => {
        console.log("roomCode: leavebutton: ",this.roomCode)
        
        const csrfToken = this.getCookie("csrftoken")

        const requestOptions = {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "X-CSRFToken":csrfToken,
            }
        };

        fetch("/api/room/leave/", requestOptions)
        .then(response => {
            console.log("left room")
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }

    updateShowSettings = value => {
        this.setState({
            showSettings: value
        });
    }

    renderSettingsButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>Settings</Button>
            </Grid>
        );
    }

    renderSettings = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage update={true} votesToSkip={this.state.votesToSkip} guestCanPause={this.state.guestCanPause} roomCode={this.roomCode} updateCallback={this.getRoomDetails}></CreateRoomPage>
                </Grid>
                <Grid item xs={12} align="center">
                    <Grid item xs={12} align="center">
                        <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>Close</Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    getCurrentSong = () => {
        fetch("/spotify/current-song/")
        .then(response => {
            if (!response.ok){
                return {}
            }
            return response.json();
        })
        .then(data => {
            this.setState({song:data});
            console.log('song: ',data)
        })
    }

    render(){
        if(this.state.showSettings){
            return this.renderSettings();
        }
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode} 
                    </Typography>
                </Grid>
                <MusicPlayer {...this.state.song} />
                 {this.state.isHost ? this.renderSettingsButton(): null}
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={this.leaveButton}>Leave Room</Button>
                </Grid>
            </Grid>
        );
    }
}