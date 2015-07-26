import React from 'react';

export default class Editable extends React.Component {
  constructor(props: {
    value: string;
    onEdit: Function;
  }) {
    super(props);

    this.finishEdit = this.finishEdit.bind(this);
    this.checkEnter = this.checkEnter.bind(this);
    this.edit = this.edit.bind(this);
    this.renderEdit = this.renderEdit.bind(this);
    this.renderValue = this.renderValue.bind(this);

    this.state = {
      edited: false
    };
  }
  render() {
    const {value, onEdit, ...props} = this.props;
    const edited = this.state.edited;

    return <div {...props}>
      {edited ? this.renderEdit() : this.renderValue()}
    </div>;
  }
  renderEdit() {
    return <input type='text'
      defaultValue={this.props.value}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter}/>;
  }
  renderValue() {
    return <div onClick={this.edit}>{this.props.value}</div>;
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
