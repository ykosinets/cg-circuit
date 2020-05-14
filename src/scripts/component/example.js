import '../helpers/jquery';

class Example {
  constructor($element, options) {
    this.$element = $element;
    this.options = options;
  }

  init() {
    console.log('Example initialized!');
  };
}

export default Example;
