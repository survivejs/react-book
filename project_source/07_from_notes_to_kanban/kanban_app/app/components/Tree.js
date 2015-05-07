import Baobab from 'baobab';

export default new Baobab({
    lanes: []
  }, {
    validate: {
      lanes: [{
        id: 'number',
        name: 'string',
        notes: [
          {
            id: 'number',
            task: 'string',
          }
        ]
      }]
    }
  }
);
