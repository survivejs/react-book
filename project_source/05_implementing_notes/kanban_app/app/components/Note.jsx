import React from 'react';

export default class Note extends React.Component {
  constructor(props: {
    value: string;
    onEdit: Function;
  }) {
    super(props);

    this.finishEdit = this.finishEdit.bind(this);
    this.checkEnter = this.checkEnter.bind(this);
    this.edit = this.edit.bind(this);

    this.state = {
      edited: false
    };
  }
  render() {
    const {value, onEdit, ...props} = this.props;
    var edited = this.state.edited;

    return (
      <div {...props}>{
        edited
        ? <input type='text'
          defaultValue={value}
          onBlur={this.finishEdit}
          onKeyPress={this.checkEnter}/>
        : <div onClick={this.edit}>{value}</div>
      }</div>
    );
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
