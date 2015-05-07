import Baobab from 'baobab';
import types from 'typology';

export default new Baobab({
    lanes: []
  }, {
    validate: (previousState, newState, affectedPaths) => {
      const schema = {
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
      };
      const valid = types.check(schema, newState);

      if(!valid) {
        const err = types.scan(schema, newState);

        console.error(err);

        return new Error(err.error);
      }
    }
  }
);
