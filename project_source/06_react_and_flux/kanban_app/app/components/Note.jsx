import React from 'react';

export default class Note extends React.Component {
  constructor(props: {
    value: string;
    onEdit: Function;
  }) {
    super(props);

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
          onBlur={(e) => this.finishEdit(e)}
          onKeyPress={(e) => this.checkEnter(e)}/>
        : <div onClick={() => this.edit()}>{value}</div>
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
