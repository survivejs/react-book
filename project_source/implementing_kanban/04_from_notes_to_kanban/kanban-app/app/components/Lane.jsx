import React from 'react';

export default ({lane, ...props}) => (
  <div {...props}>{lane.name}</div>
)