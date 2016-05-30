/* @flow */
import React from 'react';
import classnames from 'classnames';

const Editable = (props: {
  editing?: boolean,
  value?: string,
  onEdit: Function,
  className?: string
}) => {
  const {editing, className, value, onEdit} = props;

  if(editing) {
    return <Edit
      className={className}
      value={value}
      onEdit={onEdit} />;
  }

  return <span className={classnames('value', className)}>
    {value}
  </span>;
};

export default Editable;

class Edit extends React.Component {
  render() {
    const {className, value, ...props} = this.props;

    return <input
      type="text"
      className={classnames('edit', className)}
      autoFocus={true}
      defaultValue={value}
      onBlur={this.finishEdit}
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
