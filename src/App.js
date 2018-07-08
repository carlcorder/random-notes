import React from 'react';
import './App.css';
import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyDSIoK8rCBbjQ5bmcRI9gB5ql8JHSd1kCk",
  authDomain: "random-notes.firebaseapp.com",
  databaseURL: "https://random-notes.firebaseio.com",
  projectId: "random-notes",
  storageBucket: "random-notes.appspot.com",
  messagingSenderId: "562833776925"
};

const firebaseDB = firebase.initializeApp(config).database().ref();

const getContent = (snapshot) => {
  const {time, ...content} = Object.values(snapshot.val()).pop();
  return content;
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {content: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
  
    // initialize textarea with newest content
    firebaseDB.orderByChild('time').limitToLast(1).once('value')
      .then(snap => this.setState(getContent(snap)));

    firebaseDB.on('child_changed', snapshot => {
      const {time, ...content} = snapshot.val();
      this.setState(content);
    });

  }

  // place unsaved notes in a temporary location
  async handleChange(event) {
    await this.setState({content: event.target.value});
    firebaseDB.update({
      'temp': {
        'content': this.state.content,
        'time': Date.now()
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    firebaseDB.push({
      'content': this.state.content,
      'time': Date.now()
    });
  }

  copyText() {
    // save note to clipboard
    document.getElementById('random-notes').select();
    document.execCommand("copy");
  }

  render() {
    return (
      <div>
        <form id="random-notes-form" onSubmit={this.handleSubmit}>
          <textarea class="form-control" id="random-notes" value={this.state.content} onChange={this.handleChange} placeholder="random notes go here.."></textarea>
        </form>
        <input form="random-notes-form" class="btn btn-secondary save" type="submit" value="Save" />
        <button class="btn btn-secondary copy" id="copy" onClick={this.copyText}>Copy</button>
      </div>
    );
  }
}

export default App;
