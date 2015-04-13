'use strict';
import React from 'react';

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edited: false
    };
  }
  render() {
    var edited = this.state.edited;
    var task = this.props.task;

    return <div>{
      edited
      ? <input type='text'
        defaultValue={task}
        onBlur={this.finishEdit.bind(this)}
        onKeyPress={this.checkEnter.bind(this)}/>
      : <div onClick={this.edit.bind(this)}>{task}</div>
    }</div>;
  }
  edit() {
    this.setState({
        edited: true
    });
  }
  checkEnter(e) {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  }
  finishEdit(e) {
    this.props.onEdit(e.target.value);

    this.setState({
      edited: false
    });
  }
}
