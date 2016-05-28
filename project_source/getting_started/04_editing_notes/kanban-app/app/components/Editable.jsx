import React from 'react';

export default ({editing, value, onEdit, ...props}) => {
  if(editing) {
    return <Edit value={value} onEdit={onEdit} {...props} />;
  }

  return <span {...props}>{value}</span>;
}

class Edit extends React.Component {
  render() {
    const {value, ...props} = this.props;

    return <input
      type="text"
      ref={
        element => element ?
        element.selectionStart = value.length :
        null
      }
      autoFocus={true}
      defaultValue={value}
      onKeyPress={this.checkEnter}
      {...props} />;
  }
  checkEnter = (e) => {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  }
  finishEdit = (e) => {
    const value = e.target.value;

    if(this.props.onEdit) {
      this.props.onEdit(value);
    }
  }
}
