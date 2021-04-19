import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { sendMessage } from '../../modules/message/actions';
import './style.css';


class SingleConversation extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      messageInput: '',
      showTimestamp: true,
    };
  }

  onChangeInput = (e) => {
    this.setState({
      messageInput: e.target.value,
    });
  }
  
  maybeSubmit = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.props.dispatcher.sendMessage(this.state.messageInput, this.props.conversationId);
      this.setState({
        messageInput: '',
      });
    }
  }

  render() {

    const FIVE_MINS = 5*60*1000;
    // {message timestamp interval, [array of messages for the interval]}
    let timeStampMap = new Map();

    const {
      messages,
    } = this.props;

    const {
      messageInput,
    } = this.state;

    // calculating 5 min intervals
    messages.forEach(message => {
      let currentTime = new Date(Date.now());
      let messageTime = new Date(message.createdAt);
      currentTime.setSeconds(0);
      currentTime.setMilliseconds(0);
      messageTime.setSeconds(0);
      messageTime.setMilliseconds(0);
      // console.log("current time: " + currentTime.getTime());
      // console.log("message time: " + messageTime.getTime());

      let key = Math.floor((currentTime.getTime() - messageTime.getTime()) / FIVE_MINS);
      
      if(!timeStampMap.has(key)){
        timeStampMap.set(key, [message]);
      } else {
        timeStampMap.get(key).push(message);
      }
    });

    // console.log(timeStampMap);

    let timeStampIntervals = [...timeStampMap.keys()];
    //console.log(timeStampIntervals);

    return (
      <div className="drift-sidebar-single-conversation--container">
        <div className="drift-sidebar-single-conversation-body">
        {}
          {/* {messages.map(message => <div key={message.id}>{message.body}</div>)} */}
          {
            timeStampIntervals.map(intervalKey => {
              if(intervalKey < 1){
                return <div key={intervalKey} className="drift-sidebar-single-conversation-timestamp">-Now-</div>
              } else if(intervalKey < 12){
                return <div key={intervalKey} className="drift-sidebar-single-conversation-timestamp">-{intervalKey * 5} mins ago-</div>
              } else {
                return <div key={intervalKey} className="drift-sidebar-single-conversation-timestamp">-More than an hour ago-</div>
              }
            })
          }
          {
            // ISSUE: Divs are not being appended to the correct parent node
            timeStampIntervals.map(intervalKey => {
              return (
                <div key={intervalKey}>{
                  timeStampMap.get(intervalKey).map(message => {
                    return <div key={message.id}>{message.body}</div> })
                }
                </div>)
              })
          }
        </div>
        <div className="drift-sidebar-single-conversation-input">
          <input placeholder="Type and press enter to send" value={messageInput} onChange={this.onChangeInput} onKeyDown={this.maybeSubmit} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const conversationId = state.conversation.selectedConversation;
  return {
    messages: state.message.byConversationId[conversationId] || [],
    conversationId,
  }
}

const mapDispatchToProps = dispatch => ({
  dispatcher: {
    sendMessage: (messageBody, conversationId) => dispatch(sendMessage({ body: messageBody, conversationId, })),
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(SingleConversation);
