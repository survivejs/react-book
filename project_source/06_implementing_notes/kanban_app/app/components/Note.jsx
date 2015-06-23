import React from 'react';

export default class Note extends React.Component {
  constructor(props: {
    value: string;
    onEdit: Function;
  }) {
    super(props);

    this.state = {
      edited: false,
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
          onBlur={this.finishEdit.bind(this)}
          onKeyPress={this.checkEnter.bind(this)}/>
        : <div onClick={this.edit.bind(this)}>{value}</div>
      }</div>
    );
  }
  edit() {
    this.setState({
        edited: true,
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
      edited: false,
    });
  }
}
