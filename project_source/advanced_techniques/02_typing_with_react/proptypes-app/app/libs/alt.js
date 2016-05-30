import Alt from 'alt';
import makeFinalStore from 'alt-utils/lib/makeFinalStore';

class Flux extends Alt {
  constructor(config) {
    super(config);

    this.FinalStore = makeFinalStore(this);
  }
}

const flux = new Flux();

export default flux;