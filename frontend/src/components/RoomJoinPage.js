import React, {Component} from "react";
import {TextField, Button, Grid, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";


export default class RoomsJoinPage extends Component{
    constructor(props){
        super(props);
        this.state= {
            roomCode:"",
            error:""
        };
        console.log("im in")
    }

    getCookie = name => {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    handleTextFieldChange = e => {
        this.setState({
            roomCode: e.target.value,
        })
    }

    enterRoomButton = () => {
        const csrfToken = this.getCookie('csrftoken')

        const requestOptions = {
            method:"POST",
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken':csrfToken,
            },
            body:JSON.stringify({
                code:this.state.roomCode,
            }),
        };
        fetch("/api/room/join/", requestOptions)
        .then(response => {
            if (response.ok){
                this.props.history.push(`/room/${this.state.roomCode}/`)
            }else{
                this.setState({error:"Room Not Found"})
            }
        }).catch(error => {
            console.log(error)
        })
    }   

    render(){
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Join Room 
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <TextField 
                        error={this.state.error}
                        label="Code"
                        placeholder="Enter Room Code"
                        value={this.state.roomCode}
                        helperText={this.state.error}
                        vairaint="outlined"
                        onChange={this.handleTextFieldChange}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={this.enterRoomButton}>Enter Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" to="/" component={Link}>Home</Button>
                </Grid>
            </Grid>
        );
    }
}